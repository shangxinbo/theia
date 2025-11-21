/*
 * Replace visual file-watch error prompts with a log-only handler for WasomeCodeX.
 */
import { injectable, inject } from '@theia/core/shared/inversify';
import { ILogger } from '@theia/core/lib/common/logger';
import { FileSystemWatcherErrorHandler } from '@theia/filesystem/lib/browser/filesystem-watcher-error-handler';

@injectable()
export class LogOnlyFileSystemWatcherErrorHandler extends FileSystemWatcherErrorHandler {

    @inject(ILogger)
    protected readonly logger: ILogger;

    protected override watchHandlesExhausted = false;

    /**
     * Log the watch error instead of showing UI dialog. Keep the same throttling
     * semantics as the built-in handler (only first occurrence produces a log entry).
     */
    public override async handleError(): Promise<void> {
        if (!this.watchHandlesExhausted) {
            this.watchHandlesExhausted = true;
            this.logger.warn('File watching failed: switching to log-only mode. File system watcher may not report changes.');
        } else {
            // Subsequent errors are intentionally suppressed to avoid log spam,
            // but still keep a debug entry to help with investigations if needed.
            this.logger.debug('Additional file watcher error suppressed.');
        }
    }

}
