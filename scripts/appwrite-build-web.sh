#!/usr/bin/env bash
set -euo pipefail

pnpm --filter web build

# Appwrite Sites SSR bundler expects a monorepo-independent layout:
#   next.config.*            at build root
#   .next/standalone/server.js  as the runtime entry point
#   public/ and .next/static inside the standalone app dir
rm -rf .next
mkdir -p .next/standalone
cp -r apps/web/.next/standalone/* .next/standalone/
cp -r apps/web/public .next/standalone/apps/web/public
cp -r apps/web/.next/static .next/standalone/apps/web/.next/static
cp apps/web/next.config.ts ./next.config.ts
echo "require('./apps/web/server.js')" > .next/standalone/server.js
