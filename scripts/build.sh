#!/bin/bash

# Install
yarn install

# BUILD

# tsc outputs type definitions to dist-types/ in the repo root, which are then consumed by the build
yarn tsc

# Build the backend, which bundles it all up into the packages/backend/dist folder.
# The configuration files here should match the one you use inside the Dockerfile below.
yarn build:backend --config ../../app-config.yaml

mkdir -p /workspace/backend/dist

# Pass Dist
cp -R packages/backend/dist/* /workspace/backend/dist

ls /workspace/backend/dist


