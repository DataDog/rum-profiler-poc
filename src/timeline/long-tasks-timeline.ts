import type { RumProfilerTrace } from '../types';

import { Timeline } from './timeline';

export class LongTasksTimeline extends Timeline<PerformanceEntry> {
    constructor(trace: RumProfilerTrace) {
        super(
            trace.longTasks,
            (entry) => entry.startTime,
            (entry) => entry.startTime + entry.duration,
        );
    }
}
