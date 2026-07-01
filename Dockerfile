# syntax=docker/dockerfile:1.7
#
# Unified Dockerfile — runs both:
#   1. Next.js (Node, :3000)   — main web app
#   2. Aura broadcast (Bun, :3001) — WebSocket pub/sub relay
#
# Postgres is provided by Coolify (separate service), not here.
# Build: docker build -t jc-import-express/app .
# Run  : docker run -p 3000:3000 -p 3001:3001 --env-file .env jc-import-express/app
#
# Image size strategy:
#   - builder: full install (dev + prod deps) for Next.js build + prisma generate
#   - runner:  bun install --production only (~60% smaller node_modules)
#              .next/standalone already ships its own traced node_modules for Next
#              so the prod install only needs to cover: prisma CLI, @prisma/client,
#              pg, @prisma/adapter-pg, hono, @aws-sdk/client-s3, and their deps.
#
# Build args (required by CI, Coolify injects its own):
ARG DATABASE_URL
ARG AURA_APP_URL
ARG NEXT_PUBLIC_APP_URL

# ─── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder
ARG DATABASE_URL
ARG AURA_APP_URL
ARG NEXT_PUBLIC_APP_URL
ENV DATABASE_URL=$DATABASE_URL AURA_APP_URL=$AURA_APP_URL NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates curl unzip \
  && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash \
  && ln -s /root/.bun/bin/bun /usr/local/bin/bun

# Install all deps (dev + prod) for the build
COPY package.json bun.lock* ./
COPY prisma ./prisma
COPY scripts ./scripts
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# prisma generate + next build
RUN npm run build

# ─── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates tini curl unzip \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV AURA_BROADCAST_PORT=3001

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs --home /home/nextjs --shell /bin/sh nextjs \
  && mkdir -p /home/nextjs \
  && chown -R nextjs:nodejs /home/nextjs

# Install Bun (needed for broadcast server + seed at runtime)
RUN curl -fsSL https://bun.sh/install | bash \
  && ln -s /root/.bun/bin/bun /usr/local/bin/bun \
  && cp -r /root/.bun /home/nextjs/.bun \
  && chown -R nextjs:nodejs /home/nextjs/.bun
ENV PATH="/home/nextjs/.bun/bin:${PATH}"

# ─── Next.js standalone output ────────────────────────────────────────────────
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# ─── Production node_modules (no devDeps) ─────────────────────────────────────
# Copy the full node_modules, then remove known heavy dev dependencies.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
RUN rm -rf node_modules/.cache node_modules/@types node_modules/eslint* node_modules/@eslint node_modules/prettier node_modules/typescript node_modules/tsx \
  && chown -R nextjs:nodejs /app/node_modules

# ─── Prisma schema + generated client ─────────────────────────────────────────
COPY --from=builder --chown=nextjs:nodejs /app/src/generated/prisma ./src/generated/prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

# ─── Broadcast server (Bun) ───────────────────────────────────────────────────
COPY --from=builder --chown=nextjs:nodejs /app/src/aura/server/broadcast.ts ./src/aura/server/broadcast.ts
COPY --from=builder --chown=nextjs:nodejs /app/src/aura/shared ./src/aura/shared

# ─── Start wrapper ────────────────────────────────────────────────────────────
COPY --chown=nextjs:nodejs start.sh ./start.sh
RUN chmod +x ./start.sh

USER nextjs

EXPOSE 3000 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health \
    && curl -fsS http://127.0.0.1:3001/health \
    || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["./start.sh"]
