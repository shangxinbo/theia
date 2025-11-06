// *****************************************************************************
// Copyright (C) 2019 Arm and others.
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

import { ContainerModule, interfaces } from '@theia/core/shared/inversify';
import { bindDynamicLabelProvider } from './label/sample-dynamic-label-provider-command-contribution';
import { bindSampleUnclosableView } from './view/sample-unclosable-view-contribution';
import { bindSampleMenu } from './menu/sample-menu-contribution';
import { bindSampleFileWatching } from './file-watching/sample-file-watching-contribution';
import { bindVSXCommand } from './vsx/sample-vsx-command-contribution';
import { bindSampleToolbarContribution } from './toolbar/sample-toolbar-contribution';

import '../../src/browser/style/branding.css';
import '../../src/browser/style/dialogs.css'
import { DefaultLocaleFrontendContribution } from './default-locale-contribution';
import { FrontendApplicationContribution } from '@theia/core/lib/browser/frontend-application-contribution';
import { bindWebviewViewStabilityPatch } from './webview/webview-view-stability-patch';

export default new ContainerModule((
    bind: interfaces.Bind,
    unbind: interfaces.Unbind,
    isBound: interfaces.IsBound,
    rebind: interfaces.Rebind,
) => {
    // TODO 新增IDE命令贡献，移除旧命令贡献
    // bindAskAndContinueChatAgentContribution(bind);
    // bindChangeSetChatAgentContribution(bind);
    // bindOriginalStateTestAgentContribution(bind);
    // bindChatNodeToolbarActionContribution(bind);
    // bindDynamicLabelProvider(bind);
    // bindSampleUnclosableView(bind);
    // bindSampleOutputChannelWithSeverity(bind);
    bindSampleMenu(bind);
    // bindSampleFileWatching(bind);
    // bindVSXCommand(bind);
    // bindSampleFilteredCommandContribution(bind);
    bindSampleToolbarContribution(bind, rebind);
    // Custom: bind default locale (zh-hans) initializer
    bind(DefaultLocaleFrontendContribution).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(DefaultLocaleFrontendContribution);
    // WebviewView stability (Scheme A) runtime patch.
    bindWebviewViewStabilityPatch(bind);
    // bindMonacoPreferenceExtractor(bind);
    // bindSampleAppInfo(bind);
    // bindSampleFileSystemCapabilitiesCommands(bind);
    // rebindOVSXClientFactory(rebind);
    // bindSampleCodeCompletionVariableContribution(bind);
});
