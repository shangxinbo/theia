import { injectable, inject } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser/frontend-application-contribution';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { nls } from '@theia/core/lib/common/nls';
import { AsyncLocalizationProvider } from '@theia/core/lib/common/i18n/localization';

/**
 * Ensures IDE starts in Simplified Chinese (zh-cn / zh-hans) if language pack is present.
 * We only trigger a reload once when initial stored locale is different.
 */
@injectable()
export class DefaultLocaleFrontendContribution implements FrontendApplicationContribution {

    @inject(WindowService)
    protected readonly windowService: WindowService;

    @inject(AsyncLocalizationProvider)
    protected readonly localizationProvider: AsyncLocalizationProvider;

    async onStart(): Promise<void> {
        // Acceptable Chinese identifiers; language pack often uses zh-hans.
        const desired = 'zh-hans';
        const alternative = 'zh-cn';
        const stored = nls.locale; // value from localStorage if any
        if (stored && (stored === desired || stored === alternative)) {
            return; // already Chinese
        }
        // Check available languages to confirm presence to avoid reload loop when pack missing.
        try {
            const langs = await this.localizationProvider.getAvailableLanguages();
            const found = langs.find(l => l.languageId === desired || l.languageId === alternative);
            if (!found) {
                return; // language pack not installed
            }
            const target = found.languageId; // pick actual provided id
            nls.setLocale(target);
            // Mark safe then reload once to apply translations.
            this.windowService.setSafeToShutDown();
            this.windowService.reload();
        } catch (e) {
            console.warn('DefaultLocaleFrontendContribution: failed to set locale', e);
        }
    }
}
