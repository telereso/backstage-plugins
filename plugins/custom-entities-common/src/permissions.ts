import {createPermission} from '@backstage/plugin-permission-common';

export const customEntitiesUpdatePermission = createPermission({
    name: 'custom.entities.update',
    attributes: {action: 'update'},
});
export const customEntitiesAdministerPermission = createPermission({
    name: 'custom.entities.administer',
    attributes: {action: 'read'},
});

export const customEntitiesPermissions = [customEntitiesAdministerPermission, customEntitiesUpdatePermission];