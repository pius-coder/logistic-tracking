---
session: ses_0db4
updated: 2026-07-02T21:24:24.531Z
---

# Session Summary

## Goal
Explore and document the full tech stack, database configuration, env files, package managers, and ORM setup of the logistic-tracking project.

## Constraints & Preferences
- Return all findings with exact file paths and relevant content snippets
- Use the exact output format provided

## Progress
### Done
- [x] **Tech stack identified**: Next.js 16 (App Router) + TypeScript strict + Bun runtime + custom meta-framework "Aura" (Rails-like). UI via shadcn/ui + Tailwind CSS + TanStack Query + Zustand + React Hook Form/Zod + Mapbox GL.
- [x] **Database configured**: PostgreSQL — declared in `prisma/schema.prisma` line 7: `provider = "postgresql"` — using Prisma 7 ORM with `@prisma/adapter-pg` and `pg` driver.
- [x] **No .env file or .env.example found**: `.gitignore` explicitly ignores `.env*` (line 34). The `.dockerignore` un-ignores `.env.example` (line 5: `!.env.example`) but no example file exists. Env vars used in code: `DATABASE_URL`, `AURA_S3_PUBLIC_ENDPOINT`, `AURA_S3_ENDPOINT`, `AURA_S3_INTERNAL_ENDPOINT`, `AURA_APP_URL`, `AURA_BROADCAST_PORT`, `PORT`.
- [x] **Package manager**: Bun — `bun.lock` present (lockfileVersion 1), project name in lockfile is `"globalimex_v3"`, name in `package.json` is `"jc-import-express"`.
- [x] **Config files found**: `package.json` (scripts: dev, build, db:push, db:migrate, etc.), `tsconfig.json` (strict, paths `@/*` → `./src/*`), `next.config.ts` (standalone output, serverExternalPackages for prisma/pg, turbopack alias), `postcss.config.mjs` (Tailwind), `eslint.config.mjs` (next/core-web-vitals + typescript), `components.json` (shadcn/ui config), `prisma.config.ts` (Prisma 7 config with `dotenv`), `start.sh` (container startup: prisma db push + seed, then next + broadcast).
- [x] **ORM setup detailed**: Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`) with schema at `prisma/schema.prisma`. Datasource uses PostgreSQL. Generator outputs client to `../src/generated/prisma`. Schema includes models: AuraUser, Country, Request, Trajectory, Leg, and many enums (TransportMode, RequestStatus, LegMode, etc.). Seed scripts: `prisma/seed.ts` and `prisma/seed-countries.ts`. No `prisma/migrations/` folder yet — container uses `prisma db push --accept-data-loss` for schema sync (see `start.sh` lines 24-29).
- [x] **Read all key files**: root directory listing, package.json, bun.lock, prisma.config.ts, prisma/schema.prisma, next.config.ts, tsconfig.json, postcss.config.mjs, eslint.config.mjs, components.json, .gitignore, .dockerignore, start.sh (and partial README.md).

### In Progress
- (none — exploration complete)

### Blocked
- (none)

## Key Decisions
- **Prisma 7 with PostgreSQL adapter**: Uses `@prisma/adapter-pg` for native PostgreSQL connection pooling — configured in `next.config.ts` as `serverExternalPackages: ["prisma", "@prisma/client", "@prisma/adapter-pg", "pg"]`.
- **Bun over npm/yarn**: `bun.lock` present, scripts use `bun` for Aura CLI and broadcast server. The `package.json` scripts mix `npm run` and `bun` commands.
- **Standalone Next.js output**: `next.config.ts` sets `output: "standalone"` for containerized deployment, with `start.sh` launching `node server.js`.
- **No migrations folder (yet)**: Deployment script uses `prisma db push` instead of `prisma migrate deploy` — the `start.sh` explicitly notes "this project has no prisma/migrations/ folder yet."
- **Aura meta-framework**: Custom Rails-like framework built on top of Next.js 16 defining conventions for server operations, client components, auth (phone + password + OTP), notifications, cron jobs, and a CLI generator.
- **Aura Broadcast server**: A separate Bun process (`src/aura/server/broadcast.ts`) runs alongside Next.js on port 3001 for real-time notifications.

## Next Steps
1. Create a `.env.example` file documenting all required environment variables (`DATABASE_URL`, `AURA_S3_PUBLIC_ENDPOINT`, `AURA_APP_URL`, `AURA_S3_ENDPOINT`, `AURA_S3_INTERNAL_ENDPOINT`, `AURA_BROADCAST_PORT`, `PORT`).
2. Review the Prisma schema fully to understand all models before making database changes.
3. Optionally initialize `prisma/migrations/` directory with `prisma migrate dev` for production-grade schema management.
4. Investigate the Aura framework structure under `src/aura/` for deeper understanding of the custom meta-framework conventions.

## Critical Context
- **Project root**: `/home/afreeserv/projects/logistic-tracking`
- **Package name**: `jc-import-express` (also known as `globalimex_v3` in bun.lock)
- **Stack**: Next.js 16 + TypeScript + Bun + Prisma 7 + PostgreSQL + Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL via Prisma 7 ORM with `@prisma/adapter-pg`
- **Schema file**: `/home/afreeserv/projects/logistic-tracking/prisma/schema.prisma`
- **Prisma config**: `/home/afreeserv/projects/logistic-tracking/prisma.config.ts` (uses `dotenv/config` and reads `DATABASE_URL`)
- **Env files**: No `.env` or `.env.example` exists — both are git-ignored
- **Container startup**: `/home/afreeserv/projects/logistic-tracking/start.sh` — runs `prisma db push`, then seed, then Next.js on port 3000 + Aura broadcast on port 3001
- **No migrations directory yet** — schema sync done via `prisma db push`

## File Operations
### Read
- `/home/afreeserv/projects/logistic-tracking` (directory listing)
- `/home/afreeserv/projects/logistic-tracking/.dockerignore`
- `/home/afreeserv/projects/logistic-tracking/.gitignore`
- `/home/afreeserv/projects/logistic-tracking/bun.lock`
- `/home/afreeserv/projects/logistic-tracking/components.json`
- `/home/afreeserv/projects/logistic-tracking/eslint.config.mjs`
- `/home/afreeserv/projects/logistic-tracking/next.config.ts`
- `/home/afreeserv/projects/logistic-tracking/package.json`
- `/home/afreeserv/projects/logistic-tracking/postcss.config.mjs`
- `/home/afreeserv/projects/logistic-tracking/prisma.config.ts`
- `/home/afreeserv/projects/logistic-tracking/prisma/schema.prisma`
- `/home/afreeserv/projects/logistic-tracking/prisma/seed.ts` (listed but not read fully)
- `/home/afreeserv/projects/logistic-tracking/prisma/seed-countries.ts` (listed but not read fully)
- `/home/afreeserv/projects/logistic-tracking/start.sh`
- `/home/afreeserv/projects/logistic-tracking/tsconfig.json`

### Modified
- (none)
