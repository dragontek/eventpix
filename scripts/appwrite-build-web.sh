#!/usr/bin/env bash
set -euo pipefail

# Build the Next.js standalone application
pnpm run build

# Appwrite Sites / SSR expects standalone assets:
cp -r public .next/standalone/public 2>/dev/null || true
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
