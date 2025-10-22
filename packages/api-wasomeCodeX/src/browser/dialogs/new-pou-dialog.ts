import { DraggableDialog } from './draggable-dialog';
import { AbstractDialog, DialogProps } from '@theia/core/lib/browser';

export interface NewPOUDialogProps {
    title?: string;
    ok?: string;
    cancel?: string;
    onCreate?: (data: Record<string, string>) => Promise<boolean>;
    getReturnTypes?: () => Promise<string[]>;
}

export interface SelectOption {
    value?: string
    label?: string
    separator?: boolean
    disabled?: boolean
    detail?: string
    description?: string
    markdown?: boolean
    userData?: string
}

export class NewPOU extends DraggableDialog<Record<string, string>> {
    protected readonly inputs: { [key: string]: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement } = {};
    protected returnTypeSelect: HTMLSelectElement;
    protected languageSelect: HTMLSelectElement;
    protected typeSelect: HTMLSelectElement;
    protected returnTypes: string[] = [];
    protected override props: NewPOUDialogProps & import('@theia/core/lib/browser').DialogProps;

    constructor(props: NewPOUDialogProps) {
        super({
            title: props.title || '新建POU',
            maxWidth: 420
        });
        this.props = Object.assign({}, props, { title: props.title || '新建POU', maxWidth: 420 });

        const formNode = document.createElement('table');
        formNode.style.width = '100%';
        formNode.style.background = '#f8fafd';
        formNode.style.borderRadius = '12px';
        formNode.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)';
        formNode.style.padding = '18px 12px 8px 12px';
        formNode.style.margin = '0 auto 8px auto';

        // 名称
        formNode.appendChild(this.createRow('名称', this.createInput('name', 'text', '请输入名称')));
        // 描述
        formNode.appendChild(this.createRow('描述', this.createInput('desc', 'text', '可选')));
        // 类型
        this.typeSelect = this.createSelect('type', [
            { value: '', label: '请选择类型' },
            { value: 'program', label: '程序块' },
            { value: 'function', label: '函数' },
            { value: 'functionBlock', label: '功能块' }
        ]);
        formNode.appendChild(this.createRow('类型', this.typeSelect));

        // 语言
        this.languageSelect = this.createSelect('language', [
            { value: '', label: '请选择语言' },
            { value: 'ST', label: 'ST' },
            { value: 'LD', label: 'LD' },
            { value: 'FBD', label: 'FBD' },
            { value: 'SFC', label: 'SFC' }
        ]);
        formNode.appendChild(this.createRow('语言', this.languageSelect));

        // 返回值类型
        this.returnTypeSelect = this.createSelect('returnType', [
            { value: '', label: '请选择返回值类型' }
        ]);
        this.returnTypeSelect.disabled = true;
        formNode.appendChild(this.createRow('返回值类型', this.returnTypeSelect));

        this.contentNode.appendChild(formNode);
        this.appendCloseButton(props.cancel || '取消');
        this.appendAcceptButton(props.ok || '确定');

        // 联动逻辑
        this.typeSelect.addEventListener('change', () => this.handleTypeChange());
        this.languageSelect.addEventListener('change', () => this.handleLanguageChange());

        // 获取返回值类型列表（接口预留）
        if (props.getReturnTypes) {
            props.getReturnTypes().then(types => {
                this.returnTypes = types;
                this.updateReturnTypeOptions();
            });
        }
    }

    protected createRow(label: string, input: HTMLElement): HTMLTableRowElement {
        const row = document.createElement('tr');
        row.style.height = '48px';
        const labelCell = document.createElement('td');
        labelCell.textContent = label;
        labelCell.style.width = '90px';
        labelCell.style.padding = '8px 10px 8px 0';
        labelCell.style.fontWeight = 'bold';
        labelCell.style.color = '#2d3a4a';
        labelCell.style.fontSize = '15px';
        const inputCell = document.createElement('td');
        inputCell.appendChild(input);
        inputCell.style.padding = '8px 0 8px 0';
        row.appendChild(labelCell);
        row.appendChild(inputCell);
        return row;
    }

    protected createInput(name: string, type: string, placeholder: string): HTMLInputElement {
        const input = document.createElement('input');
        input.type = type;
        input.name = name;
        input.className = 'theia-input';
        input.placeholder = placeholder;
        input.style.width = '100%';
        input.style.borderRadius = '6px';
        input.style.border = '1px solid #dbe2ea';
        input.style.background = '#fff';
        input.style.padding = '7px 10px';
        input.style.fontSize = '15px';
        this.inputs[name] = input;
        return input;
    }

    protected createSelect(name: string, options: { value: string, label: string }[]): HTMLSelectElement {
        const select = document.createElement('select');
        select.name = name;
        select.className = 'theia-input';
        select.style.width = '100%';
        select.style.borderRadius = '6px';
        select.style.border = '1px solid #dbe2ea';
        select.style.background = '#fff';
        select.style.padding = '7px 10px';
        select.style.fontSize = '15px';
        for (const opt of options) {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            select.appendChild(option);
        }
        this.inputs[name] = select;
        return select;
    }

    protected handleTypeChange(): void {
        const type = this.typeSelect.value;
        // 返回值类型只有函数时可用
        this.returnTypeSelect.disabled = type !== 'function';
        // SFC 语言只有类型为程序块时展示
        for (const opt of Array.from(this.languageSelect.options)) {
            if (opt.value === 'SFC') {
                opt.style.display = type === 'program' ? '' : 'none';
            }
        }
        // 切换类型时清空语言选择
        if (this.languageSelect.value === 'SFC' && type !== 'program') {
            this.languageSelect.value = '';
        }
    }

    protected handleLanguageChange(): void {
        // 语言变更时可做扩展
    }

    protected updateReturnTypeOptions(): void {
        // 只保留第一个“请选择返回值类型”
        this.returnTypeSelect.innerHTML = '';
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = '请选择返回值类型';
        this.returnTypeSelect.appendChild(defaultOpt);
        for (const t of this.returnTypes) {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            this.returnTypeSelect.appendChild(opt);
        }
    }

    get value(): Record<string, string> {
        const result: Record<string, string> = {};
        for (const name in this.inputs) {
            const input = this.inputs[name];
            if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
                result[name] = input.value;
            }
        }
        return result;
    }

    protected override async isValid(value: Record<string, string>, mode: 'open' | 'preview') {
        // 名称、类型、语言必填
        if (!value.name || !value.type || !value.language) {
            return '名称、类型、语言为必填项';
        }
        // 类型为函数时，返回值类型必选
        if (value.type === 'function' && !value.returnType) {
            return '函数类型必须选择返回值类型';
        }
        return '';
    }

    protected override async accept(): Promise<void> {
        if (!this.resolve) return;
        // 兼容 core 的 CancellationTokenSource
        if ((this as any).acceptCancellationSource && typeof (this as any).acceptCancellationSource.cancel === 'function') {
            this.acceptCancellationSource = new ((window as any).CancellationTokenSource || ((this as any).acceptCancellationSource.constructor))();
        } else {
            this.acceptCancellationSource = { token: {}, cancel: () => { } } as any;
        }
        this.acceptCancellationSource.cancel();
        const token = this.acceptCancellationSource.token;
        const value = this.value;
        const error = await this.isValid(value, 'open');
        if (token.isCancellationRequested) return;
        if (error) {
            this.setErrorMessage(error);
            return;
        }
        // 预留创建接口
        if (this.props.onCreate) {
            const success = await this.props.onCreate(value);
            if (success) {
                this.resolve(value);
                (window as any).Widget?.detach?.(this);
            } else {
                this.setErrorMessage('创建失败，请重试');
            }
        } else {
            this.resolve(value);
            (window as any).Widget?.detach?.(this);
        }
    }
};

export interface FormDialogField {
    label: string;
    name: string;
    elementType?: "input" | "select" | "textarea" | "tags" | "radio";
    type?: 'text' | 'number' | 'password' | 'email' | 'checkbox';
    options?: SelectOption[];
    disabled?: boolean;
    value?: string | boolean | any;
    placeholder?: string;
    multiple?: boolean; // tags用
    direction?: "vertical" | "horizontal"; // radio用
}

export interface FormDialogProps extends DialogProps {
    fields: FormDialogField[];
    ok?: string;
    cancel?: string;
}

export class FormDialog extends DraggableDialog<Record<string, string>> {
    protected readonly inputs: { [key: string]: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLDivElement } = {};
    protected readonly tagSelections: { [key: string]: Set<string> } = {};

    constructor(
        protected override readonly props: FormDialogProps
    ) {
        super(props);

        const formNode = this.node.ownerDocument.createElement('table');
        formNode.style.width = '100%';

        for (const field of props.fields) {
            const row = this.node.ownerDocument.createElement('tr');
            const labelCell = this.node.ownerDocument.createElement('td');
            labelCell.textContent = field.label;
            const inputCell = this.node.ownerDocument.createElement('td');
            let input: any = this.node.ownerDocument.createElement('input');

            if (field.elementType === 'radio') {
                // label放在上方
                labelCell.style.verticalAlign = 'top';
                labelCell.style.paddingTop = '8px';

                const radioGroupDiv = this.node.ownerDocument.createElement('div');
                radioGroupDiv.style.display = field.direction === 'horizontal' ? 'flex' : 'block';
                radioGroupDiv.style.gap = '12px';

                if (field.options) {
                    for (const option of field.options) {
                        const radioLabel = this.node.ownerDocument.createElement('label');
                        radioLabel.style.display = field.direction === 'horizontal' ? 'inline-flex' : 'flex';
                        radioLabel.style.alignItems = 'center'; // 垂直居中
                        radioLabel.style.marginRight = field.direction === 'horizontal' ? '16px' : '0';
                        radioLabel.style.marginBottom = field.direction === 'vertical' ? '8px' : '0';

                        const radioInput = this.node.ownerDocument.createElement('input');
                        radioInput.type = 'radio';
                        radioInput.name = field.name;
                        radioInput.value = option.value || '';
                        radioInput.disabled = !!field.disabled;
                        radioInput.className = 'theia-input';
                        radioInput.style.verticalAlign = 'middle'; // 垂直居中

                        if (field.value === option.value) {
                            radioInput.checked = true;
                        }
                        radioLabel.appendChild(radioInput);

                        const labelText = this.node.ownerDocument.createElement('span');
                        labelText.textContent = option.label || option.value || '';
                        labelText.style.marginLeft = '6px';
                        labelText.style.verticalAlign = 'middle'; // 垂直居中
                        radioLabel.appendChild(labelText);

                        radioGroupDiv.appendChild(radioLabel);
                    }
                }
                input = radioGroupDiv;
            } else if (field.elementType === 'tags') {
                // 标签区域整体样式
                const tagsDiv = this.node.ownerDocument.createElement('div');
                tagsDiv.style.display = 'block';
                tagsDiv.style.border = '1px dashed #bbb'; // 虚线边框
                tagsDiv.style.background = '#fafbfc';     // 浅灰背景
                tagsDiv.style.padding = '10px 8px';
                tagsDiv.style.margin = '2px 0';
                tagsDiv.style.borderRadius = '8px';
                tagsDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';

                this.tagSelections[field.name] = new Set<string>();
                if (field.options) {
                    for (const option of field.options) {
                        const tagRow = this.node.ownerDocument.createElement('div');
                        tagRow.style.marginBottom = '8px';
                        tagRow.style.width = '100%';

                        const tagBtn = this.node.ownerDocument.createElement('button');
                        tagBtn.type = 'button';
                        tagBtn.textContent = option.label || option.value || '';
                        tagBtn.style.marginLeft = "0px";
                        tagBtn.className = 'theia-button theia-tag-btn';
                        tagBtn.style.borderRadius = '12px';
                        tagBtn.style.padding = '4px 0';
                        tagBtn.style.background = '#f5f5f5';
                        tagBtn.style.border = '1px solid #ccc';
                        tagBtn.style.cursor = 'pointer';
                        tagBtn.style.color = '#444'; // 未选中黑灰色
                        tagBtn.style.fontWeight = 'normal';
                        tagBtn.style.width = '100%';
                        tagBtn.style.textAlign = 'center';
                        tagBtn.style.boxSizing = 'border-box';

                        tagBtn.dataset.value = option.value || '';

                        if (field.value && (field.multiple
                            ? field.value.split(',').includes(option.value || '')
                            : field.value === option.value)) {
                            tagBtn.classList.add('selected');
                            tagBtn.style.background = '#007acc';
                            tagBtn.style.color = '#fff';
                            tagBtn.style.fontWeight = 'bold';
                        }

                        tagBtn.onclick = () => {
                            if (field.multiple) {
                                if (this.tagSelections[field.name].has(option.value || '')) {
                                    this.tagSelections[field.name].delete(option.value || '');
                                    tagBtn.classList.remove('selected');
                                    tagBtn.style.background = '#f5f5f5';
                                    tagBtn.style.color = '#444';
                                    tagBtn.style.fontWeight = 'normal';
                                } else {
                                    this.tagSelections[field.name].add(option.value || '');
                                    tagBtn.classList.add('selected');
                                    tagBtn.style.background = '#007acc';
                                    tagBtn.style.color = '#fff';
                                    tagBtn.style.fontWeight = 'bold';
                                }
                            } else {
                                this.tagSelections[field.name].clear();
                                this.tagSelections[field.name].add(option.value || '');
                                tagsDiv.querySelectorAll('button').forEach(btn => {
                                    btn.classList.remove('selected');
                                    (btn as HTMLButtonElement).style.background = '#f5f5f5';
                                    (btn as HTMLButtonElement).style.color = '#444';
                                    (btn as HTMLButtonElement).style.fontWeight = 'normal';
                                });
                                tagBtn.classList.add('selected');
                                tagBtn.style.background = '#007acc';
                                tagBtn.style.color = '#fff';
                                tagBtn.style.fontWeight = 'bold';
                            }
                        };

                        tagRow.appendChild(tagBtn);
                        tagsDiv.appendChild(tagRow);
                    }
                }
                input = tagsDiv;
            } else if (field.elementType === 'select') {
                const select = this.node.ownerDocument.createElement('select');
                select.name = field.name;
                select.className = 'theia-input';
                select.ariaPlaceholder = field.placeholder || '';
                select.value = field.value || "";
                select.style.paddingLeft = '5px'
                if (field.options) {
                    for (const option of field.options) {
                        if (option.value == undefined) {
                            continue;
                        }
                        const optionElement = this.node.ownerDocument.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.label || option.value;
                        select.appendChild(optionElement);
                    }
                }
                input = select;
            } else if (field.elementType === 'textarea') {
                const textarea = this.node.ownerDocument.createElement('textarea');
                textarea.name = field.name;
                textarea.value = field.value || '';
                textarea.placeholder = field.placeholder || '';
                textarea.className = 'theia-input';
                input = textarea;
            } else {
                input.type = field.type || 'text';
                input.name = field.name;
                input.value = field.value || '';
                input.placeholder = field.placeholder || '';
                if (field.type === 'checkbox') {
                    input.type = 'checkbox';
                    input.checked = field.value || false;
                }
                input.className = 'theia-input';
            }
            if (field.elementType !== 'tags' && field.elementType !== 'radio' && field.type !== 'checkbox') {
                input.style.width = '100%';
            };
            if (field.disabled) {
                input.disabled = true;
            }
            inputCell.appendChild(input);
            row.appendChild(labelCell);
            row.appendChild(inputCell);
            formNode.appendChild(row);
            this.inputs[field.name] = input;
        }

        this.contentNode.appendChild(formNode);
        this.appendCloseButton(props.cancel);
        this.appendAcceptButton(props.ok);
    }

    protected override onActivateRequest(msg: any): void {
        super.onActivateRequest(msg);
        const firstInput = Object.values(this.inputs)[0];
        console.log('firstInput', firstInput);
        console.log('input', this.inputs);
        if (firstInput) {
            (firstInput as any)?.focus && (firstInput as any)?.focus();
        }
    }

    get value(): Record<string, string> {
        const result: Record<string, any> = {};
        for (const name in this.inputs) {
            const input = this.inputs[name];
            if (input instanceof HTMLDivElement && this.tagSelections[name]) {
                result[name] = Array.from(this.tagSelections[name]).join(',');
            } else if (input instanceof HTMLDivElement && input.querySelector('input[type="radio"]')) {
                // radio 取选中的值
                const checked = input.querySelector('input[type="radio"]:checked') as HTMLInputElement;
                result[name] = checked ? checked.value : '';
            } else if (input instanceof HTMLSelectElement) {
                result[name] = input.value;
            } else if (input instanceof HTMLInputElement && input.type === 'checkbox') {
                result[name] = input.checked ? true : false;
            } else {
                result[name] = (input as any).value;
            }
        }
        return result;
    }
}
