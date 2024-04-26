#!/bin/bash

# Uncomment for local
#GCP_PROJECT="telereso"
#SERVICE_ID="backstage-demo"
#DEPLOY_VERSION="0.0.1"
#GCP_REGION="0.0.1"

host="gcr.io/${GCP_PROJECT}/$SERVICE_ID"
tag="${host}:${DEPLOY_VERSION}"

NAME="bs-${DEPLOY_VERSION}"

# BUILD IMAGE

docker image build . -f packages/backend/Dockerfile --tag "$tag"

status=$?
if [[ status -ne 0 ]]; then
  echo "build failed!"
	exit 12
fi

docker push "$tag"

gcloud run deploy "$SERVICE_ID" --project="$GCP_PROJECT" --image="$tag" --revision-suffix="$NAME" --tag="$NAME" --region="$GCP_REGION" ${TRAFFIC_OPTION:+ "${TRAFFIC_OPTION}"} --env-vars-file ".env"