<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# GlobalImex v3 — Aura + Next.js 16

## Stack

- **Runtime:** Bun 1.3 (dev), Node 22 (production Docker)
- **Framework:** Next.js 16 App Router + Aura meta-framework (custom RPC)
- **Database:** PostgreSQL on port **5433** (not default 5432), Prisma 7 with `@prisma/adapter-pg`
- **UI:** shadcn/ui + Tailwind CSS v4, TanStack Query v5, nuqs, React Hook Form + Zod 4
- **Path alias:** `@/` → `./src/`

## Key Commands

| Command | Purpose |
|---------|---------|
| `bun dev` | `prisma generate` then `next dev` |
| `bun check:all` | lint + typecheck + prisma validate |
| `bun db:push` | push schema without migrations |
| `bun db:migrate` | create + apply migration |
| `bun db:studio` | Prisma Studio |
| `bun aura:doctor` | validate project health |
| `bun aura:make operation <domain.name>` | scaffold operation |
| `bun aura:make query <domain.name>` | scaffold query with params |
| `bun aura:make notification <name>` | scaffold notification fn |
| `bun aura:make cron <name>` | scaffold cron job |
| `bun aura:cron run <jobName>` | execute cron job manually |
| `bun aura:outbox` | process pending outbox events |

## Architecture

### 7 Layers

0. **Platform** — Next.js 16, Prisma 7, PostgreSQL, Tailwind
1. **Transport Security** — `src/proxy.ts` (CSRF, CSP, origin check, rate-limit, auth redirects)
2. **Aura Runtime** — `src/aura/server/` (operation builder, context, runner, registry)
3. **Auth Core** — `src/aura/server/auth/` (phone+password+OTP, opaque sessions)
4. **Domain** — `src/features/<domain>/` (business operations)
5. **Client DX** — `src/aura/client/` (hooks, forms, stepper, guard)
6. **UI** — `src/app/` (pages, layouts)

### Aura Operation Pattern

```ts
defineOperationFn("domain.action")
  .mutate()        // or .query()
  .input(schema)   // Zod payload schema
  .params(schema)  // Zod search params (optional)
  .entities(["ModelName"])  // Prisma model names for cache invalidation
  .auth()          // or .public() or .internal()
  .use(...commonFns)
  .handler(async ({ ctx, input, params, req }) => { ... })
```

### Registration

`src/aura.registry.ts` imports every feature module. Adding a new feature requires:
1. Create `src/features/<domain>/` with `index.ts` + `server/<op>.ts` + `shared/schemas.ts`
2. Import the feature's `index.ts` in `src/aura.registry.ts`

### Feature Structure

```
src/features/<domain>/
  index.ts          — imports & exports server ops
  server/<op>.ts    — defineOperationFn definitions
  shared/schemas.ts — Zod schemas and TS types
```

## Database

- **PostgreSQL:** local port 5433, user `postgres`, password `postgres`, database `jc_import_express_v3`
- **Prisma schema:** `prisma/schema.prisma` (30+ models)
- **Prisma config:** `prisma.config.ts` (new Prisma 7 format with `defineConfig`)
- **Generated client:** `src/generated/prisma/`
- **Seed:** `bunx prisma db seed` (uses `tsx prisma/seed.ts`)

## Aura Gotchas

- **`.entities()` values must match Prisma model names exactly** — used for auto-cache-invalidation on mutations
- **Every operation needs an access marker:** `.auth()`, `.public()`, or `.internal()` — missing one errors at runtime
- **`.auth()` operations** require a session; `ctx.user` and `ctx.session` are available in handler
- **Auth is phone-based (E.164)** — `AuraPhoneIdentity` is the primary identity, not email
- **Client/server boundary is strict** — `server/` imports `server-only`, never imported by client code
- **`ctx.bump`** for ephemeral toasts, **`ctx.notify`** for durable notifications with retry via outbox
- **Context** (`ctx`) provides: `db`, `session`, `user`, `auth`, `notify`, `bump`, `log`, `audit`, `requestId`, `source`, `request`, `cookies`, `storage`

## Broadcast & Invalidation

- Bun WebSocket server on port 3001 (Hono)
- Server-to-server invalidation via HMAC-signed HTTP call to broadcast server
- Client receives invalidation events via WebSocket (`useAuraBroadcast`)
- Build-time: `bun run dev:full` starts both Next.js dev server + broadcast server

## No Tests

Zero test files in the repo. No testing framework configured. Do not look for or expect tests.

## CI/CD

- **CI:** Gitea Actions (`.gitea/workflows/build.yml` — build Docker image, push to Gitea Container Registry)
- **CD:** Coolify pulls image from registry
- **Docker:** Two-stage build (builder + runner), Node 22 slim, includes Bun for broadcast server
- **No `.github/` or `.gitea/` directories in repo** — workflows managed externally

## Required Env Vars

```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/jc_import_express_v3
AURA_APP_URL=http://localhost:3000
AURA_INTERNAL_SECRET=<change-me>
AURA_SESSION_COOKIE_NAME=aura_session
AURA_CSRF_COOKIE_NAME=aura_csrf
AURA_BCRYPT_ROUNDS=10
```

## Existing Skills

`skills-lock.json` references 44 marketing skills from `coreyhaines31/marketingskills`. They live in `.agents/skills/`.
