// *********************************************************************************
// Runtime patch to stabilize webview view creation (Scheme A) without forking plugin-ext.
// It adds:
// 1. Reuse of existing WebviewView (handle) if a second creation attempt happens before resolve.
// 2. Defers actual WebviewWidget creation during early layout (prepareView) until resolver registered.
// The underlying plugin-ext version may already contain the fix; this patch is idempotent and will
// only wrap when necessary.
// *********************************************************************************

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

        // If underlying registry already exposes webviewViewObjects we assume patch (or upstream fix) exists.
        if (reg.__webviewViewStabilityPatched) {
            return; // already patched earlier
        }
        reg.__webviewViewStabilityPatched = true;

        // Ensure helper maps exist (don't override existing implementation state).
        if (!reg.webviewViewHandles) {
            reg.webviewViewHandles = new Map<string, string>();
        }
        if (!reg.webviewViewObjects) {
            reg.webviewViewObjects = new Map<string, any>();
        }

        const webviewViewHandles: Map<string, string> = reg.webviewViewHandles;
        const webviewViewObjects: Map<string, any> = reg.webviewViewObjects;

        // ----- Patch createNewWebviewView (reuse) -----
        if (typeof reg.createNewWebviewView === 'function') {
            const originalCreateNew = reg.createNewWebviewView.bind(this.registry);
            reg.createNewWebviewView = async (viewId: string) => {
                try {
                    const existingHandle = webviewViewHandles.get(viewId);
                    if (existingHandle) {
                        const existingWidget = this.widgetManager.tryGetWidget<WebviewWidget>(WebviewWidget.FACTORY_ID, <WebviewWidgetIdentifier>{ id: existingHandle, viewId });
                        if (existingWidget) {
                            const existingWrapper = webviewViewObjects.get(viewId);
                            if (existingWrapper) {
                                return existingWrapper; // reuse
                            }
                        }
                    }
                } catch {/* ignore reuse probe errors */ }
                const wrapper = await originalCreateNew(viewId);
                // Record wrapper for future reuse if upstream implementation didn't already do so.
                if (!webviewViewObjects.get(viewId)) {
                    webviewViewObjects.set(viewId, wrapper);
                }
                if (!webviewViewHandles.get(viewId) && wrapper?.webview?.identifier?.id) {
                    webviewViewHandles.set(viewId, wrapper.webview.identifier.id);
                }
                return wrapper;
            };
        }

        // ----- Patch createViewDataWidget (defer early creation) -----
        if (typeof reg.createViewDataWidget === 'function') {
            const originalCreateViewDataWidget = reg.createViewDataWidget.bind(this.registry);
            reg.createViewDataWidget = async (viewId: string, webviewId?: string) => {
                try {
                    const viewTuple = reg['views']?.get(viewId);
                    if (viewTuple && viewTuple[1]?.type === PluginViewType.Webview) {
                        // If resolver not yet registered, defer creation (avoid early layout double create race).
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
