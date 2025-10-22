/*
 * 重绑定 WorkspaceTrustService，始终信任工作区。
 */
import { ContainerModule } from '@theia/core/shared/inversify';
import { WorkspaceTrustService as BaseWorkspaceTrustService } from '@theia/workspace/lib/browser/workspace-trust-service';

class AlwaysTrustedWorkspaceTrustService extends BaseWorkspaceTrustService {
    protected override async calculateWorkspaceTrust(): Promise<boolean | undefined> {
        return true;
    }
    override async requestWorkspaceTrust(): Promise<boolean | undefined> {
        if (!this.isWorkspaceTrustResolved()) {
            (this as any).resolveWorkspaceTrust(true);
        }
        return true;
    }
}

export default new ContainerModule((bind, _unbind, _isBound, rebind) => {
    rebind(BaseWorkspaceTrustService).to(AlwaysTrustedWorkspaceTrustService).inSingletonScope();
});
