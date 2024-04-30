import { getVoidLogger } from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';

import { createRouter } from './router';
import {ConfigReader} from "@backstage/config";
import { PermissionEvaluator } from '@backstage/plugin-permission-common';

describe('createRouter', () => {
  let app: express.Express;

  const mockedAuthorize: jest.MockedFunction<PermissionEvaluator['authorize']> =
      jest.fn();
  const mockedPermissionQuery: jest.MockedFunction<
      PermissionEvaluator['authorizeConditional']
  > = jest.fn();

  const permissionEvaluator: PermissionEvaluator = {
    authorize: mockedAuthorize,
    authorizeConditional: mockedPermissionQuery,
  };

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config: ConfigReader.fromConfigs([]),
      permissions: permissionEvaluator
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
