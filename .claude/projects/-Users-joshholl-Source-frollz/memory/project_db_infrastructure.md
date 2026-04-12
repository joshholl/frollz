---
name: Database infrastructure — KnexProvider not DatabaseService
description: DatabaseService no longer exists; replaced by KnexProvider (KNEX_CONNECTION token) + MigrationRunnerService
type: project
---

`DatabaseService` has been removed. The current infrastructure:
- `KnexProvider` provides a `KNEX_CONNECTION` symbol — inject this directly in repositories/services
- `MigrationRunnerService.onModuleInit` runs both `knex.migrate.latest()` and `knex.seed.run()` on startup
- Migrations in `frollz-api/migrations/`, seeds in `frollz-api/seeds/`

**Why:** Cleaner separation — provider handles connection, a dedicated service handles migration lifecycle.

**How to apply:** Inject `@Inject(KNEX_CONNECTION) private readonly knex: Knex` in repositories. Never reference `DatabaseService`.
