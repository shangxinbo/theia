// *****************************************************************************
// Copyright (C) 2020 TORO Limited and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// This Source Code may also be made available under the following Secondary
// Licenses when the conditions for such availability set forth in the Eclipse
// Public License v. 2.0 are satisfied: GNU General Public License, version 2
// with the GNU Classpath Exception which is available at
// https://www.gnu.org/software/classpath/license.html.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
// *****************************************************************************

import { ConfirmDialog, Dialog, FormDialog, QuickInputService } from '@theia/core/lib/browser';
import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';
import { SelectComponent } from '@theia/core/lib/browser/widgets/select-component';
import {
    Command, CommandContribution, CommandMenu, CommandRegistry, ContextExpressionMatcher, MAIN_MENU_BAR,
    MenuContribution, MenuModelRegistry, MenuPath, MessageService
} from '@theia/core/lib/common';
import { OutputChannelManager, OutputChannelSeverity } from '@theia/output/lib/browser/output-channel';

import { inject, injectable, interfaces } from '@theia/core/shared/inversify';
import * as React from '@theia/core/shared/react';
import { ReactNode } from '@theia/core/shared/react';

const SampleCommand: Command = {
    id: 'sample-command',
    label: 'Sample Command'
};
const SampleCommand2: Command = {
    id: 'sample-command2',
    label: 'Sample Command2'
};
const SampleCommandConfirmDialog: Command = {
    id: 'sample-command-confirm-dialog',
    label: 'Sample Confirm Dialog'
};
const SampleComplexCommandConfirmDialog: Command = {
    id: 'sample-command-complex-confirm-dialog',
    label: 'Sample Complex Confirm Dialog'
};
const SampleCommandWithProgressMessage: Command = {
    id: 'sample-command-with-progress',
    label: 'Sample Command With Progress Message'
};
const SampleCommandWithIndeterminateProgressMessage: Command = {
    id: 'sample-command-with-indeterminate-progress',
    label: 'Sample Command With Indeterminate Progress Message'
};
const SampleQuickInputCommand: Command = {
    id: 'sample-quick-input-command',
    category: 'Quick Input',
    label: 'Test Positive Integer'
};
const SampleSelectDialog: Command = {
    id: 'sample-command-select-dialog',
    label: 'Sample Select Component Dialog'
};

const SampleSelectInputDialog: Command = {
    id: 'sample-command-select-input-dialog',
    label: 'Sample Select-input Component Dialog'
};

@injectable()
export class SampleCommandContribution implements CommandContribution {
    @inject(OutputChannelManager)
    protected readonly outputChannelManager: OutputChannelManager;
    @inject(QuickInputService)
    protected readonly quickInputService: QuickInputService;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand({ id: 'create-quick-pick-sample', label: 'Internal QuickPick' }, {
            execute: () => {
                const pick = this.quickInputService.createQuickPick();
                pick.items = [{ label: '1' }, { label: '2' }, { label: '3' }];
                pick.onDidAccept(() => {
                    console.log(`accepted: ${pick.selectedItems[0]?.label}`);
                    pick.hide();
                });
                pick.show();
            }
        });
        commands.registerCommand(SampleCommand, {
            execute: () => {
                alert('This is a sample command!');
            }
        });
        commands.registerCommand(SampleCommand2, {
            execute: () => {
                alert('This is sample command2!');

            }
        });
        commands.registerCommand(SampleCommandConfirmDialog, {
            execute: async () => {
                const choice = await new ConfirmDialog({
                    title: 'Sample Confirm Dialog',
                    msg: 'This is a sample with lots of text:' + Array(100)
                        .fill(undefined)
                        .map((element, index) => `\n\nExtra line #${index}`)
                        .join('')
                }).open();
                this.messageService.info(`Sample confirm dialog returned with: \`${JSON.stringify(choice)}\``);
            }
        });
        commands.registerCommand(SampleSelectInputDialog, {
            execute: async () => {
                // const mainDiv = document.createElement('div');
                // 创建主容器
                // 1. 创建并添加样式表到文档头部
                // const style = document.createElement('style');
                // style.textContent = `
                //     .form-container {
                //         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
                //         max-width: 400px;
                //         margin: 20px;
                //         padding: 25px;
                //         border-radius: 12px;
                //         background-color: #ffffff;
                //         box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                //         border: 1px solid #e0e0e0;
                //     }

                //     .form-group {
                //         margin-bottom: 20px;
                //     }

                //     .form-label {
                //         display: block;
                //         margin-bottom: 8px;
                //         font-weight: 500;
                //         color: #333;
                //         font-size: 14px;
                //     }

                //     .form-select, .form-input {
                //         width: 100%;
                //         padding: 12px 15px;
                //         border: 1px solid #ddd;
                //         border-radius: 6px;
                //         font-size: 15px;
                //         box-sizing: border-box;
                //         transition: all 0.2s ease;
                //         background-color: #fff;
                //     }

                //     .form-select {
                //         appearance: none;
                //         background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
                //         background-repeat: no-repeat;
                //         background-position: right 12px center;
                //         padding-right: 40px;
                //     }

                //     .form-select:focus, .form-input:focus {
                //         outline: none;
                //         border-color: #4a90e2;
                //         box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
                //     }

                //     .form-select:hover, .form-input:hover {
                //         border-color: #c0c0c0;
                //     }
                // `;
                // document.head.appendChild(style);

                const options = [
                    { value: '', label: '请选择一个选项' },
                    { value: 'opt1', label: '选项一' },
                    { value: 'opt2', label: '选项二' },
                    { value: 'opt3', label: '选项三' },
                    { value: 'opt4', label: '选项四' },
                    { value: 'opt5', label: '选项五' }
                ];

                const channel = this.outputChannelManager.getChannel('API Sample: my test channel');
                const dialog = new FormDialog({
                    title: 'Form Dialog',
                    fields: [
                        { label: '用户名', name: 'username', type: 'text', placeholder: '请输入用户名' },
                        { label: '密码', name: 'password', type: 'password', placeholder: '请输入密码' },
                        { label: '邮箱', name: 'email', type: 'email', placeholder: '请输入邮箱' },
                        { label: '复选框', name: 'checkbox', type: 'checkbox', placeholder: '请选择' },
                        { label: '选择选项', name: 'select', elementType: 'select', options: options, placeholder: '请选择一个选项' },
                        { label: 'textarea', name: 'textarea', elementType: 'textarea', placeholder: '请输入内容' },
                        {
                            label: '多选tag',
                            name: 'tag1',
                            elementType: 'tags',
                            options: options,
                            multiple: true,
                            value: ''
                        },
                        {
                            label: '单选tag',
                            name: 'tag2',
                            elementType: 'tags',
                            options: options,
                            multiple: false,
                            value: ''
                        }
                    ],
                    ok: '确定',
                    cancel: '取消'
                });
                const result = await dialog.open();
                console.log(result);
                channel.appendLine(`Form Dialog returned with: \`${JSON.stringify(result)}\``, OutputChannelSeverity.Warning);
            }
        });
        commands.registerCommand(SampleComplexCommandConfirmDialog, {
            execute: async () => {
                const mainDiv = document.createElement('div');
                for (const color of ['#FF00007F', '#00FF007F', '#0000FF7F']) {
                    const innerDiv = document.createElement('div');
                    innerDiv.textContent = 'This is a sample with lots of text:' + Array(50)
                        .fill(undefined)
                        .map((_, index) => `\n\nExtra line #${index}`)
                        .join('');
                    innerDiv.style.backgroundColor = color;
                    innerDiv.style.padding = '5px';
                    mainDiv.appendChild(innerDiv);
                }
                const choice = await new ConfirmDialog({
                    title: 'Sample Confirm Dialog',
                    msg: mainDiv
                }).open();
                this.messageService.info(`Sample confirm dialog returned with: \`${JSON.stringify(choice)}\``);
            }
        });
        commands.registerCommand(SampleSelectDialog, {
            execute: async () => {
                await new class extends ReactDialog<boolean> {
                    constructor() {
                        super({ title: 'Sample Select Component Dialog' });
                        this.appendAcceptButton(Dialog.OK);
                    }
                    protected override render(): ReactNode {
                        // 可不可以整一个组合的，上面选择框下面输入框
                        return React.createElement(SelectComponent, {
                            options: Array.from(Array(10).keys()).map(i => ({ label: 'Option ' + ++i })),
                            defaultValue: 0
                        });
                    }
                    override get value(): boolean {
                        return true;
                    }
                }().open().then((result) => {
                    this.messageService.info(`Sample select dialog returned with: \`${JSON.stringify(result)}\``);
                });
            }
        });
        commands.registerCommand(SampleQuickInputCommand, {
            execute: async () => {
                const result = await this.quickInputService.input({
                    placeHolder: 'Please provide a positive integer',
                    validateInput: async (input: string) => {
                        const numericValue = Number(input);
                        if (isNaN(numericValue)) {
                            return 'Invalid: NaN';
                        } else if (numericValue % 2 === 1) {
                            return 'Invalid: Odd Number';
                        } else if (numericValue < 0) {
                            return 'Invalid: Negative Number';
                        } else if (!Number.isInteger(numericValue)) {
                            return 'Invalid: Only Integers Allowed';
                        }
                    }
                });
                if (result) {
                    this.messageService.info(`Positive Integer: ${result}`);
                }
            }
        });
        commands.registerCommand(SampleCommandWithProgressMessage, {
            execute: () => {
                this.messageService
                    .showProgress({
                        text: 'Starting to report progress',
                    })
                    .then(progress => {
                        window.setTimeout(() => {
                            progress.report({
                                message: 'First step completed',
                                work: { done: 25, total: 100 }
                            });
                        }, 2000);
                        window.setTimeout(() => {
                            progress.report({
                                message: 'Next step completed',
                                work: { done: 60, total: 100 }
                            });
                        }, 4000);
                        window.setTimeout(() => {
                            progress.report({
                                message: 'Complete',
                                work: { done: 100, total: 100 }
                            });
                        }, 6000);
                        window.setTimeout(() => progress.cancel(), 7000);
                    });
            }
        });
        commands.registerCommand(SampleCommandWithIndeterminateProgressMessage, {
            execute: () => {
                this.messageService
                    .showProgress({
                        text: 'Starting to report indeterminate progress',
                    })
                    .then(progress => {
                        window.setTimeout(() => {
                            progress.report({
                                message: 'First step completed',
                            });
                        }, 2000);
                        window.setTimeout(() => {
                            progress.report({
                                message: 'Next step completed',
                            });
                        }, 4000);
                        window.setTimeout(() => {
                            progress.report({
                                message: 'Complete',
                            });
                        }, 6000);
                        window.setTimeout(() => progress.cancel(), 7000);
                    });
            }
        });
    }

}

@injectable()
export class SampleMenuContribution implements MenuContribution {
    registerMenus(menus: MenuModelRegistry): void {
        setTimeout(() => {
            // const subMenuPath = [...MAIN_MENU_BAR, 'sample-menu'];
            // menus.registerSubmenu(subMenuPath, 'Sample Menu', { sortString: '2' }); // that should put the menu right next to the File menu

            // menus.registerMenuAction(subMenuPath, {
            //     commandId: "webide.project.home",
            //     label: "Open Project",
            //     order: '0'
            // });
            // menus.registerMenuAction(subMenuPath, {
            //     commandId: SampleCommand2.id,
            //     order: '2'
            // });
            // const subSubMenuPath = [...subMenuPath, 'sample-sub-menu'];
            // menus.registerSubmenu(subSubMenuPath, 'Sample sub menu', { sortString: '2' });
            // menus.registerMenuAction(subSubMenuPath, {
            //     commandId: SampleCommand.id,
            //     order: '1'
            // });
            // menus.registerMenuAction(subSubMenuPath, {
            //     commandId: SampleCommand2.id,
            //     order: '3'
            // });
            // const placeholder = new PlaceholderMenuNode([...subSubMenuPath, 'placeholder'].join('-'), 'Placeholder', '0');
            // menus.registerCommandMenu(subSubMenuPath, placeholder);

            // /**
            //  * Register an action menu with an invalid command (un-registered and without a label) in order
            //  * to determine that menus and the layout does not break on startup.
            //  */
            // menus.registerMenuAction(subMenuPath, { commandId: 'invalid-command' });
        }, 10000);
    }
}

/**
 * Special menu node that is not backed by any commands and is always disabled.
 */
export class PlaceholderMenuNode implements CommandMenu {

    constructor(readonly id: string, public readonly label: string, readonly order?: string, readonly icon?: string) { }

    isEnabled(effectiveMenuPath: MenuPath, ...args: unknown[]): boolean {
        return false;
    }

    isToggled(effectiveMenuPath: MenuPath): boolean {
        return false;
    }
    run(effectiveMenuPath: MenuPath, ...args: unknown[]): Promise<void> {
        throw new Error('Should never happen');
    }
    getAccelerator(context: HTMLElement | undefined): string[] {
        return [];
    }

    get sortString(): string {
        return this.order || this.label;
    }

    isVisible<T>(effectiveMenuPath: MenuPath, contextMatcher: ContextExpressionMatcher<T>, context: T | undefined, ...args: unknown[]): boolean {
        return true;
    }

}

export const bindSampleMenu = (bind: interfaces.Bind) => {
    bind(CommandContribution).to(SampleCommandContribution).inSingletonScope();
    bind(MenuContribution).to(SampleMenuContribution).inSingletonScope();
};
