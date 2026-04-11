/**
 * Builds the ordered list of speed suggestions for the typeahead dropdown:
 *  1. The typed numeric value
 *  2. DB speeds that match but aren't already in the list
 *
 * Returns an empty array when the query is blank or non-numeric.
 */
export declare function buildSpeedSuggestions(query: string, dbSpeeds: number[]): number[];
