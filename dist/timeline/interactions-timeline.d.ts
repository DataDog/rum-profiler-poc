import type { ModernPerformanceEventTiming, RumProfilerTrace } from '../types';
import { Timeline } from './timeline';
export declare class InteractionsTimeline extends Timeline<ModernPerformanceEventTiming> {
    constructor(trace: RumProfilerTrace);
}
