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
            [
                {
                    id: 'textEditor.commands.go.back',
                    command: 'textEditor.commands.go.back',
                    icon: 'codicon codicon-arrow-left',
                },
                {
                    id: 'textEditor.commands.go.forward',
                    command: 'textEditor.commands.go.forward',
                    icon: 'codicon codicon-arrow-right',
                },
            ],
            [
                {
                    id: 'workbench.action.splitEditorRight',
                    command: 'workbench.action.splitEditor',
                    icon: 'codicon codicon-split-horizontal',
                },
            ],
            // 新增文件操作组
            [
                {
                    id: 'core.newFile',
                    command: 'workbench.action.files.newUntitledFile',
                    icon: 'codicon codicon-new-file',
                    tooltip: 'New File',
                },
                {
                    id: 'core.save',
                    command: 'core.save',
                    icon: 'codicon codicon-save',
                    tooltip: 'Save',
                },
                {
                    id: 'core.saveAll',
                    command: 'core.saveAll',
                    icon: 'codicon codicon-save-all',
                    tooltip: 'Save All',
                },
            ],
            // 新增编辑操作组
            [
                {
                    id: 'core.undo',
                    command: 'core.undo',
                    icon: 'codicon codicon-undo',
                    tooltip: 'Undo',
                },
                {
                    id: 'core.redo',
                    command: 'core.redo',
                    icon: 'codicon codicon-redo',
                    tooltip: 'Redo',
                },
                {
                    id: 'core.cut',
                    command: 'core.cut',
                    icon: 'codicon codicon-cut',
                    tooltip: 'Cut',
                },
                {
                    id: 'core.copy',
                    command: 'core.copy',
                    icon: 'codicon codicon-copy',
                    tooltip: 'Copy',
                },
                {
                    id: 'core.paste',
                    command: 'core.paste',
                    icon: 'codicon codicon-paste',
                    tooltip: 'Paste',
                },
            ],
        ],
        [ToolbarAlignment.CENTER]: [
            [
                {
                    id: 'theia-sample-toolbar-contribution',
                    group: 'contributed'
                }
            ],
            // 新增搜索操作组
            [
                {
                    id: 'core.find',
                    command: 'core.find',
                    icon: 'codicon codicon-search',
                    tooltip: 'Find',
                },
                {
                    id: 'core.replace',
                    command: 'core.replace',
                    icon: 'codicon codicon-replace',
                    tooltip: 'Replace',
                },
            ],
        ],
        [ToolbarAlignment.RIGHT]: [
            [
                {
                    id: 'workbench.action.showCommands',
                    command: 'workbench.action.showCommands',
                    icon: 'codicon codicon-terminal',
                    tooltip: 'Command Palette',
                },
            ],
            // 新增运行调试操作组
            [
                {
                    id: 'debug.start',
                    command: 'debug.start',
                    icon: 'codicon codicon-debug-start',
                    tooltip: 'Start Debugging',
                },
                {
                    id: 'debug.stop',
                    command: 'debug.stop',
                    icon: 'codicon codicon-debug-stop',
                    tooltip: 'Stop Debugging',
                },
                {
                    id: 'debug.restart',
                    command: 'debug.restart',
                    icon: 'codicon codicon-debug-restart',
                    tooltip: 'Restart Debugging',
                },
            ],
        ]
    },
});
