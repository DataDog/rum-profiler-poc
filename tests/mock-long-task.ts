interface MockLongTaskParams {
  startTime?: number
  duration?: number
}

export function mockLongTask({ startTime = 0, duration = 100 }: MockLongTaskParams = {}): PerformanceEntry {
  const longTask = {
    name: 'longtask',
    entryType: 'longtask',
    startTime,
    duration,
    toJSON: () => ({
      name: 'longtask',
      entryType: 'longtask',
      startTime,
      duration,
    }),
  }

  return longTask
}
