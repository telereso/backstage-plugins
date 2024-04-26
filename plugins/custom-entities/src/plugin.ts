import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const customEntitiesPlugin = createPlugin({
  id: 'custom-entities',
  routes: {
    root: rootRouteRef,
  },
});

export const CustomEntitiesPage = customEntitiesPlugin.provide(
  createRoutableExtension({
    name: 'CustomEntitiesPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
