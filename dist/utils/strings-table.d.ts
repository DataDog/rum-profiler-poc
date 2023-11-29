/**
 * Data structure to deduplicate list of strings.
 */
export declare class StringsTable implements Iterable<string> {
    private readonly stringsMap;
    /**
     * @param strings Strings to initialize - assumes that it's an array of unique strings
     */
    constructor();
    /**
     * Adds new string to strings table and returns its index
     */
    dedup(string: string): number;
    [Symbol.iterator](): Iterator<string>;
}
