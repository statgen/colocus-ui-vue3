# Stage 1: build node assets
FROM node:22 AS node-build
WORKDIR /app

# Install packages first; need to install here to be cached in earlier layer
# and not trigger re-compiles if only source code changes
COPY package.json package-lock.json /app
RUN npm ci

# Copy the source code into the container
COPY \
  .browserslistrc \
  .nvmrc \
  .editorconfig \
  jsconfig.json \
  vite.config.mjs \
  index.html \
  /app/

COPY public /app/public
COPY src /app/src

# Run build
ENV NODE_ENV=production
RUN npm run build

# Stage 2: nginx
# This copies built assets from previous stage
# nginxinc/nginx-unprivileged is a docker image that allows running nginx w/o root
FROM nginxinc/nginx-unprivileged:mainline-bookworm
COPY --from=node-build /app/dist /usr/share/nginx/html/

LABEL org.label-schema.name="colocus-ui"
LABEL org.label-schema.description="Vue frontend for Colocus browser"
LABEL org.label-schema.vendor="University of Michigan, Center for Statistical Genetics"
LABEL org.label-schema.url="https://github.com/statgen/colocus-ui-vue3"
LABEL org.label-schema.usage="https://github.com/statgen/colocus-ui-vue3#docker"
LABEL org.label-schema.vcs-url="https://github.com/statgen/colocus-ui-vue3"
LABEL org.label-schema.schema-version="1.0"

ARG BUILD_DATE
ARG GIT_SHA
ARG COLOCUS_UI_VERSION

LABEL org.label-schema.version=$COLOCUS_UI_VERSION \
      org.label-schema.vcs-ref=$GIT_SHA \
      org.label-schema.build-date=$BUILD_DATE

# Start NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]
