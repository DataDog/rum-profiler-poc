import { LruCache } from './lru-cache'

// Maps PerformanceEntry to the corresponding long task ID
// We need this to link RUM Long Tasks with RUM Profiler stack traces
// Given that long task takes at least 50ms and we export profile at least every 60 seconds, we can have up to 1200 entries (60s / 50ms = 1200).
// Let's double that just to be safe.
const registry = new LruCache<PerformanceEntry, string>(2400)

export function getLongTaskId(longTask: PerformanceEntry): string | undefined {
  const id = registry.get(longTask) || generateUUID()
  registry.set(longTask, id)
  return id
}

/**
 * UUID v4
 * from https://gist.github.com/jed/982883
 */
function generateUUID(placeholder?: string): string {
  return placeholder
    ? (parseInt(placeholder, 10) ^ ((Math.random() * 16) >> (parseInt(placeholder, 10) / 4))).toString(16)
    : `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, generateUUID)
}
