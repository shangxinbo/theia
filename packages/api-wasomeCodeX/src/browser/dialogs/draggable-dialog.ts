import { AbstractDialog } from '@theia/core/lib/browser';

export abstract class DraggableDialog<T> extends AbstractDialog<T> {
    private isDragging = false;
    private dragOffsetX = 0;
    private dragOffsetY = 0;

    protected override onAfterAttach(msg: any): void {
        super.onAfterAttach(msg);
        this.enableDrag();
    }

    protected enableDrag(): void {
        // 拖拽区域为标题栏（titleNode 的父节点），排除关闭按钮
        const titleBar = this.titleNode.parentElement as HTMLElement;
        const dialogBlock = this.node.querySelector('.dialogBlock') as HTMLElement;
        const closeBtn = (this as any).closeCrossNode as HTMLElement | undefined;
        if (!titleBar || !dialogBlock) return;

        titleBar.style.cursor = 'move';
        let startX = 0, startY = 0;
        let origLeft = 0, origTop = 0;

        titleBar.addEventListener('mousedown', (e: MouseEvent) => {
            // 如果点击的是关闭按钮，不触发拖拽
            if (e.button !== 0) return;
            if (closeBtn && (e.target === closeBtn || closeBtn.contains(e.target as Node))) return;
            this.isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = dialogBlock.getBoundingClientRect();
            origLeft = rect.left;
            origTop = rect.top;
            document.body.style.userSelect = 'none';
        });

        window.addEventListener('mousemove', (e: MouseEvent) => {
            if (!this.isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            dialogBlock.style.position = 'fixed';
            dialogBlock.style.left = origLeft + dx + 'px';
            dialogBlock.style.top = origTop + dy + 'px';
            dialogBlock.style.margin = '0';
        });

        window.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                document.body.style.userSelect = '';
            }
        });
    }
}
