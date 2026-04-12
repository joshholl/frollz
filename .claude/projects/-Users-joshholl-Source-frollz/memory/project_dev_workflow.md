---
name: Dev workflow — no Docker, SQLite local
description: Development runs locally without Docker; API uses SQLite when NODE_ENV=development
type: project
---

Development no longer requires Docker. Run `npm run start:dev` in `frollz-api/` (auto-selects SQLite `dev.db`) and `npm run dev` in `frollz-ui/` (proxies `/api` → localhost:3000). No env vars needed for dev.

**Why:** `KnexProvider` selects the database driver based on `NODE_ENV`: `test`→SQLite in-memory, `development`→SQLite file (`dev.db`), anything else→PostgreSQL. `start:dev` script sets `NODE_ENV=development`.

**How to apply:** Never tell the user to start Docker for development. Never suggest setting DB env vars for local dev. If they need to wipe the DB, `npm run clean` removes `dev.db`.
