# Prompt Forge

A personal AI-prompt studio, inspired by the dashboard layout of "The AI Creator Lab"
member tools, rebuilt from scratch with its own design and your own data.

- **Prompt Libraries** — collections of prompts you create and tag.
- **Bots** — Muse (collection brainstorming), Lettering, and a general Prompt
  Generator, each calling Claude live to suggest new prompts you can save.
- **Key Prompts** — your starred prompts from every collection.
- **Idea Board** — a 3-column board (Idea / In Progress / Done) for tracking prompt ideas.
- **Tools** — Clipart Grid, Bulk Rename, 300 DPI Converter, Bulk Trim & Resize,
  Listing Image Preview, and Pattern Checker. All run client-side in the browser.

## Stack

- `server/` — Express + SQLite (file-based, no setup), proxies the Anthropic API.
- `client/` — React + TypeScript + Vite + Tailwind CSS.

## Setup

```bash
cd server && npm install
cp .env.example .env   # then add your ANTHROPIC_API_KEY
npm run dev             # http://localhost:4000

cd ../client && npm install
npm run dev              # http://localhost:5173 (proxies /api to :4000)
```

The Bots page works without an API key configured, but generation requests
will return an error until `ANTHROPIC_API_KEY` is set in `server/.env`. Everything
else (libraries, board, tools) works with no key at all.
