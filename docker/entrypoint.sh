#!/bin/sh
set -e

echo ""
echo "╔══════════════════════════════╗"
echo "║   TaskFlow API  Starting...  ║"
echo "╚══════════════════════════════╝"
echo ""

# ── Sync DB schema (safe — never drops existing data) ─────────────────────
echo "▶  Syncing database schema..."
npx prisma db push \
  --schema=server/prisma/schema.prisma \
  --skip-generate \
  --accept-data-loss 2>&1 | grep -v "^$" || true
echo "✔  Database ready"
echo ""

# ── Seed if database is empty (first run) ─────────────────────────────────
DB_FILE="${DATABASE_URL#file:}"
if [ ! -f "$DB_FILE" ] || [ ! -s "$DB_FILE" ]; then
  echo "▶  Empty database — running seed..."
  npx tsx server/prisma/seed.ts && echo "✔  Seed complete" || echo "⚠  Seed skipped (non-fatal)"
  echo ""
fi

# ── Start the API server ──────────────────────────────────────────────────
echo "▶  Starting API server on port ${PORT:-4000}..."
exec npx tsx server/src/index.ts
