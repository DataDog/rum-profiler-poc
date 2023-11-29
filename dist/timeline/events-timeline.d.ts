import type { RumProfilerTrace } from '../types';
import { Timeline } from './timeline';
export declare class EventsTimeline extends Timeline<PerformanceEventTiming> {
    constructor(trace: RumProfilerTrace);
}
