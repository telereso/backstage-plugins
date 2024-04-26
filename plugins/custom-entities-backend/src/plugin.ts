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
      },
      async init({
        httpRouter,
        logger,
                   config,
      }) {
        httpRouter.use(
          await createRouter({
            logger,
            config
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
