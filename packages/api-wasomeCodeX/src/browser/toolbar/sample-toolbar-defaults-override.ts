// *****************************************************************************
// Copyright (C) 2022 Ericsson and others.
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

import { DeflatedToolbarTree, ToolbarAlignment } from '@theia/toolbar/lib/browser/toolbar-interfaces';

export const SampleToolbarDefaultsOverride: () => DeflatedToolbarTree = () => ({
    items: {
        [ToolbarAlignment.LEFT]: [
            // 新增文件操作组
            [
                {
                    id: 'webide.show',
                    command: 'webide.show',
                    icon: 'codicon codicon-home',
                    tooltip: '显示项目工程树',
                },
            ],
            [
                {
                    id: 'project.new',
                    command: 'project.new',
                    icon: 'codicon codicon-new-file',
                    tooltip: '新建项目',
                },
                {
                    id: 'webide.project.home',
                    command: 'project.home',
                    icon: 'codicon codicon-repo',
                    tooltip: '项目信息',
                },
                {
                    id: 'workspace:openFolder',
                    command: 'workspace:openFolder',
                    icon: 'fa fa-folder-open-o',
                    tooltip: '打开项目',
                },
                {
                    id: 'core.save',
                    command: 'core.save',
                    icon: 'codicon codicon-save',
                    tooltip: '保存',
                }
            ],
            [
                {
                    id: 'core.undo',
                    command: 'core.undo',
                    icon: 'fa icon-opacity fa-undo',
                    tooltip: '撤销'
                },
                {
                    id: 'core.redo',
                    command: 'core.redo',
                    icon: 'fa icon-opacity fa-repeat',
                    tooltip: '恢复'
                }
            ],
            [
                {
                    id: 'core.find',
                    command: 'core.find',
                    icon: 'codicon codicon-search',
                    tooltip: '查找'
                },
                {
                    id: 'core.replace',
                    command: 'core.replace',
                    icon: 'codicon codicon-replace',
                    tooltip: '替换'
                }
            ],
            [
                {
                    id: 'webide.project.compile',
                    command: 'webide.compile',
                    icon: "codicon compile-icon",
                    // icon: 'codicon codicon-circuit-board',
                    // icon: 'fa fa-building-o',
                    tooltip: '编译',
                }
            ],
            [
                {
                    id: 'webide.connect.start',
                    command: 'webide.connect.start',
                    icon: 'codicon codicon-link',
                    tooltip: '连接控制器'
                },
                {
                    id: 'webide.unlink',
                    command: 'webide.unlink',
                    icon: 'fa icon-opacity fa-unlink',
                    tooltip: '断开连接'
                },
                {
                    id: 'deployApp',
                    command: 'deployApp',
                    icon: 'codicon codicon-desktop-download',
                    tooltip: '下装'
                }
            ],
            [
                {
                    id: 'webide.project.debug',
                    command: 'webide.debug',
                    icon: 'codicon codicon-debug',
                    tooltip: '调试',
                },
                {
                    id: 'workbench.action.debug.pause',
                    command: 'workbench.action.debug.pause'
                },
                {
                    id: 'workbench.action.debug.stepOver',
                    command: 'workbench.action.debug.stepOver'
                },
                {
                    id: 'workbench.action.debug.stepInto',
                    command: 'workbench.action.debug.stepInto'
                },
                {
                    id: 'workbench.action.debug.stepOut',
                    command: 'workbench.action.debug.stepOut'
                },
                {
                    id: 'workbench.action.debug.stop',
                    command: 'workbench.action.debug.stop',
                    // icon: 'codicon codicon-circuit-board',
                    tooltip: '停止调试',
                }
            ],
            [
                {
                    id: 'webide.project.showHelpPage',
                    command: 'webide.project.showHelpPage',
                    icon: 'codicon codicon-briefcase',
                    tooltip: '帮助',
                },
            ],
        ],
        [ToolbarAlignment.CENTER]: [],
        [ToolbarAlignment.RIGHT]: [
            [
                {
                    id: 'workbench.action.showCommands',
                    command: 'workbench.action.showCommands',
                    icon: 'codicon codicon-terminal',
                    tooltip: 'Command Palette',
                },
            ]
        ]
    },
});
