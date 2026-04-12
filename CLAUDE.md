# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Frollz is a full-stack film photography tracking application — a self-hosted monorepo that ships as a single combined container (NestJS API + Vue SPA) backed by PostgreSQL 18.

- **Production**: one `frollz` container (port 3000) + `postgres`. NestJS serves `/api/*` and the built Vue SPA. Place a reverse proxy (NPM, Traefik, Caddy) in front for HTTPS.
- **Development**: run API and UI locally — no Docker required. The API uses SQLite automatically when `NODE_ENV=development`. The Vite dev server proxies `/api` to `localhost:3000`.

## Commands

### Docker (Production only)

> **IMPORTANT**: This environment uses `docker compose` (the plugin), **not** `docker-compose` (the legacy standalone binary). Always use the two-word form. `docker-compose` will fail with "command not found".

**Production** (combined container, what self-hosters run):
```bash
docker compose up -d          # Start frollz + PostgreSQL
docker compose down           # Stop all services
docker compose logs -f        # Tail logs
```

To build the production image locally:
```bash
docker build -t frollz:local .
```

### Backend (frollz-api)

```bash
npm run start:dev       # Watch mode dev server (SQLite, no DB setup needed)
npm run build           # Compile TypeScript to dist/
npm run clean           # Remove dist/ and dev.db
npm run lint            # ESLint with auto-fix
npm run format          # Prettier format
npm test                # Run unit tests (Jest)
npm run test:watch      # Jest watch mode
npm run test:cov        # Coverage report
npm run test:integration  # Integration tests (SQLite in-memory)
npm run migrate         # Run Knex migrations (production PostgreSQL via knexfile.ts)
npm run migrate:rollback  # Rollback last migration batch
npm run seed            # Run seeds manually (production PostgreSQL via knexfile.ts)
```

### Frontend (frollz-ui)

```bash
npm run dev             # Vite dev server (port 5173, proxies /api → localhost:3000)
npm run build           # Production build
npm run clean           # Remove dist/ and node_modules
npm run type-check      # Vue TSC type validation
npm run lint            # ESLint with auto-fix
npm run format          # Prettier format
npm run test            # Vitest unit tests
```

### Local Development Startup

No Docker or environment variables needed for development:

```bash
# Terminal 1 — API (SQLite auto-selected, dev.db created in frollz-api/)
cd frollz-api && npm run start:dev

# Terminal 2 — UI (proxies /api to localhost:3000)
cd frollz-ui && npm run dev
```

Browse to `http://localhost:5173`.

## Codebase Memory MCP

The `codebase-memory-mcp` server is installed, connected, and **must be used** for all structural code exploration. The graph is automatically kept up-to-date after every file edit.

### MCP-First Rule — No Exceptions

**ALWAYS use MCP tools for structural questions.** Do NOT reach for Grep, Glob, or Bash find commands to explore the codebase structure. These are slower, noisier, and can miss cross-file relationships that the graph captures instantly.

| Question type | MCP tool to use | Do NOT use |
|---|---|---|
| Where is function X defined? | `search_graph` | Grep |
| What calls function X? | `trace_call_path` (inbound) | Grep |
| What does function X call? | `trace_call_path` (outbound) | Grep |
| How is the codebase organized? | `get_architecture` | ls / find |
| What files changed and what's the blast radius? | `detect_changes` | git diff + Grep |
| Find all classes/functions matching a pattern | `search_graph` | Glob |
| Complex relationship queries | `query_graph` | multiple Greps |
| Regex search across file content | `search_code` | Grep |

Only fall back to Read/Grep for viewing **raw file content** that the graph doesn't expose (e.g., reading a specific line range to understand implementation detail).

Key tools:
- `get_architecture` — start here for codebase orientation (entry points, hotspots, clusters)
- `search_graph` — find functions, classes, or symbols by name pattern
- `trace_call_path` — find callers/callees of a function (direction: `inbound` or `outbound`)
- `detect_changes` — map git diffs to affected symbols and blast radius
- `get_code_snippet` — retrieve source with metadata (signature, complexity, callers/callees)
- `query_graph` — Cypher-like queries for complex relationship analysis
- `search_code` — regex text search across files (replaces grep)

The graph is always current — no need to run `index_repository` manually.

## Architecture

### Backend (NestJS)

The API is organized into five NestJS feature modules registered in `AppModule`:

| Module | Responsibility |
|--------|---------------|
| `DatabaseModule` | Provides `KNEX_CONNECTION` token (SQLite in dev/test, PostgreSQL in prod) and runs migrations + seeds via `MigrationRunnerService` on startup |
| `EmulsionModule` | Film stocks (emulsions) — CRUD + filtering |
| `FilmModule` | Film rolls — CRUD, filtering by emulsion/format/tag, bulk canisters, instant film |
| `FilmStateModule` | Roll lifecycle state machine — transitions, history |
| `TransitionModule` | Exposes valid transition graph to the UI |
| `SharedModule` | Cross-domain resources: film formats, packages, processes, tags |

Each module follows the pattern: `controller / service / module / dto`. Domain entities and repository interfaces live under `src/domain/`; infrastructure implementations under `src/infrastructure/`.

**Database access**: `KnexProvider` (token: `KNEX_CONNECTION`) selects the database at startup:
- `NODE_ENV=test` → SQLite in-memory (`better-sqlite3`)
- `NODE_ENV=development` → SQLite file (`dev.db` in `frollz-api/`)
- anything else → PostgreSQL (env vars required)

`MigrationRunnerService.onModuleInit` runs both `knex.migrate.latest()` and `knex.seed.run()` automatically on every startup. Migrations live in `frollz-api/migrations/`; seeds in `frollz-api/seeds/`.

Default seed data is loaded on first run. Two tiers: **system data** (auto-managed tags: `expired`, `pushed`, `pulled`, `cross-processed`) is always synced; **convenience data** (film formats, stocks, tags) is only copied when `DISABLE_DEFAULT_DATA_IMPORT` is not set.

In the combined production container, `ServeStaticModule` (registered conditionally when `/app/public` exists) serves the Vue SPA for all non-`/api` routes. Security headers applied by `helmet` in `main.ts`.

A `ValidationPipe` with `transform: true`, `whitelist: true`, `forbidNonWhitelisted: true` is applied globally. Swagger docs at `/api/docs`.

**Bulk films (canisters)**: A film with `transitionProfile: "bulk"` acts as a canister parent. Child films are created with `parentFilmId` and inherit emulsion, process, and expiration from the parent.

**Instant film**: Films with `transitionProfile: "instant"` skip the lab workflow states. The profile is auto-set when the parent emulsion's process is `"Instant"`.

### Frontend (Vue 3 + Vite + Pinia + Tailwind)

All HTTP calls go through `src/services/api-client.ts` (Axios-based). Views never call fetch directly. `VITE_API_URL` defaults to `/api` (relative), which works in both production (same-origin) and development (Vite proxies `/api` → `localhost:3000`).

Six routes map to domain views:

| Route | View | Notes |
|-------|------|-------|
| `/` | `Dashboard.vue` | Stats overview |
| `/stocks` | `StocksView.vue` | Emulsion catalog |
| `/rolls` | `RollsView.vue` | Film list with emulsion/format/tag filters |
| `/rolls/:key` | `RollDetailView.vue` | Roll detail + state transitions |
| `/formats` | `FilmFormatsView.vue` | Film formats |
| `/tags` | `TagsView.vue` | Tags |

Shared components in `src/components/`: `TypeaheadInput.vue`, `SpeedTypeaheadInput.vue`, `NavBar.vue`, `BaseModal.vue`, `StatCard.vue`, `AppAnnouncer.vue`.

### Environment Variables

Only needed for **production** (PostgreSQL). Development uses SQLite with no env vars.

| Variable | Service | Default |
|----------|---------|---------|
| `DATABASE_HOST` | API (prod) | `postgres` |
| `DATABASE_PORT` | API (prod) | `5432` |
| `DATABASE_NAME` | API (prod) | `frollz` |
| `DATABASE_USER` | API (prod) | `frollz` |
| `DATABASE_PASSWORD` | API (prod) | `frollz` |
| `PORT` | API | `3000` |
| `VITE_API_URL` | UI | `/api` |
| `API_PROXY_TARGET` | UI dev server | `http://localhost:3000/` |

For production deployment: copy `.env.example` to `.env` and fill in values before running `docker compose up`.

## Skills

Available Claude Code skills that improve workflow efficiency in this project:

| Skill | When to use |
|-------|-------------|
| `/feature-dev` | Start here when picking up a new GitHub issue — produces an architecture-aware implementation plan before writing code |
| `/codebase-memory-tracing` | Understand call chains and blast radius before modifying a function |
| `/codebase-memory-quality` | Periodic dead-code and complexity audits |
| `/simplify` | After implementing a feature — focused cleanup pass on changed code |
| `/code-review` | Self-review before opening a PR |
| `/commit` | Standardised commit with message generation |
| `/commit-push-pr` | Commit + push + open PR in one shot |
| `/claude-md-improver` | Audit and update this file after significant changes |

## Workflow

### Local Setup (required once per clone)

```bash
git config core.hooksPath .githooks
cd frollz-api && npm install
cd ../frollz-ui && npm install
```

The pre-commit hook at `.githooks/pre-commit` runs UI lint, UI type-check, UI tests, API lint, API tests, and Semgrep SAST before every commit. This mirrors CI exactly.

### GitHub Issues

**Before starting any work on a new issue, always run these steps in order — no exceptions:**

```bash
git checkout development
git fetch origin
git pull origin development
git checkout -b feature/{issue-number}-{issue-title-slug}
```

Branch naming rules:
- Format: `feature/{issue-number}-{issue-title-slug}` (e.g. `feature/55-roll-state-transitions`)
- Slugify the issue title: lowercase, spaces → hyphens, remove special characters
- Use `fix/` prefix only for pure bug fixes unrelated to a feature issue

Additional rules:
1. **Wait for approval before submitting a PR** — do not auto-merge or auto-create PRs.
2. Prefer `gh` CLI for git operations.

### Review Checklist (after every code change)

- Before modifying existing functionality, use `/codebase-memory-tracing` or run `detect_changes` to understand blast radius and identify affected callers
- All modified code has unit tests and all tests pass
- All code passes linting rules (`npm run lint`)
- Code has been simplified with readability in mind
- `docs/adr/architecture.md` is updated to reflect any architectural changes

### Architectural Decision-Making

When choosing between approaches, **always pursue the architecturally cleaner solution** unless there is a concrete, articulable reason not to.

Guidelines:
- Follow established patterns: NestJS feature modules, `KNEX_CONNECTION` injection, centralized `api-client.ts`
- Prefer explicit over implicit — don't hide behavior in middleware or base classes without a clear reason
- When a simpler path is genuinely better, state the reason explicitly
- If uncertain between clean and simple, describe both options and the trade-off before proceeding

### Context Preservation

If the session is compacted mid-task, a summary is automatically written to `/tmp/claude-frollz-state.md`. Read this file at the start of a resumed session to restore context.
