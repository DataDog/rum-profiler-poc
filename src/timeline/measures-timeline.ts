import type { RumProfilerTrace } from '../types';

import { Timeline } from './timeline';

export class MeasuresTimeline extends Timeline<PerformanceEntry> {
    constructor(trace: RumProfilerTrace) {
        super(
            trace.measures,
            (entry) => entry.startTime,
            (entry) => entry.startTime + entry.duration,
        );
    }
}
