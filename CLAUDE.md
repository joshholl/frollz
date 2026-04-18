# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project

Frollz is a self-hosted film photography tracker — NestJS API + Vue 3 SPA monorepo, deployed as a single container backed by PostgreSQL 18. In development, the API uses SQLite automatically (`NODE_ENV=development`).

## Monorepo layout

```
apps/
  frollz-api/    ← NestJS API (@frollz/frollz-api)
  frollz-ui/     ← Vue 3 SPA (@frollz/frollz-ui)
packages/
  shared/        ← Zod schemas + inferred types, consumed by both API and UI (@frollz/shared)
  eslint-config/ ← shared ESLint flat config presets
  typescript-config/ ← shared tsconfig bases
  vitest-config/ ← shared Vitest setup (node + vue)
```

## Critical: package manager and task runner

All commands use **pnpm** (not npm) and are orchestrated through **turbo**.

```bash
# From repo root — runs across all packages via turbo
pnpm dev          # start API + UI in watch mode (builds packages/ first)
pnpm build        # production build
pnpm test         # run all tests
pnpm lint         # lint all packages
pnpm check-types  # TypeScript check across all packages
pnpm format       # format all packages
pnpm clean        # remove all dist/ and build artifacts

# Per-package (cd into apps/frollz-api or apps/frollz-ui first)
pnpm dev          # watch mode for that package only
pnpm test         # tests for that package only
pnpm lint         # lint that package only
pnpm check-types  # type-check that package only

# API-specific (from apps/frollz-api/)
pnpm migrate               # run pending knex migrations
pnpm migrate:rollback      # rollback last migration batch
pnpm seed                  # run seeds
pnpm test:integration      # integration tests (separate jest config)

# Shared package (must rebuild after changes)
cd packages/shared && pnpm build
```

## Critical: Docker command

Always use `docker compose` (plugin), never `docker-compose` (legacy).

## Codebase exploration — MCP first

**codebase-memory-mcp project name:** `Users-joshholl-Source-frollz` — use this exact string for every MCP call.

Use `codebase-memory-mcp` tools for all structural questions. Do NOT reach for Grep/Glob/Bash find.

- `get_architecture` — orientation
- `search_graph` — find functions/classes by name
- `trace_path` — callers / callees
- `detect_changes` — blast radius from git diff
- `get_code_snippet` — read source with context
- `search_code` — text search (replaces grep)

Fall back to Read/Grep only for raw file content (config values, line ranges).

## DDD feature flow — shared types first

All API input/output types are defined as Zod schemas in `packages/shared/src/index.ts`. No exceptions.

Full flow for any new domain feature:

1. **Define Zod schema** in `packages/shared/src/index.ts` → `pnpm build` in packages/shared
2. **Domain entity** → `apps/frollz-api/src/domain/{domain}/entities/{domain}.entity.ts`
3. **Repository interface** → `apps/frollz-api/src/domain/{domain}/repositories/{domain}.repository.interface.ts`
4. **Mapper** → `apps/frollz-api/src/infrastructure/persistence/{domain}/{domain}.mapper.ts`
5. **Knex repository** → `apps/frollz-api/src/infrastructure/persistence/{domain}/{domain}.knex.repository.ts`
6. **Service + Controller + Module** → `apps/frollz-api/src/modules/{domain}/`
7. **Register module** in `apps/frollz-api/src/app.module.ts`
8. **Migration** → `apps/frollz-api/migrations/YYYYMMDDHHmmss_{description}.ts`
9. **UI API client** → `apps/frollz-ui/src/services/api-client.ts` (import types from `@frollz/shared`, parse responses with `.parse()`)
10. **Store / View / Components / Router** as needed in `apps/frollz-ui/src/`

## Gitflow + conventional commits

Branch naming:
- `feat/{issue}-{slug}` — new feature
- `fix/{issue}-{slug}` — bug fix
- `chore/{slug}` — tooling, config, deps
- `docs/{slug}` — documentation only

Commit format (required for GitHub release changelogs):
```
type(scope): imperative description

Closes #123
```

Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`, `style`
Scopes: match the domain — `film`, `emulsion`, `camera`, `transition`, `shared`, `ui`, `api-client`, `db`, `ci`, `tooling`, `docs`

**Never commit directly to `main` or `develop`.**

## GitHub issue workflow

```bash
git checkout develop && git fetch origin && git pull origin develop
git checkout -b feat/{issue-number}-{slug}
```

## Rules

1. **Never work directly on `main` or `develop`.**
2. **Wait for user approval before submitting or merging a PR** — do not auto-merge.
3. Target branch for feature PRs is always `develop`. Release PRs target `main`.
4. `docs/adr/architecture.md` must be updated for any architectural change.
5. Use `/clear` between unrelated tasks to keep context clean.
6. Use subagents for codebase investigation — keeps file reads out of main context.

## Skills

| Skill | When to use |
|---|---|
| `/feature` | Full DDD feature from issue → shared types → API layers → migration → UI |
| `/commit` | Conventional commit with auto-detected scope — required for changelog |
| `/pr` | Open draft PR to develop with changelog-ready description |
| `/review` | Tech-lead review: DDD completeness, type drift, fragility, lint/types |
| `/codebase-memory` | Structural queries, tracing, quality audits |
| `/simplify` | Cleanup pass on changed code |
