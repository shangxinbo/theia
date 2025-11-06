// ============================================================================
// WebviewView 启动重复创建问题（调查 + 修复方案 A）
// ============================================================================
// 一、问题现象
//  插件侧注册的 WebviewProvider在某些情况下无法初始化，导致vscode.webviewProvider定义的webview视图无法显示内容
//  表现是 窗口中的right panel 和bottom panel 区域的webview视图为空白（theia的逻辑是用一个空白的Virtual document iframe先填充,之后用第二层iframe替代掉）
//  代码执行逻辑异像是，启动阶段插件视图（WebviewViewProvider 类型）在 provider.resolve 前出现两轮创建：
//  第一轮产生的 webview handle 很快被销毁；扩展侧仍持旧 handle 调用 $setHtml → Unknown webview handle，HTML 未注入。
//  日志中会明显有 Unknown webview xxx(viewId也就是theia唯一标识一个组件的id可以理解成webviewId) 报错出现。
//
// 二、关键日志特征（原始调查）：
//   createNewWebviewView:new -> storeMapping -> disposeMapping (第一批，尚未 resolve 就消失)
//   再次 createNewWebviewView:new (第二批成为现存集合)
//   register provider / resolve webviewView start (仍引用第一批 handle)
//   $setHtml start + Unknown webview handle（列出现存第二批）
//
// 三、根因总结
//   1) 启动存在两条初始化路径：
//      A. 布局恢复（ApplicationShell / ViewContainer 预构建）调用 prepareViewContainer -> prepareView。
//      B. 插件贡献收集完成后 initWidgets() 再跑一遍同样流程补齐视图。
//   2) 这两条路径均会触发 createViewDataWidget -> createWebviewWidget -> createNewWebviewView，缺少幂等去重。
//   3) 第一轮创建的 WebviewWidget 在第二轮容器重组时被销毁；扩展侧晚到（provider 注册 / resolve）继续使用已失效 handle，这里的handle就是viewId。
//   4) $setHtml 查找不到旧 handle → 报 Unknown（导致初始内容丢失）。
//
// 四、涉及 plugin-ext 关键文件与方法（供代码考古）：
//   plugin-ext/src/main/browser/view/plugin-view-registry.ts
//     - prepareViewContainer(viewContainerId, containerWidget)
//     - prepareView(widget)
//     - createViewDataWidget(viewId, webviewId?)
//     - createWebviewWidget(viewId, webviewId?)
//     - createNewWebviewView(viewId)
//   plugin-ext/src/main/browser/webview-views/webview-views-main.ts
//     - $registerWebviewViewProvider -> resolve 回调中获得 handle
//   plugin-ext/src/main/browser/webviews-main.ts
//     - $setHtml（问题表现点：Unknown webview handle）
//
// 五、为什么不直接“禁止第二轮”
//   双路径设计初衷：
//     - 第一轮：快速呈现容器框架（首屏加速）
//     - 第二轮：扩展贡献异步加载后补齐/刷新全部视图
//   去掉任一路径会牺牲启动体验或漏装增量视图，因此采取“第一轮不做不可逆创建”策略。
//
// 六、解决方案（当前补丁）的策略
//   1. 复用：createNewWebviewView 若发现已有（viewId→handle + wrapper）则直接返回，避免重复创建与新 handle 污染。
//   2. 延迟：在 resolver 未注册前 createViewDataWidget 对 WebviewView 返回 undefined，不提前创建真实 WebviewWidget，消除第一批“易被销毁”窗口。
//   3. 幂等：打补丁前检查 __webviewViewStabilityPatched 标记；重复加载不影响行为。
//   4. 兼容：若上游后续内置修复，可删除本文件；运行期补丁不更改类型定义，升级成本低。
//
// 七、当官方修复后theia/plugin-ext后升级后，撤销方式：
//   - 删除本文件并在前端模块中移除 bindWebviewViewStabilityPatch 绑定即可。
// ============================================================================
// 当前运行时补丁代码：包装 覆盖PluginViewRegistry中的 createNewWebviewView / createViewDataWidget 
// ============================================================================

import { injectable, inject } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { WidgetManager } from '@theia/core/lib/browser/widget-manager';
import { PluginViewRegistry } from '@theia/plugin-ext/lib/main/browser/view/plugin-view-registry';
import { WebviewWidget, WebviewWidgetIdentifier } from '@theia/plugin-ext/lib/main/browser/webview/webview';
import { PluginViewType } from '@theia/plugin-ext/lib/common';

@injectable()
export class WebviewViewStabilityPatch implements FrontendApplicationContribution {

    constructor(
        @inject(PluginViewRegistry) protected readonly registry: PluginViewRegistry,
        @inject(WidgetManager) protected readonly widgetManager: WidgetManager,
    ) { }

    onStart(): void {
        const reg: any = this.registry as any;

        if (reg.__webviewViewStabilityPatched) {
            return; // 已打过补丁
        }
        // 补丁标记
        reg.__webviewViewStabilityPatched = true;

        if (!reg.webviewViewHandles) {
            reg.webviewViewHandles = new Map<string, string>();
        }
        if (!reg.webviewViewObjects) {
            reg.webviewViewObjects = new Map<string, any>();
        }

        const webviewViewHandles: Map<string, string> = reg.webviewViewHandles;
        const webviewViewObjects: Map<string, any> = reg.webviewViewObjects;

        // 覆盖 createNewWebviewView
        if (typeof reg.createNewWebviewView === 'function') {
            const originalCreateNew = reg.createNewWebviewView.bind(this.registry);
            reg.createNewWebviewView = async (viewId: string) => {
                try {
                    // 尝试复用已有实例
                    const existingHandle = webviewViewHandles.get(viewId);
                    if (existingHandle) {
                        const existingWidget = this.widgetManager.tryGetWidget<WebviewWidget>(WebviewWidget.FACTORY_ID, <WebviewWidgetIdentifier>{ id: existingHandle, viewId });
                        if (existingWidget) {
                            const existingWrapper = webviewViewObjects.get(viewId);
                            if (existingWrapper) {
                                return existingWrapper; // 复用
                            }
                        }
                    }
                } catch {/* ignore reuse probe errors */ }
                const wrapper = await originalCreateNew(viewId);
                // 记录复用对象（若上游尚未设置）
                if (!webviewViewObjects.get(viewId)) {
                    webviewViewObjects.set(viewId, wrapper);
                }
                if (!webviewViewHandles.get(viewId) && wrapper?.webview?.identifier?.id) {
                    webviewViewHandles.set(viewId, wrapper.webview.identifier.id);
                }
                return wrapper;
            };
        }

        // 覆盖 createViewDataWidget：在 resolver 未注册时延迟（返回 undefined）
        if (typeof reg.createViewDataWidget === 'function') {
            const originalCreateViewDataWidget = reg.createViewDataWidget.bind(this.registry);
            reg.createViewDataWidget = async (viewId: string, webviewId?: string) => {
                try {
                    const viewTuple = reg['views']?.get(viewId);
                    if (viewTuple && viewTuple[1]?.type === PluginViewType.Webview) {
                        // resolver 未就绪：不创建，等后续再补（避免早期被销毁）
                        if (!reg['webviewViewResolvers']?.has(viewId)) {
                            return undefined;
                        }
                    }
                } catch {/* ignore guard errors */ }
                return originalCreateViewDataWidget(viewId, webviewId);
            };
        }
    }
}

export function bindWebviewViewStabilityPatch(bind: (serviceIdentifier: any) => any) {
    bind(WebviewViewStabilityPatch).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(WebviewViewStabilityPatch);
}
