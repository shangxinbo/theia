// *****************************************************************************
// 首次拖拽进入 webview 区域遮罩层不出现 & tab 影像停滞问题增强修复
// 原因总结：
// 1) Lumino TabBar 拖拽是通过监听 document 的 mousemove 维持位置；第一次拖拽如果鼠标快速进入 iframe
//    在我们尚未禁用 iframe pointer-events 时，mousemove 被 iframe 截获，导致 dragData 不再更新。
// 2) overlay 的出现依赖于 DockPanel 的 drag 逻辑计算最新鼠标位置，位置冻结 -> overlay 不显示。
// 3) 回到 TabBar 再次移动，事件重新进入主文档，drag 状态恢复，之后再进入 webview 因为样式或之前的副作用已禁用命中而正常。
// 解决策略：
// - 用更可靠的拖拽状态检测：监听 TabBar 中的 `mousedown`(左键) + 后续的 `mousemove` 进入拖拽阈值。
// - 在确认进入拖拽模式的极早期(第一次超过阈值)立即禁用所有 webview iframe 的 pointer-events。
// - 附加一个周期性补偿定时器：若检测到 `.lm-mod-dragging` 类存在但我们尚未禁用 iframe，则立即补偿。
// - 在 `mouseup` 或 `dragend` 时恢复 pointer-events。
// - 可选触发一次伪 mousemove 以促使 DockPanel overlay 立即刷新位置。
// *****************************************************************************

import { injectable } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser/frontend-application-contribution';

@injectable()
export class DragWebviewEnhancedFixContribution implements FrontendApplicationContribution {
    protected dragging = false;
    protected iframesDisabled = false;
    protected originals: Array<{ el: HTMLIFrameElement; value: string | null }> = [];
    protected compensationTimer: number | undefined;
    protected debug = false; // 如需调试改为 true

    onStart(): void {
        document.addEventListener('mousedown', this.handleMousedown, true);
        document.addEventListener('mouseup', this.handleMouseup, true);
        // 保险：周期检查 drag 类是否出现但 iframe 还未禁用
        this.compensationTimer = window.setInterval(() => this.compensate(), 200);
    }

    protected log(...args: any[]): void {
        if (this.debug) {
            // eslint-disable-next-line no-console
            console.log('[DragWebviewEnhancedFix]', ...args);
        }
    }

    protected handleMousedown = (e: MouseEvent) => {
        if (e.button !== 0) {
            return; // 仅左键拖拽
        }
        // 启动候选拖拽：在后续 mousemove 时判定是否进入 lumino 拖拽
        document.addEventListener('mousemove', this.handleMousemoveEarly, true);
    };

    protected handleMousemoveEarly = (_e: MouseEvent) => {
        // 当 lumino 添加 .lm-mod-dragging 类即可视为正式进入拖拽
        if (document.querySelector('.lm-TabBar.lm-mod-dragging, .lm-TabBar-tab.lm-mod-dragging')) {
            document.removeEventListener('mousemove', this.handleMousemoveEarly, true);
            this.enterDragging();
        }
    };

    protected handleMouseup = (_e: MouseEvent) => {
        document.removeEventListener('mousemove', this.handleMousemoveEarly, true);
        if (this.dragging) {
            this.exitDragging();
        }
    };

    protected enterDragging(): void {
        if (this.dragging) {
            return;
        }
        this.dragging = true;
        this.disableIframePointerEvents();
        this.forceOverlayRefresh();
        this.log('enter dragging');
    }

    protected exitDragging(): void {
        this.dragging = false;
        this.restoreIframePointerEvents();
        this.log('exit dragging');
    }

    protected disableIframePointerEvents(): void {
        if (this.iframesDisabled) {
            return;
        }
        this.iframesDisabled = true;
        this.originals = [];
        const iframes = Array.from(document.querySelectorAll('.theia-webview iframe, .webview')) as HTMLIFrameElement[];
        for (const iframe of iframes) {
            this.originals.push({ el: iframe, value: iframe.style.pointerEvents || null });
            iframe.style.pointerEvents = 'none';
        }
        this.log('iframes pointer-events disabled');
    }

    protected restoreIframePointerEvents(): void {
        if (!this.iframesDisabled) {
            return;
        }
        for (const { el, value } of this.originals) {
            if (value === null) {
                el.style.removeProperty('pointer-events');
            } else {
                el.style.pointerEvents = value;
            }
        }
        this.originals = [];
        this.iframesDisabled = false;
        this.log('iframes pointer-events restored');
    }

    protected compensate(): void {
        // 若 lumino 已经处于拖拽，但我们尚未禁用 iframe
        const luminoDragging = !!document.querySelector('.lm-TabBar.lm-mod-dragging, .lm-TabBar-tab.lm-mod-dragging');
        if (luminoDragging && !this.iframesDisabled) {
            this.dragging = true;
            this.disableIframePointerEvents();
            this.forceOverlayRefresh();
            this.log('compensation applied');
        }
    }

    protected forceOverlayRefresh(): void {
        // 触发一次伪 mousemove 让 dock overlay 立即重新计算（避免首进冻结）
        const evt = new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientX: 0, clientY: 0 });
        document.dispatchEvent(evt);
    }

    dispose(): void {
        document.removeEventListener('mousedown', this.handleMousedown, true);
        document.removeEventListener('mouseup', this.handleMouseup, true);
        document.removeEventListener('mousemove', this.handleMousemoveEarly, true);
        if (this.compensationTimer) {
            clearInterval(this.compensationTimer);
        }
        this.restoreIframePointerEvents();
    }
}
