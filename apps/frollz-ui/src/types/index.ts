import type { Film } from "@frollz/shared";

export type {
  Film,
  Format,
  Package,
  Process,
  Emulsion,
  FilmState,
  Tag,
  FilmTag,
  TransitionGraph,
  TransitionProfile,
  StateCount,
  MonthCount,
  EmulsionCount,
  TransitionDuration,
} from "@frollz/shared";

// Helpers — derive current state name from Film.states
export function currentStateName(film: Film): string {
  if (!film.states?.length) return "";
  const sorted = [...film.states].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return sorted[0]?.state?.name ?? "";
}

// Helpers — collect all scan URLs stored in film state metadata
export function getScanUrls(film: Film): string[] {
  const urls: string[] = [];
  for (const state of film.states ?? []) {
    for (const m of state.metadata ?? []) {
      if (
        m.transitionStateMetadata?.field?.name === "scansUrl" &&
        Array.isArray(m.value)
      ) {
        urls.push(...m.value);
      }
    }
  }
  // deduplicate while preserving order
  return [...new Set(urls)];
}
