/**
 * Map with limited capacity and least-recently used cache eviction strategy
 */
export declare class LruCache<K, V> {
    private readonly values;
    private readonly maxEntries;
    constructor(maxEntries: number);
    get(key: K): V | undefined;
    set(key: K, value: V): void;
}
