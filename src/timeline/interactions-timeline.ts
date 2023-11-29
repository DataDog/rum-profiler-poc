import type { ModernPerformanceEventTiming, RumProfilerTrace } from '../types';

import { Timeline } from './timeline';

export class InteractionsTimeline extends Timeline<ModernPerformanceEventTiming> {
    constructor(trace: RumProfilerTrace) {
        super(
            trace.events
                .filter(
                    (event): event is ModernPerformanceEventTiming =>
                        (event as ModernPerformanceEventTiming)
                            .interactionId !== undefined,
                )
                .filter(
                    (event, index, interactions) =>
                        index ===
                        interactions.findIndex(
                            (interaction) =>
                                interaction.interactionId ===
                                event.interactionId,
                        ),
                ),
            (entry) => entry.startTime,
            (entry) => entry.startTime + entry.duration,
        );
    }
}
