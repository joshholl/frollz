// Package (e.g. Roll, Sheet, Instant)
export interface Package {
  id: number
  name: string
}

// Format (e.g. 35mm, 120) — belongs to a Package
export interface Format {
  id: number
  packageId: number
  name: string
  package?: Package
}

// Process (e.g. C-41, E-6)
export interface Process {
  id: number
  name: string
}

// Emulsion (replaces Stock)
export interface Emulsion {
  id: number
  name: string
  brand: string
  manufacturer: string
  speed: number
  formatId: number
  processId: number
  parentId: number | null
  boxImageMimeType: string | null
  tags: Tag[]
}

// Tag
export interface Tag {
  _key?: string
  value: string
  color: string
  isRollScoped?: boolean
  isStockScoped?: boolean
  createdAt?: Date
  updatedAt?: Date
}

// EmulsionTag (replaces StockTag)
export interface EmulsionTag {
  id: number
  emulsionId: number
  tagId: number
}

export interface RollTag {
  _key?: string
  tagKey: string
  rollKey: string
  createdAt?: Date
}

// Roll Types
export enum RollState {
  ADDED = 'Added',
  FROZEN = 'Frozen',
  REFRIGERATED = 'Refrigerated',
  SHELVED = 'Shelved',
  LOADED = 'Loaded',
  FINISHED = 'Finished',
  SENT_FOR_DEVELOPMENT = 'Sent For Development',
  DEVELOPED = 'Developed',
  RECEIVED = 'Received',
}

export interface FilmStateMetadataField {
  id: number
  name: string
  fieldType: string
  allowMultiple: boolean
}

export interface FilmStateMetadata {
  id: number
  filmStateId: number
  transitionStateMetadataId: number
  value: string | string[] | null
  transitionStateMetadata?: {
    id: number
    fieldId: number
    transitionStateId: number
    defaultValue: string | null
    field?: FilmStateMetadataField
  }
}

// FilmState (replaces RollStateHistory)
export interface FilmState {
  id: number
  filmId: number
  stateId: number
  date: Date
  notes?: string
  isErrorCorrection?: boolean
  metadata?: Record<string, unknown>
  createdAt?: Date
  updatedAt?: Date
}

// Film (replaces Roll)
export interface Film {
  id: number
  name: string
  emulsionId: number
  expirationDate: Date | null
  parentId: number | null
  transitionProfileId: number
  emulsion?: Emulsion
  tags: Tag[]
  states: FilmState[]
  parent?: Film
}

export interface Roll {
  _key?: string
  rollId: string
  stockKey: string
  state: RollState
  imagesUrl?: string
  dateObtained: Date
  obtainmentMethod: ObtainmentMethod
  obtainedFrom: string
  expirationDate?: Date
  timesExposedToXrays: number
  loadedInto?: string
  stockName?: string
  stockSpeed?: number
  formatName?: string
  createdAt?: Date
  updatedAt?: Date
}