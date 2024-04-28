#!/bin/bash

VERSION=${1:-0.1.0}

function publishPlugin() {
    cd "$1"

    npm version "$VERSION"

    yarn build

    npm publish --dry-run
}

currentDir=$(pwd)

publishPlugin "$currentDir/plugins/custom-entities"

publishPlugin "$currentDir/plugins/custom-entities-backend"