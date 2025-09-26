#!/bin/bash
set -euxo pipefail

COLOCUS_UI_VERSION=`git describe --tags --abbrev=11 | sed 's/^v//' | sed 's/-g/-/'`
GIT_SHA=`git rev-parse HEAD`
BUILD_DATE=`date -u +'%Y-%m-%dT%H:%M:%SZ'`

docker build --pull -t colocus-ui:${COLOCUS_UI_VERSION} \
  --build-arg BUILD_DATE=${BUILD_DATE} \
  --build-arg GIT_SHA=${GIT_SHA} \
  --build-arg COLOCUS_UI_VERSION=${COLOCUS_UI_VERSION} \
  --progress plain \
  "$@" .

docker tag colocus-ui:${COLOCUS_UI_VERSION} colocus-ui:latest
