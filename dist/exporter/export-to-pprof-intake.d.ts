import type { RumProfilerTraceExporter } from '../types';
/**
 * Exports pprof profile to public profiling intake.
 * @param trace RUM trace to export
 * @param config Configuration of the profiler
 * @returns Promise that resolves when profile is sent
 */
export declare const exportToPprofIntake: RumProfilerTraceExporter;
