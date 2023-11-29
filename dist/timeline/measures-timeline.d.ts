import type { RumProfilerTrace } from '../types';
import { Timeline } from './timeline';
export declare class MeasuresTimeline extends Timeline<PerformanceEntry> {
    constructor(trace: RumProfilerTrace);
}
