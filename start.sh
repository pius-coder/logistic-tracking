#!/bin/bash
#
# Unified start script — runs Next.js + Aura broadcast in the same container.
# Before booting either process we sync the Prisma schema to Postgres so the
# tables always exist (this project has no prisma/migrations/ folder yet, so
# `db push` is the right tool). db push is idempotent: if the schema already
# matches the DB, it's a no-op.
#
# Set PRISMA_DB_PUSH=0 to skip the sync (useful once you switch to
# `prisma migrate deploy` with a real migrations folder).

set -e

cleanup() {
  echo "[start.sh] shutting down (received signal)"
  [ -n "$NEXT_PID" ] && kill -TERM "$NEXT_PID" 2>/dev/null || true
  [ -n "$BROADCAST_PID" ] && kill -TERM "$BROADCAST_PID" 2>/dev/null || true
  wait
  exit 0
}
trap cleanup TERM INT

# ─── 1. Sync Prisma schema to the database ───────────────────────────────────
if [ "${PRISMA_DB_PUSH:-1}" != "0" ] && [ -n "${DATABASE_URL:-}" ]; then
  echo "[start.sh] prisma db push"
  node node_modules/prisma/build/index.js db push --accept-data-loss
else
  echo "[start.sh] skipping prisma db push (PRISMA_DB_PUSH=${PRISMA_DB_PUSH:-1}, DATABASE_URL=${DATABASE_URL:+set})"
fi

if [ -n "${DATABASE_URL:-}" ]; then
  echo "[start.sh] prisma db seed"
  bun prisma/seed.ts
fi

# ─── 2. Launch app processes ─────────────────────────────────────────────────

echo "[start.sh] launching Next.js on :${PORT:-3000}"
node server.js &
NEXT_PID=$!

echo "[start.sh] launching Aura broadcast on :${AURA_BROADCAST_PORT:-3001}"
bun src/aura/server/broadcast.ts &
BROADCAST_PID=$!

echo "[start.sh] Next PID=$NEXT_PID  Broadcast PID=$BROADCAST_PID"

# Exit as soon as any child exits — so Coolify/Docker restarts the container
wait -n "$NEXT_PID" "$BROADCAST_PID"
EXIT_CODE=$?

echo "[start.sh] a child process exited with code $EXIT_CODE — stopping container"
cleanup
exit $EXIT_CODE
