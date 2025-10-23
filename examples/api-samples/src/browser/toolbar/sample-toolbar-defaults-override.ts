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
                    id: 'webide.project.home',
                    command: 'webide.project.home',
                    icon: 'codicon codicon-home',
                    tooltip: '项目',
                },
                {
                    id: 'webide.project.debug',
                    command: 'webide.project.debug',
                    icon: 'codicon codicon-debug',
                    tooltip: '调试',
                },
                {
                    id: 'webide.project.compile',
                    command: 'webide.project.compile',
                    icon: 'codicon codicon-combine',
                    tooltip: '编译',
                },
                {
                    id: 'webide.project.showHelpPage',
                    command: 'webide.showHelpPage',
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
