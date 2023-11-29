import type { RumProfilerTrace } from '../types';
import { Timeline } from './timeline';
export declare class LongTasksTimeline extends Timeline<PerformanceEntry> {
    constructor(trace: RumProfilerTrace);
}
