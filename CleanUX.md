# FilmsView UX Audit — Clean Design Review

**Date:** April 19, 2026  
**Page:** `/films` — FilmsView.vue  
**Audited against:** 7 Clean UX Principles  
**Lighthouse (films page):** Accessibility 96, Best Practices 100, SEO 100

---

## Principle 1: Simplicity & Minimalism 🔴 FAIL

### Problem: 6 competing action buttons in the header

The toolbar has Export JSON, Export Library, Import CSV, Import Library, Import Films JSON, and Add Film — six buttons on one row. Import/export are power-user operations performed rarely. They steal equal visual weight from the primary action (Add Film) and create immediate cognitive load before the user even sees their data.

**Fix:** Group the five secondary operations behind a single `⋯` overflow menu or split dropdown (Exports / Imports). Only **Add Film** belongs prominently in the header.

### Problem: Tags section is an unbounded word cloud

With real data (50+ tags visible in the screenshot), the Tags section in the filter panel is a dense, scrollable wall of chips. It scales terribly and makes the filter panel feel broken.

**Fix:** Replace the chip cloud with a searchable multi-select combobox (`<input>` that filters the tag list as you type). Shows nothing until the user types, then presents a clean dropdown. Chosen tags become chips above the input.

---

## Principle 2: Strategic White Space 🔴 FAIL

### Problem: Filter panel has no visual breathing room between sections

STATE → EMULSION/FORMAT → TAGS → LOADED DATE all run together without dividers or adequate vertical separation. The panel reads as a dense wall, not a structured set of independent filters.

**Fix:** Add a `border-t border-gray-700` divider between each section group, and increase `mb-4` to `mb-6` on each section. This alone will make the panel feel 40% less cluttered.

### Problem: Mobile header buttons occupy 3 rows before content

On 390px, the six action buttons wrap into a 2×3 grid that dominates the top of the page. The actual film list starts below the fold.

**Fix:** The overflow menu fix above reduces the mobile header to just **Add Film**, restoring immediate access to content.

---

## Principle 3: Consistency 🟡 PARTIAL

### Problem: State filter chips don't match state badge colors

In the table, state badges are color-coded: Finished=green, Added=amber, Loaded=orange. In the filter panel, state chips are all identical grey borders. A user can't make the mental connection that "clicking Finished here filters for these green badges in the table."

**Fix:** Color-code the STATE filter chips to match the badge palette. Selected state = filled badge color; unselected = grey border. The `getStateColor()` utility already exists.

### Problem: Import/Export naming is inconsistent

"Export JSON" vs "Export Library" vs "Import CSV" vs "Import Library" vs "Import Films JSON" — three different nouns (JSON, Library, CSV), no clear hierarchy of what each does.

**Fix:** Once grouped in an overflow menu, add a one-line description under each option (e.g. "Export Films JSON — machine-readable backup", "Export Library — emulsions, formats, and tags").

---

## Principle 4: Intuitive Navigation 🟡 PARTIAL

### Problem: Dual navigation paths on every table row

Clicking the film name navigates to detail. The **View** button also navigates to detail. Two affordances for the same action adds visual noise and the "View" button takes up a full column in the table.

**Fix:** Remove the explicit View button. Make the entire table row navigable. The film name's blue color already signals interactivity.

### Problem: No explicit close or apply for the filter panel

The only way to dismiss the filter panel is to click **Filters** again. First-time users scroll down looking for an Apply/Done button.

**Fix:** Add a subtle `✕ Close filters` text-link at the bottom-right of the panel, or a **Done** button. On mobile this prevents confusion.

### Problem: Filter panel is auto-apply with no feedback

Filters fire instantly on every change but there's no result count visible until the panel is closed and the table re-renders beneath it (below the fold on mobile).

**Fix:** Show a live `N results` count inside the filter panel itself, updating as filters change, so the user sees the effect before closing.

---

## Principle 5: Accessibility 🟡 PARTIAL — Lighthouse 96/100

### Active Lighthouse failures

**1. Table header contrast — 3.96:1 (WCAG AA requires 4.5:1)**
- Element: `<th>` labels (NAME, EMULSION, STATE, CAMERA, SCANS)
- Foreground: `#99a1af` (gray-400), Background: `#364153` (dark header row)
- **Fix:** Change `dark:text-gray-400` on `<th>` elements to `dark:text-gray-300`

**2. `<td>` without table header (`td-has-header` failure)**
- The last column (View button) has no corresponding `<th>`
- **Fix:** Add `<th class="px-6 py-3"><span class="sr-only">Actions</span></th>` to the header row

### Additional a11y observations

- Tags scrollable region (`max-h-28 overflow-y-auto`) has no `aria-label` — screen readers don't know it scrolls
- STATE and TAGS filter groups use presentational `<div>` labels instead of `<fieldset>`/`<legend>` — group semantics missing for assistive tech

---

## Principle 6: Visual Hierarchy 🔴 FAIL

### Problem: Page title and 6 buttons compete for dominance

"Films" (H1) and the button row sit at the same vertical level with equal visual weight. The eye has no clear entry point. The primary action (Add Film) is correct in blue, but it's the 6th element in a sequence.

**Fix:** Reduce secondary actions to an overflow menu (see Principle 1). The resulting hierarchy becomes: **Title → Search+Filters → Table** — natural top-to-bottom reading order.

### Problem: Filter section labels carry the same weight as content

STATE, EMULSION, TAGS are all the same visual weight in the filter panel. Most users filter by State most often — it deserves more prominence.

**Fix:** STATE should be first with a slightly larger or bolder label. TAGS and DATE RANGE (power-user filters) should sit below a visual separator as secondary options.

---

## Principle 7: Fast Performance ✅ PASS

- Skeleton loading correctly implemented for both mobile cards and desktop table rows
- No long tasks or render-blocking assets on this page
- API calls fire in parallel on `onMounted`
- `v-memo` on table rows prevents expensive re-renders — well done

---

## Prioritised Fix List

| # | Issue | Principle | Effort | Impact |
|---|-------|-----------|--------|--------|
| 1 | Move 5 import/export actions into overflow `⋯` menu | Simplicity, Hierarchy | Med | 🔴 High |
| 2 | Replace tag chip cloud with searchable combobox | Simplicity, White Space | High | 🔴 High |
| 3 | Fix `<th>` contrast — `dark:text-gray-400` → `dark:text-gray-300` | Accessibility | Low | 🟡 Med |
| 4 | Add `<th><span class="sr-only">Actions</span></th>` to table | Accessibility | Low | 🟡 Med |
| 5 | Color-code STATE filter chips to match badge palette | Consistency | Low | 🟡 Med |
| 6 | Remove "View" button; make whole row navigable | Simplicity, Navigation | Low | 🟡 Med |
| 7 | Add dividers + increased spacing between filter sections | White Space | Low | 🟡 Med |
| 8 | Add live result count inside filter panel | Navigation | Low | 🟡 Med |
| 9 | Add `<fieldset>`/`<legend>` to STATE and TAGS filter groups | Accessibility | Low | 🟢 Low |
| 10 | Add subtitles to import/export items in overflow menu | Consistency | Low | 🟢 Low |

---

## Quick Wins (Under 1 Hour, No New Components)

Items 3, 4, 5, 6, 7, and 8 require no new components and can be completed in a single focused session:

- `FilmsView.vue` `<th>` class: `dark:text-gray-400` → `dark:text-gray-300`
- Add `<th><span class="sr-only">Actions</span></th>` as final header cell
- Apply `getStateColor()` to STATE filter chip selected state
- Remove `<td>` View button column; apply `@click` to `<tr>`
- Add `border-t` dividers and `mb-6` spacing between filter sections
- Add `{{ filteredFilms.length }} result(s)` counter at bottom of filter panel

**Structural work (separate issues):**
- `⋯` overflow menu for import/export actions
- Searchable tag combobox to replace tag chip cloud
