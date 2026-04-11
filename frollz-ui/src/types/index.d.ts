export interface Package {
    id: string;
    name: string;
}
export interface Format {
    id: string;
    packageId: string;
    name: string;
    package?: Package;
}
export interface Process {
    id: string;
    name: string;
}
export interface Emulsion {
    id: string;
    name: string;
    brand: string;
    manufacturer: string;
    speed: number;
    formatId: string;
    processId: string;
    parentId: string | null;
    boxImageUrl?: string;
    tags: Tag[];
}
export interface Tag {
    id: string;
    name: string;
    colorCode: string;
    description: string | null;
}
export interface EmulsionTag {
    id: string;
    emulsionId: string;
    tagId: string;
}
export interface FilmTag {
    id: string;
    filmId: string;
    tagId: string;
}
export interface FilmState {
    id: string;
    filmId: string;
    stateId: string;
    date: Date;
    note: string | null;
    state?: {
        id: string;
        name: string;
    };
    metadata: unknown[];
}
export interface Film {
    id: string;
    name: string;
    emulsionId: string;
    expirationDate: Date | null;
    parentId: string | null;
    transitionProfileId: string;
    emulsion?: Emulsion;
    tags: Tag[];
    states: FilmState[];
    parent?: Film;
}
export interface TransitionProfile {
    id: string;
    name: string;
}
export interface TransitionMetadataField {
    field: string;
    fieldType: string;
    defaultValue: string | null;
    isRequired: boolean;
}
export interface TransitionEdge {
    id: string;
    fromState: string;
    toState: string;
    metadata: TransitionMetadataField[];
}
export interface TransitionGraph {
    states: string[];
    transitions: TransitionEdge[];
}
export declare function currentStateName(film: Film): string;
