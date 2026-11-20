# syntax=docker/dockerfile:1
# Build context: repository root (npm workspaces share the root package-lock.json)
#   docker build -f client/Dockerfile -t finbit-client .

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci --workspace client --no-audit --no-fund

COPY client client
# Default "/api" keeps the browser on the same origin; nginx proxies it to the API container.
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build --workspace client

FROM nginx:1.27-alpine AS runtime
# API_UPSTREAM is substituted into the nginx config at container start.
ENV API_UPSTREAM=http://server:5000
COPY client/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
