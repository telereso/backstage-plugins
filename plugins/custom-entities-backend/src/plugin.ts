import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * customEntitiesPlugin backend plugin
 *
 * @public
 */
export const customEntitiesPlugin = createBackendPlugin({
  pluginId: 'custom-entities',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        permissions: coreServices.permissions,
      },
      async init({
        httpRouter,
        logger,
        config,
        permissions
      }) {
        httpRouter.use(
          await createRouter({
            logger,
            config,
            permissions
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
        if (config.getConfig("customEntities").getBoolean("allowGuest"))
          httpRouter.addAuthPolicy({
            path: '/v1/entities.yaml',
            allow: 'unauthenticated',
        });
      },
    });
  },
});
