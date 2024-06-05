/**
 * Map with limited capacity and least-recently used cache eviction strategy
 */
export class LruCache<K, V> {
  private readonly values: Map<K, V> = new Map<K, V>()
  private readonly maxEntries: number

  constructor(maxEntries: number) {
    this.maxEntries = maxEntries
  }

  get(key: K): V | undefined {
    let entry: V | undefined
    if (this.values.has(key)) {
      // peek the entry, re-insert for LRU strategy
      entry = this.values.get(key)!
      this.values.delete(key)
      this.values.set(key, entry)
    }

    return entry
  }

  set(key: K, value: V): void {
    if (this.values.size >= this.maxEntries) {
      // least-recently used cache eviction strategy
      const keyToDelete = this.values.keys().next().value

      this.values.delete(keyToDelete)
    }

    this.values.set(key, value)
  }
}
