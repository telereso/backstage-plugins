# Custom Entities Backend

This is the backend plugin for [Frontend Plugin](../custom-entities/README.md)

## Installation

### Install the package

```bash
yarn add @telereso/backstage-plugin-custom-entities-backend
```

### Adding the plugin to your `packages/backend`

In the new backend system add the following changes to `packages/backend/src/index.ts`

```diff

import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

+// Custom Entities
+backend.add(import('@telereso/backstage-plugin-custom-entities-backend'));

backend.start();

```

### Configuration 

The plugin has its own configuration in `app-config.yaml`

Local
```yaml
customEntities:
  allowGuest: true
  providers:
    local:
      dir: ../../../../examples
      name: custom-entities.yaml
```

Production
```yaml
customEntities:
  allowGuest: false
  providers:
    googleGcs:
      bucket: telereso-docs
      folder: backstage/catalog
      name: custom-entities.yaml
```

#### providers

There is 2 options, one for local and the other one for production, 

In local the `custom-entities.yaml` will be stored under `example` directory of root project

In production the plugin uses Google Cloud Storage
You can check [backstage integration with GCS](https://backstage.io/docs/integrations/google-cloud-storage/locations/)

use `bucket`, `folder` and `name` to customize how the file is stored in the bucket

_Other providers will be introduced in the future, most likely will include database integration_


#### allowGuest
Meant for local development only if the backstage only allow guest users, in production should be disabled

### Read Entities 

Locally you can add the following location

```yaml
catalog:
  locations:
    # Local example data, file locations are relative to the backend process, typically `packages/backend`
    - type: file
      target: ../../examples/custom-entities.yaml
```

In production add the following changes in `app-config.produciton.yaml`

```diff
backend:
  # Note that the baseUrl should be the URL that the browser and other clients
  # should use when communicating with the backend, i.e. it needs to be
  # reachable not just from within the backend host, but from all of your
  # callers. When its value is "http://localhost:7007", it's strictly private
  # and can't be reached by others.
  baseUrl: "https://${BACKEND_HOST}"
  auth:
    keys:
      - secret: ${BACKEND_SECRET}
+  csp:
+    #    connect-src: [ "'self'", 'http:', 'https:' ]
+    script-src:
+      - "'self'"
+      - "'unsafe-eval'" # this is required for scaffolder usage, and ajv validation.
+      - 'https://cdn.jsdelivr.net'
+  reading:
+    allow:
+      - host: "${BACKEND_HOST}"
        
catalog:
  locations:
+    - type: url
+      target: "https://${BACKEND_HOST}/api/custom-entities/v1/entities.yaml"
+      rules:
+        - allow: [ User, Group, Component, System, API, Resource, Location ]
```

Make sure that `BACKEND_HOST` is same as `backend.baseUrl` host