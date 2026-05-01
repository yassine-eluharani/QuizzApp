# syntax=docker/dockerfile:1.7

# ---------- builder ----------
FROM node:25-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
COPY migrations ./migrations
COPY catalog.json* ./

RUN yarn build

# ---------- runtime ----------
FROM node:25-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

# Production deps only
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Compiled JS, migrations and any runtime data
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/catalog.json* ./

# Drop privileges (node:20-alpine ships with a non-root `node` user, uid 1000)
RUN chown -R node:node /app
USER node

EXPOSE 3000

# Lightweight HTTP healthcheck (orchestrator can override)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/health/live',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/server.js"]
