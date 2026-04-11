// Package (e.g. Roll, Sheet, Instant)
export interface Package {
  id: string
  name: string
}

// Format (e.g. 35mm, 120) — belongs to a Package
export interface Format {
  id: string
  packageId: string
  name: string
  package?: Package
}

// Process (e.g. C-41, E-6)
export interface Process {
  id: string
  name: string
}

// Emulsion (replaces Stock)
export interface Emulsion {
  id: string
  name: string
  brand: string
  manufacturer: string
  speed: number
  formatId: string
  processId: string
  parentId: string | null
  boxImageUrl?: string
  tags: Tag[]
}

// Tag
export interface Tag {
  id: string
  name: string
  colorCode: string
  description: string | null
}

// EmulsionTag (replaces StockTag)
export interface EmulsionTag {
  id: string
  emulsionId: string
  tagId: string
}

// FilmTag (replaces RollTag)
export interface FilmTag {
  id: string
  filmId: string
  tagId: string
}

// FilmState (replaces RollStateHistory)
export interface FilmState {
  id: string
  filmId: string
  stateId: string
  date: Date
  note: string | null
  state?: { id: string; name: string }
  metadata: unknown[]
}

// Film (replaces Roll)
export interface Film {
  id: string
  name: string
  emulsionId: string
  expirationDate: Date | null
  parentId: string | null
  transitionProfileId: string
  emulsion?: Emulsion
  tags: Tag[]
  states: FilmState[]
  parent?: Film
}

// Transition profile
export interface TransitionProfile {
  id: string
  name: string
}

// Transition graph
export interface TransitionMetadataField {
  field: string
  fieldType: string
  defaultValue: string | null
  isRequired: boolean
}

export interface TransitionEdge {
  id: string
  fromState: string
  toState: string
  metadata: TransitionMetadataField[]
}

export interface TransitionGraph {
  states: string[]
  transitions: TransitionEdge[]
}

// Helpers — derive current state name from Film.states
export function currentStateName(film: Film): string {
  if (!film.states?.length) return ''
  const sorted = [...film.states].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  return sorted[0]?.state?.name ?? ''
}
