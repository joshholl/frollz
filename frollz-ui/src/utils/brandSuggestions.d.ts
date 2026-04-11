/**
 * Converts a string to title case (first letter of each word capitalized,
 * remainder lowercased).
 */
export declare function toTitleCase(str: string): string;
/**
 * Builds the ordered list of brand suggestions for the typeahead dropdown:
 *  1. The query in title case
 *  2. The exact query (if different from title case)
 *  3. DB brands that match but aren't already in the list
 *
 * Returns an empty array when the query is blank.
 */
export declare function buildSuggestions(query: string, dbBrands: string[]): string[];
