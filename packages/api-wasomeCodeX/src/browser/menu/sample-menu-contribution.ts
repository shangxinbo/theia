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

import { CommonMenus, ConfirmDialog, Dialog, QuickInputService, SingleTextInputDialog, FormDialog, FormDialogField, CommonCommands } from '@theia/core/lib/browser';
import { ReactDialog } from '@theia/core/lib/browser/dialogs/react-dialog';
import { SelectComponent } from '@theia/core/lib/browser/widgets/select-component';
import {
    Command, CommandContribution, CommandMenu, CommandRegistry, ContextExpressionMatcher, MAIN_MENU_BAR,
    MenuContribution, MenuModelRegistry, MenuPath, MessageService,
    nls
} from '@theia/core/lib/common';
import { OutputChannelManager, OutputChannelSeverity } from '@theia/output/lib/browser/output-channel';

import { inject, injectable, interfaces } from '@theia/core/shared/inversify';
import { SearchInWorkspaceCommands } from '@theia/search-in-workspace/lib/browser/search-in-workspace-frontend-contribution';
// import { WorkspaceCommands } from '@theia/workspace/src/browser';
// import { FormDialog, FormDialogField } from "../dialogs";

const SampleSelectInputDialog: Command = {
    id: 'sample-command-select-input-dialog',
    label: 'Sample Select-input Component Dialog'
};

export namespace WasomeCommands {

    export const OPEN_WEBIDE_SETTING = Command.toDefaultLocalizedCommand({
        id: 'webide.setting',
        category: 'Preferences',
        label: 'Open Settings',
    });

    export const OPEN_HELP = Command.toDefaultLocalizedCommand({
        id: 'webide.project.showHelpPage',
        category: 'Preferences',
        label: 'Open Help',
    });

    export const PROJECT_HOME = Command.toDefaultLocalizedCommand({
        id: 'webide.project.home',
        category: 'Preferences',
        label: 'Open Project',
    });

    export const NEW_PROJECT = Command.toDefaultLocalizedCommand({
        id: 'webide.project.new',
        category: 'Preferences',
        label: 'New Project',
    });

    export const POU_NEW_PRG = Command.toDefaultLocalizedCommand({
        id: 'webide.pou.newPrg',
        category: 'Create',
        label: '新增程序（PRG）',
    });

    export const POU_NEW_FB = Command.toDefaultLocalizedCommand({
        id: 'webide.pou.newFb',
        category: 'Create',
        label: '新增功能块（FB）',
    });
    export const POU_NEW_ST = Command.toDefaultLocalizedCommand({
        id: 'webide.pou.newSt',
        category: 'Create',
        label: '新增程序（全ST）',
    });
    export const POU_NEW_FUNC = Command.toDefaultLocalizedCommand({
        id: 'webide.pou.newFunc',
        category: 'Create',
        label: '新增函数（FUNC）',
    });

    export const EVENT_NEW = Command.toDefaultLocalizedCommand({
        id: 'webide.event.new',
        category: 'Create',
        label: '新增系统事件',
    });

    export const POU_NEW_LIB = Command.toDefaultLocalizedCommand({
        id: 'webide.pou.newLib',
        category: 'Create',
        label: '新增用户库',
    });

    export const OPEN_DIALOG = Command.toDefaultLocalizedCommand({
        id: 'core.openDialog',
        label: 'Open Dialog'
    });

    export const FORM_DIALOG = Command.toDefaultLocalizedCommand({
        id: 'core.formDialog',
        label: 'Form Dialog'
    });

    export const OPEN_CROSS_REFERENCE = Command.toDefaultLocalizedCommand({
        id: 'webide.panel.crossReference',
        category: 'Preferences',
        label: '交叉引用',
    });

    export const OPEN_IDE_OUTPUT = Command.toDefaultLocalizedCommand({
        id: 'webide.panel.ideOutput',
        category: 'Preferences',
        label: '项目输出',
    });

}


export namespace WasomeMenus {

    export const FILE = [...MAIN_MENU_BAR, '1_file']; // 文件
    export const FILE_PROJECT = [...FILE, '1_project'];
    export const FILE_WINDOW = [...FILE, '2_window'];
    export const FILE_CLOSE = [...FILE, '6_close'];

    export const EDIT = [...MAIN_MENU_BAR, '2_edit']; // 编辑
    export const EDIT_SAVE = [...EDIT, '1_save']; // 保存
    export const EDIT_SEARCH = [...EDIT, '2_search']; // 搜索
    export const EDIT_CLOSE = [...EDIT, '3_close']; // 关闭编辑

    export const VIEW = [...MAIN_MENU_BAR, '3_view']; // 视图
    export const WELCOME = [...VIEW, '1_welcome']; // 起始页面
    export const CROSS_REFERENCE = [...VIEW, '3_cross_reference']; // 交叉引用
    export const PROJECT_OUTPUT = [...VIEW, '4_project_output']; // 项目输出
    export const TOOLBAR = [...VIEW, '5_toolbar']; // 工具栏

    export const PROJECT = [...MAIN_MENU_BAR, '4_project']; // 项目
    /**
     * 1. POU
     *  1.1 新增程序（PRG）
     *  1.2 新增程序（全ST）
     *  1.2 新增函数（FUN）
     *  1.3 新增功能块（FB）
     * 2. 全局变量
     *  2.1 新建全局变量组
     *  2.2 导入全局变量
     * 3. IO通道与组网
     * 4. 变量与监视
     *  4.1 变量全景图
     *  4.2 新建变量监视组
     * 5. 任务配置
     * 6. 变量跟踪（示波器）
     *  6.1 新建跟踪任务
     *  6.2 离线查看跟踪缓存数据
     * 6. 新建系统事件
     * 7. 上位机配置
     * 8. 系统库管理
     * 9. 新增用户库
     * 
     */
    export const POU = [...PROJECT, '1_pou']; // POU
    export const POU_NEW_PRG = [...POU, '1_new_prg'];
    export const POU_NEW_ST = [...POU, '2_new_st'];
    export const POU_NEW_FUNC = [...POU, '3_new_fun'];
    export const POU_NEW_FB = [...POU, '4_new_fb'];
    export const GLOBAL_VARIABLE = [...PROJECT, '2_global_variable']; // 全局变量
    export const GLOBAL_VARIABLE_NEW_GROUP = [...GLOBAL_VARIABLE, '1_new_group'];
    export const GLOBAL_VARIABLE_IMPORT = [...GLOBAL_VARIABLE, '2_import'];
    export const TRACE = [...PROJECT, '3_trace']; // 变量跟踪（示波器）
    export const TRACE_NEW_TASK = [...TRACE, '1_new_task']; // 新建跟踪任务
    export const TRACE_OFFLINE_VIEW = [...TRACE, '2_offline_view']; // 离线查看跟踪缓存数据
    export const VARIABLE = [...PROJECT, '4_variable']; // 变量与监视
    export const VARIABLE_NEW_WATCH_GROUP = [...VARIABLE, '2_new_watch_group']; // 新建变量监视组
    export const VARIABLE_PANORAMA = [...VARIABLE, '1_panorama']; // 变量全景视图
    export const EVENT = [...PROJECT, '5_new_event']; // 新增系统事件
    export const USER_LIBRARY = [...PROJECT, '6_user_library']; // 新增用户库
    export const IO_CHANNEL = [...PROJECT, '7_io_channel']; // IO通道与组网
    export const TASK = [...PROJECT, '8_task']; // 任务配置
    export const UPPER_MACHINE = [...PROJECT, '9_upper_machine']; // 上位机配置
    export const SYSTEM_LIBRARY = [...PROJECT, '9a_system_library']; // 系统库管理

    export const DEBUG = [...MAIN_MENU_BAR, '5_debug']; // 编译与调试

    export const IMPORT = [...MAIN_MENU_BAR, '6_import']; // 导入导出

    export const HELP = [...MAIN_MENU_BAR, '9_help']; // 帮助
    export const TO_HELP = [...MAIN_MENU_BAR, '9_help', '1_help'];

}

@injectable()
export class SampleCommandContribution implements CommandContribution {
    @inject(OutputChannelManager)
    protected readonly outputChannelManager: OutputChannelManager;
    @inject(QuickInputService)
    protected readonly quickInputService: QuickInputService;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;

    registerCommands(commands: CommandRegistry): void {

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
        commands.registerCommand(WasomeCommands.POU_NEW_PRG, {
            execute: () => this.webideCreate("PRG")
        });
        commands.registerCommand(WasomeCommands.POU_NEW_FB, {
            execute: () => this.webideCreate("FB")
        });
        commands.registerCommand(WasomeCommands.POU_NEW_FUNC, {
            execute: () => this.webideCreate("FUNC")
        });
        commands.registerCommand(WasomeCommands.POU_NEW_ST, {
            execute: () => this.webideCreate("ST")
        });

        commands.registerCommand(WasomeCommands.EVENT_NEW, {
            execute: () => this.webideCreate("EVENT")
        });

        commands.registerCommand(WasomeCommands.POU_NEW_LIB, {
            execute: () => this.webideCreate("LIB")
        });

        commands.registerCommand(WasomeCommands.FORM_DIALOG, {
            execute: async (title: string, fields: FormDialogField[]) => {
                const dialog = new FormDialog({
                    title: nls.localizeByDefault(title),
                    fields: fields,
                    ok: '确定',
                    cancel: '取消'
                });
                const result = await dialog.open();
                console.log(result);
                return result;
            }
        });

        commands.registerCommand(WasomeCommands.OPEN_DIALOG, {
            execute: async (title: string, initialValue?: string, placeholder?: string, valueSelection?: [number, number]) => {
                const initialSelectionRange = valueSelection ? {
                    start: valueSelection[0],
                    end: valueSelection[1],
                } : undefined;

                const dialog = new SingleTextInputDialog({
                    title: nls.localizeByDefault(title),
                    maxWidth: 600,
                    placeholder: nls.localizeByDefault(placeholder || '请输入'),
                    initialValue: initialValue,
                    initialSelectionRange: initialSelectionRange
                });
                const inputRet = await dialog.open();
                if (inputRet) {
                    return inputRet;
                };
                return undefined;
            },
            isVisible: () => true,
            isEnabled: () => true,
        });

        commands.registerCommand(WasomeCommands.OPEN_CROSS_REFERENCE, {
            execute: () => this.commandRegistry.executeCommand("webide-panel.crossReference.focus"),
        });

        commands.registerCommand(WasomeCommands.OPEN_IDE_OUTPUT, {
            execute: async (...args: any[]) => {
                // 获取之前创建的通道
                this.commandRegistry.executeCommand('output:toggle');
                const outputChannel = this.outputChannelManager.getChannel('Wasome WebIDE');
                // 显示输出面板并聚焦到该通道
                outputChannel.show();

            }
        });


    }

    protected webideCreate(type: string): void {
        let valueMap = new Map([
            ["PRG", "POU_PRGs"],
            ["FB", "POU_FBs"],
            ["FUNC", "POU_FUNCs"],
            ["ST", "POU_FULL_ST"],
            ["EVENT", "CateCallbacks"],
            ["LIB", "CateModules"],
        ])
        let node = {
            // contextValue: "AppItemFolder",
            contextValue: valueMap.get(type) || ""
        }
        this.commandRegistry.executeCommand("webide.app.addNew", node);
    }


}

@injectable()
export class SampleMenuContribution implements MenuContribution {
    registerMenus(menus: MenuModelRegistry): void {
        setTimeout(() => {
            menus.registerSubmenu(WasomeMenus.FILE, '文件');
            menus.registerSubmenu(WasomeMenus.EDIT, '编辑');
            menus.registerSubmenu(WasomeMenus.VIEW, '视图');
            menus.registerSubmenu(WasomeMenus.PROJECT, '项目');
            menus.registerSubmenu(WasomeMenus.DEBUG, '编译与调试');
            menus.registerSubmenu(WasomeMenus.IMPORT, '导入导出');
            menus.registerSubmenu(WasomeMenus.HELP, '帮助');

            menus.registerMenuAction(WasomeMenus.FILE_PROJECT, {
                commandId: "webide.project.new",
                label: '新建项目',
            });
            menus.registerMenuAction(WasomeMenus.FILE_PROJECT, {
                commandId: "workspace:openFolder",
                label: '打开项目'
            });

            menus.registerMenuAction(WasomeMenus.FILE_PROJECT, {
                commandId: "webide.project.home",
                label: '项目信息',
            });

            menus.registerMenuAction(WasomeMenus.FILE_PROJECT, {
                commandId: "webide.project.workspace",
                label: '项目空间',
            });

            menus.registerMenuAction(WasomeMenus.FILE_PROJECT, {
                commandId: "workspace:close",
                label: nls.localizeByDefault('关闭当前项目'),
            });

            menus.registerMenuAction(WasomeMenus.FILE_CLOSE, {
                commandId: "view.reload"
            });
            menus.registerMenuAction(WasomeMenus.FILE_CLOSE, {
                commandId: "close.window"
            });

            menus.registerMenuAction(WasomeMenus.EDIT_SAVE, {
                commandId: CommonCommands.SAVE.id,
                label: nls.localizeByDefault('保存'),
            });

            menus.registerMenuAction(WasomeMenus.EDIT_SAVE, {
                commandId: CommonCommands.SAVE_ALL.id,
                label: nls.localizeByDefault('全部保存'),
            });


            menus.registerMenuAction(WasomeMenus.EDIT_SAVE, {
                commandId: CommonCommands.UNDO.id,
                label: nls.localizeByDefault('撤销'),
            });
            menus.registerMenuAction(WasomeMenus.EDIT_SAVE, {
                commandId: CommonCommands.REDO.id,
                label: nls.localizeByDefault('恢复'),
            });

            menus.registerMenuAction(WasomeMenus.EDIT_SEARCH, {
                commandId: CommonCommands.FIND.id,
                label: '查找(基于文本)',
                order: '0'
            });
            menus.registerMenuAction(WasomeMenus.EDIT_SEARCH, {
                commandId: CommonCommands.REPLACE.id,
                label: '替换(基于文本)',
                order: '1'
            });
            menus.registerMenuAction(WasomeMenus.EDIT_SEARCH, {
                commandId: SearchInWorkspaceCommands.OPEN_SIW_WIDGET.id,
                label: '基于项目查找',
                order: '2'
            });
            menus.registerMenuAction(WasomeMenus.EDIT_SEARCH, {
                commandId: SearchInWorkspaceCommands.REPLACE_IN_FILES.id,
                label: '基于项目替换',
                order: '3'
            });

            menus.registerMenuAction(WasomeMenus.EDIT_CLOSE, {
                commandId: CommonCommands.CLOSE_MAIN_TAB.id,
                label: nls.localizeByDefault('关闭当前编辑器'),
            });

            menus.registerMenuAction(WasomeMenus.WELCOME, {
                commandId: 'getting.started.widget',
                label: nls.localizeByDefault('起始页面'),
            });

            menus.registerMenuAction(WasomeMenus.CROSS_REFERENCE, {
                commandId: WasomeCommands.OPEN_CROSS_REFERENCE.id,
                label: nls.localizeByDefault('交叉引用'),
            });

            menus.registerMenuAction(WasomeMenus.PROJECT_OUTPUT, {
                commandId: WasomeCommands.OPEN_IDE_OUTPUT.id,
                label: nls.localizeByDefault('项目输出')
            });

            menus.registerMenuAction(WasomeMenus.IMPORT, {
                commandId: "webide.project.exportProject",
                label: '导出项目'
            });
            menus.registerMenuAction(WasomeMenus.IMPORT, {
                commandId: "webide.project.importProject",
                label: '导入项目'
            });
            menus.registerMenuAction(WasomeMenus.DEBUG, {
                commandId: "webide.project.compile",
                label: '编译',
                order: '1'
            });
            menus.registerMenuAction(WasomeMenus.DEBUG, {
                commandId: "webide.project.debug",
                label: '调试',
                order: '1'
            });

            menus.registerSubmenu(WasomeMenus.POU, 'POU');
            menus.registerMenuAction(WasomeMenus.POU_NEW_PRG, {
                commandId: WasomeCommands.POU_NEW_PRG.id,
                label: '新增程序（PRG）',
                order: '0'
            });
            menus.registerMenuAction(WasomeMenus.POU_NEW_ST, {
                commandId: WasomeCommands.POU_NEW_ST.id,
                label: '新增程序（全ST）',
                order: '1'
            });
            menus.registerMenuAction(WasomeMenus.POU_NEW_FUNC, {
                commandId: WasomeCommands.POU_NEW_FUNC.id,
                label: '新增函数（FUN）',
                order: '2'
            });
            menus.registerMenuAction(WasomeMenus.POU_NEW_FB, {
                commandId: WasomeCommands.POU_NEW_FB.id,
                label: '新增函数块（FB）',
                order: '3'
            });

            menus.registerSubmenu(WasomeMenus.GLOBAL_VARIABLE, '全局变量');
            menus.registerMenuAction(WasomeMenus.GLOBAL_VARIABLE_NEW_GROUP, {
                commandId: "webide.gvar.addNewGroup",
                label: '新增全局变量组',
                order: '1'
            });
            menus.registerMenuAction(WasomeMenus.GLOBAL_VARIABLE_IMPORT, {
                commandId: "webide.gvar.showGlobalVarImport",
                label: '导入全局变量',
                order: '2'
            });

            menus.registerMenuAction(WasomeMenus.IO_CHANNEL, {
                commandId: "webide.app.showIO",
                label: 'IO通道与组网', // 定制客户需求，label 改变
                // order: '3'
            });

            menus.registerMenuAction(WasomeMenus.VARIABLE_PANORAMA, {
                commandId: "webide.app.showMonitor",
                label: '变量全景视图'
            });

            menus.registerSubmenu(WasomeMenus.VARIABLE, '变量与监视');
            menus.registerMenuAction(WasomeMenus.VARIABLE_NEW_WATCH_GROUP, {
                commandId: "webide.monitor.addNewGroup",
                label: '新增变量监视组'
            });

            menus.registerMenuAction(WasomeMenus.TASK, {
                commandId: "webide.app.showResources",
                label: '任务配置',
                // order: '2'
            });

            menus.registerSubmenu(WasomeMenus.TRACE, '变量跟踪（示波器）');
            menus.registerMenuAction(WasomeMenus.TRACE_NEW_TASK, {
                commandId: "webide.trace.createNewTask",
                label: '新建跟踪任务',
                order: '1'
            });
            menus.registerMenuAction(WasomeMenus.TRACE_OFFLINE_VIEW, {
                commandId: "webide.trace.importData",
                label: '离线查看跟踪缓存数据',
                order: '2'
            });

            menus.registerMenuAction(WasomeMenus.EVENT, {
                commandId: WasomeCommands.EVENT_NEW.id,
                label: '新建系统事件',
                // order: '1'
            });

            menus.registerMenuAction(WasomeMenus.UPPER_MACHINE, {
                commandId: "webide.app.showHmi",
                label: '上位机配置',
                // order: '2'
            });

            menus.registerMenuAction(WasomeMenus.SYSTEM_LIBRARY, {
                commandId: "webide.libManage",
                label: '系统库管理',
                // order: '3'
            });

            menus.registerMenuAction(WasomeMenus.USER_LIBRARY, {
                commandId: WasomeCommands.POU_NEW_LIB.id,
                label: '新增用户库',
                // order: '4'
            });


            menus.registerMenuAction(WasomeMenus.TO_HELP, {
                commandId: WasomeCommands.OPEN_HELP.id,
                label: '帮助文档',
                order: '1'
            });

            menus.registerMenuAction(WasomeMenus.TOOLBAR, {
                commandId: "toolbar.view.toggle",
                label: '显示/隐藏工具栏'
            });



        }, 100);
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
