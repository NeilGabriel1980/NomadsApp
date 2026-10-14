# Neston Nomads Vikings — Season Hub

A season hub for a grassroots football team: season results, top scorers, awards, player cards, player lookup, milestones, and shared weekly match reports.

## Run & Operate

- `pnpm --filter @workspace/vikings-hub run dev` — run the Vikings Hub web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-server run dev` — run the API server for shared match reports
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required secret: `REPORT_EDITOR_KEY` — protects publishing and deleting match reports

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Vikings Hub (`artifacts/vikings-hub`): React + Vite, wouter routing, Recharts; season data is embedded, while shared match reports use the API and PostgreSQL
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/vikings-hub/src/data/season.ts` and `season-2026-27.ts` — season data and player statistics
- `artifacts/vikings-hub/src/pages/` — Home, Matches, Leaderboards, Squad, Player Lookup, public Reports, private Add Result editor, and Records pages
- `artifacts/api-server/src/routes/match-reports.ts` — public report reads and protected create/delete operations
- `artifacts/api-server/src/routes/season-matches.ts` — public live-season reads and protected result create/update/delete operations
- `lib/db/src/schema/match-reports.ts` — shared match report storage
- `lib/db/src/schema/season-matches.ts` and `season-match-events.ts` — live results and player goal storage

## Architecture decisions

- Historical 2025/26 data remains static and embedded. The active 2026/27 season is calculated from shared matches and player goals stored through the API; weekly match reports use the same API and PostgreSQL.

## Product

- **Vikings Hub**: Home, Matches, Leaderboards, Squad, Player Lookup, public Match Reports, private `/editor` (protected match/stat and report editor), and Records.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
