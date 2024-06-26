import type { ProfilerTrace, Profiler } from './profiler-api.types';
/**
 * Configuration based on init options (with resolved defaults)
 */
export interface RumProfilerConfig {
    applicationId: string;
    clientToken: string;
    service: string;
    version: string;
    env: string | undefined;
    site: string;
    commitHash: string | undefined;
    repositoryUrl: string | undefined;
}
export interface RumNavigationEntry {
    /** Detected start time of navigation */
    readonly startTime: DOMHighResTimeStamp;
    /** Detected end time of navigation */
    readonly endTime: DOMHighResTimeStamp;
    /** RUM view name or pathname. */
    readonly name: string;
}
/**
 * Additional data recorded during profiling session
 */
export interface RumProfilerEnrichmentData {
    /** List of detected long tasks */
    readonly longTasks: PerformanceEntry[];
    /** List of detected measures */
    readonly measures: PerformanceMeasure[];
    /** List of detected events */
    readonly events: PerformanceEventTiming[];
    /** List of detected navigation entries */
    readonly navigation: RumNavigationEntry[];
}
export interface RumProfilerTrace extends ProfilerTrace, RumProfilerEnrichmentData {
    /** High resolution time when profiler trace started, relative to the profiling session's time origin */
    readonly startTime: DOMHighResTimeStamp;
    /** High resolution time when profiler trace ended, relative to the profiling session's time origin */
    readonly endTime: DOMHighResTimeStamp;
    /** Time origin of the profiling session */
    readonly timeOrigin: number;
    /** Sample interval in milliseconds */
    readonly sampleInterval: number;
}
/**
 * Describes profiler session state when it's stopped
 */
export interface RumProfilerStoppedSession {
    readonly state: 'stopped';
}
/**
 * Describes profiler session state when it's paused
 * (this happens when user focuses on a different tab)
 */
export interface RumProfilerPausedSession {
    readonly state: 'paused';
}
/**
 * Describes profiler session state when it's running
 */
export interface RumProfilerRunningSession extends RumProfilerEnrichmentData {
    readonly state: 'running';
    /** Current profiler instance */
    readonly profiler: Profiler;
    /** High resolution time when profiler session started */
    readonly startTime: DOMHighResTimeStamp;
    /** Timeout id to stop current session */
    readonly timeoutId: number;
}
export type RumProfilerSession = RumProfilerStoppedSession | RumProfilerPausedSession | RumProfilerRunningSession;
/**
 * Interface for exporting profiler traces.
 */
export type RumProfilerTraceExporter = (trace: RumProfilerTrace, config: RumProfilerConfig) => Promise<void>;
