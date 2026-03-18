# Issue #55 — Roll State Transitions: Implementation Plan

**Parent issue:** #55
**Sub-issues:** #59–#68
**Status as of 2026-03-18:**
- Phase 1 ✅ merged (PR #69) — metadata columns, is_error_correction, seed auto-tags
- Phase 2 🔄 in progress (branch: `feature/59-60-cross-cutting-transitions`) — error correction prompt (#60), expired auto-tag (#59 partial)
- Phases 3–6 pending

---

## Architecture conventions (established in phases 1–2)

- State-specific metadata is stored in `roll_states.metadata` (JSONB)
- `RollTagService.syncAutoTag(rollKey, tagId, shouldApply)` is the canonical way to apply/remove auto-tags
- Auto-tags use fixed `_key` values that match their `id` in the DB: `expired`, `pushed`, `pulled`, `cross-processed`
- Frontend: backward transitions show an inline "Was this done to correct an error?" prompt before calling the API
- Branch naming: `feature/{issue-number}-{slug}` off `development`

---

## Phase 3 — Storage states (#61, #62, #63, #64)

**Branch:** `feature/61-64-storage-state-metadata`
**Issues closed:** #61, #62, #63, #64

### What each state captures (stored in `metadata` JSONB)

| State | Fields |
|-------|--------|
| FROZEN | `temperature?: number` (locale default: -18°C / 0°F) |
| REFRIGERATED | `temperature?: number` (locale default: 4°C / 39°F) |
| SHELVED | `temperature?: number` (locale default: 18°C / 65°F) |
| LOADED | _(no extra metadata beyond the transition date)_ |

### Backend changes

1. **`TransitionRollDto`** — no changes needed; `metadata` is already an accepted field passed through to `roll_states`
2. **`roll.service.ts` `transition()`** — pass `dto.metadata` through to `rollStateService.create()` (already wired from Phase 1 if DTO accepts it — verify and wire if not)

Actually: the `transition()` method needs to forward `metadata` from `TransitionRollDto` to `CreateRollStateDto`. Check `TransitionRollDto` — if it doesn't have `metadata`, add:
```ts
@ApiProperty({ required: false })
@IsOptional()
@IsObject()
metadata?: Record<string, unknown>;
```
And in `roll.service.ts transition()`:
```ts
await this.rollStateService.create({
  ...
  metadata: dto.metadata,
});
```

3. **No new DB columns needed** — `metadata` JSONB column already exists on `roll_states`
4. **No auto-tag changes** for these states

### Frontend changes

In `RollDetailView.vue`, when the user clicks a transition button for FROZEN, REFRIGERATED, or SHELVED:
- Show an inline metadata form (similar to the error correction prompt pattern)
- Fields: `temperature` (number input, pre-filled with locale-appropriate default)
- For LOADED: no extra form needed
- On submit, include `{ metadata: { temperature } }` in the transition payload

**Temperature locale defaults (detect via `navigator.language`):**
- `en-US` → Fahrenheit: FROZEN=0°F, REFRIGERATED=39°F, SHELVED=65°F
- All others → Celsius: FROZEN=-18°C, REFRIGERATED=4°C, SHELVED=18°C

**Display:** In the history timeline, show temperature from `entry.metadata.temperature` if present, with unit label.

### Tests
- Backend: `transition()` passes `metadata` through (update roll.service.spec.ts)
- Frontend: metadata form appears for storage states, temperature is included in payload

---

## Phase 4 — Shooting state (#65)

**Branch:** `feature/65-finished-state-shot-iso`
**Issues closed:** #65

### What FINISHED captures (stored in `metadata` JSONB)

| Field | Type | Required |
|-------|------|----------|
| `shotISO` | number | No |

### Auto-tag logic (triggered on FINISHED transition)

In `roll.service.ts transition()`, after recording the state:
1. Fetch the roll's stock to get `stock.speed`
2. If `dto.metadata?.shotISO` is set:
   - `shotISO > speed` → `syncAutoTag(rollKey, 'pushed', true)` + `syncAutoTag(rollKey, 'pulled', false)`
   - `shotISO < speed` → `syncAutoTag(rollKey, 'pulled', true)` + `syncAutoTag(rollKey, 'pushed', false)`
   - `shotISO === speed` → remove both
3. If `shotISO` is not set → remove both

```ts
private async syncPushPullTags(rollKey: string, shotISO?: number, stockSpeed?: number): Promise<void> {
  const pushed = !!(shotISO && stockSpeed && shotISO > stockSpeed);
  const pulled = !!(shotISO && stockSpeed && shotISO < stockSpeed);
  await this.rollTagService.syncAutoTag(rollKey, 'pushed', pushed);
  await this.rollTagService.syncAutoTag(rollKey, 'pulled', pulled);
}
```

Call this only when transitioning to FINISHED. To get stock speed, inject `DatabaseService` (already available) and query:
```ts
const stocks = await this.databaseService.query('SELECT speed FROM stocks WHERE id = ?', [roll.stockKey]);
```

### Frontend changes

When the user clicks FINISHED:
- Show inline form: `shotISO` (number input, optional, placeholder "Box speed")
- Include `{ metadata: { shotISO } }` in transition payload

**Display:** In history timeline for FINISHED entries, show shot ISO if present.

### Tests
- `syncPushPullTags` unit tests: pushed/pulled/neither cases
- Integration: transition to FINISHED with shotISO calls syncAutoTag correctly

---

## Phase 5 — Lab states (#66, #67)

**Branch:** `feature/66-67-lab-state-metadata`
**Issues closed:** #66, #67

### What SENT_FOR_DEVELOPMENT captures (stored in `metadata` JSONB)

| Field | Type | Required |
|-------|------|----------|
| `labName` | string | Yes |
| `deliveryMethod` | `'Drop off' \| 'Mail in'` | Yes |
| `processRequested` | `'C-41' \| 'E-6' \| 'Black & White' \| 'Instant'` | Yes |
| `pushPullStops` | number (integer) | No |

### What DEVELOPED captures (stored in `metadata` JSONB)

No extra metadata beyond the date (which is already the transition date field).

### Auto-tag logic (triggered on SENT_FOR_DEVELOPMENT)

```ts
private async syncCrossProcessedTag(rollKey: string, stockKey: string, processRequested?: string): Promise<void> {
  if (!processRequested) return;
  const stocks = await this.databaseService.query('SELECT process FROM stocks WHERE id = ?', [stockKey]);
  if (stocks.length === 0) return;
  const stockProcess = stocks[0].process as string;
  const isCrossProcessed = processRequested !== stockProcess;
  await this.rollTagService.syncAutoTag(rollKey, 'cross-processed', isCrossProcessed);
}
```

Call this only when transitioning to SENT_FOR_DEVELOPMENT.

### Frontend changes

**SENT_FOR_DEVELOPMENT form:**
- `labName` — text input (required)
- `deliveryMethod` — select: Drop off / Mail in (required)
- `processRequested` — select: C-41 / E-6 / Black & White / Instant (required)
- `pushPullStops` — number input (optional); display below as "pushed X stops" / "pulled X stops"

**DEVELOPED:** No extra form needed.

**Display:** In history timeline for SENT_FOR_DEVELOPMENT entries, show lab name, delivery method, process, and push/pull stops if present.

### Tests
- `syncCrossProcessedTag` unit tests: cross-process detected / not detected
- Frontend: SENT_FOR_DEVELOPMENT form validation (labName, deliveryMethod, processRequested required)

---

## Phase 6 — Return state (#68)

**Branch:** `feature/68-received-state-metadata`
**Issues closed:** #68, and close #59 (auto-tagging fully complete) if not already closed

### What RECEIVED captures (stored in `metadata` JSONB)

| Field | Type | Notes |
|-------|------|-------|
| `scansReceived` | boolean | If true, expose scansUrl + scansDate |
| `scansUrl` | string (URL) | Optional, only if scansReceived=true |
| `scansDate` | date | Only if scansReceived=true, defaults to today |
| `negativesReceived` | boolean | If true, expose negativesDate |
| `negativesDate` | date | Only if negativesReceived=true, defaults to today |

### Backend changes

No auto-tag logic for RECEIVED.

### Frontend changes

When the user clicks RECEIVED:
- Checkbox: "Scans received?" → if checked, show `scansUrl` (text, optional) and `scansDate` (date, default today)
- Checkbox: "Negatives received?" → if checked, show `negativesDate` (date, default today)

**Display:** In history timeline for RECEIVED entries, show scans/negatives receipt summary.

### Final step — remove this plan file

As the last action in Phase 6, delete `.claude/plans/issue-55-implementation.md` and commit the deletion as part of the Phase 6 PR.

```bash
git rm .claude/plans/issue-55-implementation.md
```

Include in the commit message: "chore: remove completed implementation plan for #55"

---

## PR checklist (all phases)

1. `npm test` passes in both `frollz-api/` and `frollz-ui/`
2. `npm run lint` passes in both
3. All issues referenced in PR body
4. PR targets `development`
5. Wait for approval before merging
