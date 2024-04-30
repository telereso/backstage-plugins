import {BackstageIdentityResponse} from "@backstage/plugin-auth-node";
import {PermissionPolicy, PolicyQuery} from "@backstage/plugin-permission-node";
import {AuthorizeResult, isPermission, PolicyDecision} from "@backstage/plugin-permission-common";
import {createBackendModule} from "@backstage/backend-plugin-api";
import {policyExtensionPoint} from "@backstage/plugin-permission-node/alpha";
import {
    customEntitiesAdministerPermission,
} from "@telereso/backstage-plugin-custom-entities-common"


const GROUP_BACKSTAGE_ADMINS = 'group:default/backstage-admins'

export class TeamsPermissionPolicy implements PermissionPolicy {
    async handle(request: PolicyQuery, user?: BackstageIdentityResponse,): Promise<PolicyDecision> {

        // Custom Entities
        if (isPermission(request.permission, customEntitiesAdministerPermission)) {
            if (user?.identity.ownershipEntityRefs.includes(GROUP_BACKSTAGE_ADMINS,)
            ) {
                // Change to AuthorizeResult.DENY, it's ALLOW only for demo
                return {result: AuthorizeResult.ALLOW};
            }
            return {result: AuthorizeResult.ALLOW};
        }

        return {result: AuthorizeResult.ALLOW};
    }
}

export const permissionBackendModule = createBackendModule({
    pluginId: 'permission',
    moduleId: 'permission-policy',
    register(reg) {
        reg.registerInit({
            deps: {policy: policyExtensionPoint},
            async init({policy}) {
                policy.setPolicy(new TeamsPermissionPolicy());
            },
        });
    },
});