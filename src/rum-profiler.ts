import { exportToPprofIntake } from './exporter/export-to-pprof-intake'
import type { RumProfilerTrace, RumProfilerSession, RumProfilerConfig, Profiler, Navigation } from './types'
import { getRum } from './utils/get-rum'

// These APIs might be unavailable in some browsers
const window_Profiler: Profiler | undefined = (window as any).Profiler
const window_navigation: Navigation | undefined = (window as any).navigation

const SAMPLE_INTERVAL_MS = 10 // Sample stack trace every 10ms
const COLLECT_INTERVAL_MS = 60000 // Collect data every minute
const MIN_PROFILE_DURATION_MS = 5000 // Require at least 5 seconds of profile data to reduce noise and cost

export class RumProfiler {
  private readonly observer: PerformanceObserver

  private session: RumProfilerSession = { state: 'stopped' }

  constructor(private readonly config: RumProfilerConfig) {
    this.observer = new PerformanceObserver(this.handlePerformance)
  }

  get supported(): boolean {
    return window_Profiler !== undefined
  }

  start(): void {
    if (this.session.state === 'running') {
      return
    }

    // Setup event listeners
    this.observer.observe({ entryTypes: ['longtask', 'measure', 'event'] })
    window.addEventListener('visibilitychange', this.handleVisibilityChange)
    window.addEventListener('beforeunload', this.handleBeforeUnload)
    if (window_navigation) {
      window_navigation.addEventListener('navigate', this.handleNavigate)
    }

    // Start profiler session
    this.startNextProfilerSession()
  }

  stop(): Promise<void> {
    // Stop current profiler session
    const profileSentPromise = this.stopProfilerSession('stopped')

    // Cleanup event listeners
    this.observer.disconnect()
    window.removeEventListener('visibilitychange', this.handleVisibilityChange)
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
    if (window_navigation) {
      window_navigation.removeEventListener('navigate', this.handleNavigate)
    }

    return profileSentPromise
  }

  private startNextProfilerSession = (): void => {
    if (!window_Profiler) {
      throw new Error('RUM Profiler is not supported in this browser.')
    }

    // Don't wait for data collection to start next session
    this.collectProfilerSession()

    this.session = {
      state: 'running',
      startTime: performance.now(),
      // We have to create new Profiler instance for each session
      profiler: new window_Profiler({
        sampleInterval: SAMPLE_INTERVAL_MS,
        // Keep buffer size at 1.5 times of minimum required to collect data for a profiling session
        maxBufferSize: Math.round((COLLECT_INTERVAL_MS * 1.5) / SAMPLE_INTERVAL_MS),
      }),
      timeoutId: setTimeout(this.startNextProfilerSession, COLLECT_INTERVAL_MS) as unknown as number, // NodeJS types collision
      longTasks: [],
      measures: [],
      events: [],
      navigation: [],
    }
    // Add event handler case we overflow the buffer
    this.session.profiler.addEventListener('samplebufferfull', this.handleSampleBufferFull)
  }

  private collectProfilerSession = (): Promise<void> => {
    if (this.session.state !== 'running') {
      return Promise.resolve()
    }

    // Empty the performance observer buffer
    this.handleEntries(this.observer.takeRecords())

    // Add last entry to navigation
    this.collectNavigationEntry()

    // Store session data snapshot in local variables to use in async callback
    const { startTime, longTasks, measures, events, navigation } = this.session

    // Stop current profiler to get trace
    const profileReportedPromise = this.session.profiler.stop().then((trace) => {
      const endTime = performance.now()

      if (endTime - startTime < MIN_PROFILE_DURATION_MS) {
        // Skip very short profiles to reduce noise and cost
        return
      }

      return this.handleProfilerTrace(
        // Enrich trace with time and session data
        Object.assign(trace, {
          startTime,
          endTime,
          timeOrigin: performance.timeOrigin,
          longTasks,
          measures,
          events,
          navigation,
          sampleInterval: SAMPLE_INTERVAL_MS,
        })
      )
    })

    // Cleanup session
    clearTimeout(this.session.timeoutId)
    this.session.profiler.removeEventListener('samplebufferfull', this.handleSampleBufferFull)

    return profileReportedPromise
  }

  private stopProfilerSession = (nextState: 'paused' | 'stopped'): Promise<void> => {
    if (this.session.state !== 'running') {
      return Promise.resolve()
    }

    const profileReportedPromise = this.collectProfilerSession()
    this.session = { state: nextState }

    return profileReportedPromise
  }

  private collectNavigationEntry = (): void => {
    if (this.session.state !== 'running') {
      return
    }
    const session = this.session

    // Add entry to navigation
    session.navigation.push({
      startTime: session.navigation.length ? session.navigation[session.navigation.length - 1].endTime : 0, // 0 startTime will ensure we cover activity from the session beginning
      endTime: performance.now(),
      name: getRum()?.getInternalContext()?.view?.name || document.location.pathname,
    })
  }

  private handleProfilerTrace = (trace: RumProfilerTrace): Promise<void> => {
    performance.mark('rum.profiler.export_time_ms.start')

    const promise = exportToPprofIntake(trace, this.config)

    performance.mark('rum.profiler.export_time_ms.end')
    // Add measure to track export time in @monitoring-lib/rum-profiler
    // This is only for internal monitoring
    performance.measure(
      'rum.profiler.export_time_ms',
      'rum.profiler.export_time_ms.start',
      'rum.profiler.export_time_ms.end'
    )

    return promise
  }

  private handleSampleBufferFull = (): void => {
    this.startNextProfilerSession()
  }

  private handlePerformance = (list: PerformanceObserverEntryList): void => {
    this.handleEntries(list.getEntries())
  }

  private handleEntries = (entries: PerformanceEntryList): void => {
    if (this.session.state !== 'running') {
      return
    }

    for (const entry of entries) {
      if (entry.duration < SAMPLE_INTERVAL_MS) {
        // Skip entries shorter than sample interval to reduce noise and size of profile
        continue
      }

      switch (entry.entryType) {
        case 'longtask':
          this.session.longTasks.push(entry)
          break
        case 'measure':
          this.session.measures.push(entry as PerformanceMeasure)
          break
        case 'event':
          this.session.events.push(entry as PerformanceEventTiming)
          break
      }
    }
  }

  private handleNavigate = (): void => {
    this.collectNavigationEntry()
  }

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden' && this.session.state === 'running') {
      // Pause when tab is hidden. We use paused state to distinguish between
      // paused by visibility change and stopped by user.
      // If profiler is paused by the visibility change, we should resume when
      // tab becomes visible again. That's not the case when user stops the profiler.
      this.stopProfilerSession('paused')
    } else if (document.visibilityState === 'visible' && this.session.state === 'paused') {
      // Resume when tab becomes visible again
      this.startNextProfilerSession()
    }
  }

  private handleBeforeUnload = (): void => {
    this.stopProfilerSession('stopped')
  }
}
