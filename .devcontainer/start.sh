#!/usr/bin/env bash
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

pkill -f "node --watch index.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

cd "$ROOT/ai-prompt-lab/server"
nohup npm run dev > /tmp/prompt-forge-server.log 2>&1 &

cd "$ROOT/ai-prompt-lab/client"
nohup npm run dev > /tmp/prompt-forge-client.log 2>&1 &
