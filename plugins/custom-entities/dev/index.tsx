import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { customEntitiesPlugin, CustomEntitiesPage } from '../src/plugin';

createDevApp()
  .registerPlugin(customEntitiesPlugin)
  .addPage({
    element: <CustomEntitiesPage />,
    title: 'Root Page',
    path: '/custom-entities',
  })
  .render();
