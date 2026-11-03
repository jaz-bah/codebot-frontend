# Codebot — Frontend

Next.js 16.4.2 (App Router, Turbopack, Cache Components) + Tailwind v4 +
shadcn v4 UI. The SaaS workspace app: auth, dashboard CRUD features (todos,
notes, files, components, presets, experts, tools, IDE snippets, posts,
chat), global search, commands/MVC cheat sheets, code & rich-text editors.

> **LIVE:** https://codebotapp.vercel.app · API: https://codebot-backend-aued.onrender.com

## Repos & hosting

| Piece | Repo | Host |
|---|---|---|
| Frontend | `jaz-bah/codebot-frontend` (this repo) | Vercel |
| Backend (NestJS + BetterAuth + TypeORM + Socket.IO) | `jaz-bah/codebot-backend` | Render (long-running service — Socket.IO needs it, serverless can't host it) |
| Database | Neon PostgreSQL (pooled, SSL) | Neon |

## Environment

One knob drives every backend URL (auth, REST, chat socket): see
`src/lib/auth-client.ts` → `API_URL` from `NEXT_PUBLIC_API_URL`.

- Dev: `.env` → `NEXT_PUBLIC_API_URL=http://localhost:3000` (backend on
  :3000, frontend dev server on :3001).
- Prod: `.env.production` → `NEXT_PUBLIC_API_URL=https://codebot-backend-aued.onrender.com`.
  **`NEXT_PUBLIC_*` vars are inlined at build time** — the same value must
  also be set in the Vercel project env vars; redeploy after changing it.
- `.env*` files are gitignored — never commit real URLs/secrets.

## Getting started

```bash
npm ci
npm run dev      # http://localhost:3001 (backend owns :3000)
npm run build    # production build (loads .env.production)
```

## Project docs

- `Brain/` — LOG (chronological), MEMORY (decisions/gotchas), RUNBOOK
  (auth integration guide), TASKS, DESIGN (design system), MVC,
  api-guide/ (per-feature backend API contracts).
- `frontend-app/AGENTS.md` — Next.js version rules + TanStack Query
  conventions (all remote reads via useQuery, writes via useMutation).
