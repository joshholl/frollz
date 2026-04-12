---
name: Domain terminology — emulsion/film not stock/roll
description: The API domain was refactored; stock→emulsion, roll→film, roll-state→film-state
type: project
---

The API domain terminology was refactored. Old names are gone from the codebase:
- `stock` → `emulsion` (EmulsionModule)
- `roll` → `film` (FilmModule)
- `roll-state` → `film-state` (FilmStateModule)
- `stock-tag` → `emulsion-tag`
- `film-tag` is new
- `film-format`, `tag`, `package`, `process` now live in `SharedModule`

The UI route names (`/stocks`, `/rolls`) have changed.
- `/stocks` → `/emulsions`
- `/rolls` → `/films`

**Why:** Domain refactor to use more accurate photography terminology (emulsion = film stock, film = roll of film).

**How to apply:** Use new names in all code. Do not create new files/classes using old names like `RollService`, `StockRepository`, `RollStateController`.
