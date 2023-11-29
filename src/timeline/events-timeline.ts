import type { RumProfilerTrace } from '../types';

import { Timeline } from './timeline';

export class EventsTimeline extends Timeline<PerformanceEventTiming> {
    constructor(trace: RumProfilerTrace) {
        super(
            trace.events,
            (entry) => entry.processingStart,
            (entry) => entry.processingEnd,
        );
    }
}
