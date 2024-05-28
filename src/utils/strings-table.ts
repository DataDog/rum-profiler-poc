/**
 * Data structure to deduplicate list of strings.
 */
export class StringsTable implements Iterable<string> {
  private readonly stringsMap: Map<string, number>

  /**
   * @param strings Strings to initialize - assumes that it's an array of unique strings
   */
  constructor() {
    this.stringsMap = new Map([['', 0]])
  }

  /**
   * Adds new string to strings table and returns its index
   */
  dedup(string: string): number {
    if (this.stringsMap.has(string)) {
      return this.stringsMap.get(string)!
    } else {
      const index = this.stringsMap.size
      this.stringsMap.set(string, index)
      return index
    }
  }

  [Symbol.iterator](): Iterator<string> {
    return this.stringsMap.keys()
  }
}
