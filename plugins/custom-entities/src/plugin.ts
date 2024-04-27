import {
    createPlugin,
    createRoutableExtension,
    createApiFactory,
    configApiRef,
} from '@backstage/core-plugin-api';

import {rootRouteRef} from './routes';
import {CustomEntitiesApiClient, CustomEntitiesApiRef} from "./api/CustomEntitiesAPI";

export const customEntitiesPlugin = createPlugin({
    id: 'custom-entities',
    apis: [
        createApiFactory({
            api: CustomEntitiesApiRef,
            deps: {
                configApi: configApiRef,
            },
            factory: ({configApi}) =>
                new CustomEntitiesApiClient({configApi}),
        }),
    ],
    routes: {
        root: rootRouteRef,
    },
});

export const CustomEntitiesPage = customEntitiesPlugin.provide(
    createRoutableExtension({
        name: 'CustomEntitiesPage',
        component: () =>
            import('./components/PageComponent').then(m => m.PageComponent),
        mountPoint: rootRouteRef,
    }),
);
