import type { RumProfilerTrace } from '../types';
import { Timeline } from './timeline';
/**
 * A task inferred from stack samples.
 */
interface InferredTask {
    readonly entryType: string;
    readonly startTime: number;
    readonly duration: number;
}
/**
 * Build a timeline of inferred tasks from stack samples.
 *
 * This is mostly used for short tasks that are not reported by Long Tasks API.
 * For example, we can infer tasks from the following stack samples:
 * ```
 * time | stackId
 * 0ms  | 1
 * 1ms  | 2
 * 2ms  | 6
 * 3ms  | undefined
 * 4ms  | 2
 * 5ms  | 2
 * 6ms  | undefined
 * ```
 * In this case, we can infer that there were two tasks:
 * - task 1 that started at 0ms and ended at 2ms
 * - task 2 that started at 4ms and ended at 5ms
 *
 * It's not 100% accurate because of sampling, but it should work most of the time.
 */
export declare class InferredTasksTimeline extends Timeline<InferredTask> {
    constructor(trace: RumProfilerTrace);
}
export {};
