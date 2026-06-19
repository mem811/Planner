#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT/ai-prompt-lab/server"
npm install
[ -f .env ] || cp .env.example .env

cd "$ROOT/ai-prompt-lab/client"
npm install
