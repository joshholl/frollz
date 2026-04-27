# Step 6: Film Event Form Refactor with Per-State Components

## Overview
Replace the monolithic [id].vue film event form with a parent orchestrator component and 9 state-specific sub-form components. Each sub-form validates its own fields, constructs eventData, and emits a full payload to the parent for API submission.

## Architecture

### Parent Component: `FilmEventForm.vue`
**Location:** `apps/ui/src/components/FilmEventForm.vue`

**Responsibilities:**
- Manage state selection dropdown (allowed next states from transition map)
- Hold shared form state: `occurredAt`, `notes`, `isSubmitting`, `idempotencyKey`
- Conditionally render the selected state's form component
- Listen for submit event from sub-form
- Construct API payload: `{ filmStateCode, occurredAt, notes, eventData }`
- Call API: `POST /film/:id/events`
- Handle errors (show validation errors, keep form displayed)

**Props:** None (uses filmId from route)

**Emits:**
- `event-added` — After successful API call (to refresh parent page)

---

### Sub-Form Components
**Location:** `apps/ui/src/components/film-event-forms/`

Each component follows the same pattern:

```ts
interface Props {
  occurredAt: string;
  notes: string;
  isSubmitting: boolean;
}

interface Emits {
  submit: [payload: FilmJourneyEventPayload]
}
```

**Sub-Forms to Create:**

1. **PurchasedEventForm.vue** — No state-specific fields
2. **StoredEventForm.vue** — Select storage location
3. **LoadedEventForm.vue** — Select device, optional slot (if film_holder), optional push/pull
4. **ExposedEventForm.vue** — No state-specific fields
5. **RemovedEventForm.vue** — No state-specific fields
6. **SentForDevEventForm.vue** — Lab name, contact, optional actual push/pull
7. **DevelopedEventForm.vue** — Lab name, optional actual push/pull
8. **ScannedEventForm.vue** — Scanner/software, scan link
9. **ArchivedEventForm.vue** — No state-specific fields

---

## Schema Definitions

**Location:** `packages/schema/src/film.ts`

Add per-state form schemas. Each schema includes:
- Shared fields: `occurredAt`, `notes`
- State-specific fields
- Field-level validation messages

### Schema List

```ts
// Shared base fields (reused in all schemas)
const eventFormBaseFields = {
  occurredAt: z.string().min(1, 'Required'), // datetime-local format
  notes: z.string().optional(),
};

// Empty-eventData states
export const purchasedEventFormSchema = z.object(eventFormBaseFields);
export const exposedEventFormSchema = z.object(eventFormBaseFields);
export const removedEventFormSchema = z.object(eventFormBaseFields);
export const archivedEventFormSchema = z.object(eventFormBaseFields);

// Location-based
export const storedEventFormSchema = z.object({
  ...eventFormBaseFields,
  storageLocationId: idSchema,
});

// Lab-based
export const sentForDevEventFormSchema = z.object({
  ...eventFormBaseFields,
  labName: z.string().optional(),
  labContact: z.string().optional(),
  actualPushPull: z.number().int().optional(),
});

export const developedEventFormSchema = z.object({
  ...eventFormBaseFields,
  labName: z.string().optional(),
  actualPushPull: z.number().int().optional(),
});

// Scan-based
export const scannedEventFormSchema = z.object({
  ...eventFormBaseFields,
  scannerOrSoftware: z.string().optional(),
  scanLink: z.string().optional(),
});

// Load (complex discriminated union for device types)
export const loadedEventFormSchema = z.object({
  ...eventFormBaseFields,
  deviceId: idSchema,
  slotNumber: z.union([z.literal(1), z.literal(2)]).optional(),
  intendedPushPull: z.number().int().optional(),
});

// Export all as a map for easy lookup
export const filmEventFormSchemas = {
  purchased: purchasedEventFormSchema,
  stored: storedEventFormSchema,
  loaded: loadedEventFormSchema,
  exposed: exposedEventFormSchema,
  removed: removedEventFormSchema,
  sent_for_dev: sentForDevEventFormSchema,
  developed: developedEventFormSchema,
  scanned: scannedEventFormSchema,
  archived: archivedEventFormSchema,
} as const;

// Export types
export type PurchasedEventForm = z.infer<typeof purchasedEventFormSchema>;
export type StoredEventForm = z.infer<typeof storedEventFormSchema>;
// ... etc for all states
```

---

## Data Flow

### 1. User Selects State
```
User clicks dropdown → Parent updates selectedStateCode → Component re-renders appropriate sub-form
```

### 2. User Fills Form & Submits
```
Sub-form:
  1. Collect form data (state-specific fields + shared occurredAt/notes from props)
  2. Validate with useRegleSchema
  3. If valid: construct eventData object
  4. Emit full payload to parent

Parent:
  1. Receive submit event with full payload
  2. Set isSubmitting = true
  3. Call API: POST /film/:id/events with payload
  4. On success: emit 'event-added' to refresh parent
  5. On error: display error message, keep form displayed
  6. Set isSubmitting = false
```

### 3. EventData Construction Examples

**Stored Event:**
```ts
const eventData = {
  storageLocationId: form.storageLocationId,
  storageLocationCode: storageLocation.code
}
```

**Loaded Event (with device type discrimination):**
```ts
const device = selectedDevice.value;
const eventData = device.deviceTypeCode === 'camera'
  ? { loadTargetType: 'camera_direct', cameraId: device.id, intendedPushPull: form.intendedPushPull }
  : device.deviceTypeCode === 'interchangeable_back'
  ? { loadTargetType: 'interchangeable_back', interchangeableBackId: device.id, intendedPushPull: form.intendedPushPull }
  : { loadTargetType: 'film_holder_slot', filmHolderId: device.id, slotNumber: form.slotNumber, intendedPushPull: form.intendedPushPull };
```

---

## Implementation Steps

### Phase 1: Schemas (Day 1)
- [ ] Add all 9 form schemas to `packages/schema/src/film.ts`
- [ ] Export types for each schema
- [ ] Run `pnpm --filter @frollz2/schema build`
- [ ] Verify no type errors

### Phase 2: Parent Component (Day 1)
- [ ] Create `FilmEventForm.vue` with:
  - State selection dropdown
  - Shared refs: occurredAt, notes, isSubmitting, idempotencyKey
  - Conditional sub-form rendering
  - Submit handler (API call)
  - Error display

### Phase 3: Sub-Forms (Day 2)
- [ ] Create base template sub-form
- [ ] Implement each of 9 sub-forms:
  - Start with simple ones (purchased, exposed, removed, archived)
  - Then location-based (stored)
  - Then lab-based (sent_for_dev, developed)
  - Then scan-based (scanned)
  - Finally complex (loaded)
- [ ] Each uses useRegleSchema with its schema
- [ ] Each constructs eventData internally
- [ ] Each emits full payload on submit

### Phase 4: Integration (Day 2)
- [ ] Update [id].vue to use new `FilmEventForm.vue`
- [ ] Remove old form refs, buildEventData(), resetEventFields()
- [ ] Listen for `event-added` emit to refresh events
- [ ] Test form submission end-to-end

### Phase 5: Testing & Polish (Day 3)
- [ ] Run type check: `pnpm --filter @frollz2/ui check-types`
- [ ] Run lint: `pnpm --filter @frollz2/ui lint`
- [ ] Run tests: `pnpm --filter @frollz2/ui test`
- [ ] Manual smoke test:
  - Select each state transition
  - Fill form with valid data
  - Submit and verify API call
  - Test validation errors
  - Test error recovery

---

## Key Design Decisions

1. **No Discriminated Union in Form Schemas** — Each state has its own simple schema, avoiding the complexity of discriminated unions. Discrimination happens at render time (which sub-form to show).

2. **EventData Construction in Sub-Forms** — Each sub-form knows how to build its own eventData, including device type discrimination for `loaded` event.

3. **Shared Fields as Props** — `occurredAt` and `notes` are managed by parent, passed as props. This keeps them synchronized across all sub-forms and ensures consistent submission.

4. **Full Payload Emission** — Sub-forms emit complete payloads (filmStateCode + occurredAt + notes + eventData), so parent can submit directly without additional assembly.

5. **Error Stays in Form** — Validation errors displayed inline. User must fix and resubmit. No auto-reset.

---

## Files to Create/Modify

### New Files
```
apps/ui/src/components/FilmEventForm.vue
apps/ui/src/components/film-event-forms/PurchasedEventForm.vue
apps/ui/src/components/film-event-forms/StoredEventForm.vue
apps/ui/src/components/film-event-forms/LoadedEventForm.vue
apps/ui/src/components/film-event-forms/ExposedEventForm.vue
apps/ui/src/components/film-event-forms/RemovedEventForm.vue
apps/ui/src/components/film-event-forms/SentForDevEventForm.vue
apps/ui/src/components/film-event-forms/DevelopedEventForm.vue
apps/ui/src/components/film-event-forms/ScannedEventForm.vue
apps/ui/src/components/film-event-forms/ArchivedEventForm.vue
```

### Modified Files
```
packages/schema/src/film.ts (add schemas + types)
apps/ui/src/pages/film/[id].vue (simplify to use new FilmEventForm)
```

---

## Success Criteria

- ✅ All schemas pass type checking
- ✅ Parent component renders and responds to state selection
- ✅ Each sub-form displays when selected
- ✅ Form validation works per sub-form
- ✅ Sub-form submission emits correct full payload
- ✅ Parent receives payload and calls API
- ✅ Successful submission clears form and emits event-added
- ✅ Failed submission shows errors in form
- ✅ All 17 UI tests still pass
- ✅ Lint and type check pass
- ✅ Manual smoke test: all 9 state transitions work end-to-end
