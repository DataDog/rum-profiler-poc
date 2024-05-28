import type { RumNavigationEntry, RumProfilerTrace } from '../types'

import { Timeline } from './timeline'

export class NavigationTimeline extends Timeline<RumNavigationEntry> {
  constructor(trace: RumProfilerTrace) {
    super(
      trace.navigation,
      (entry) => entry.startTime,
      (entry) => entry.endTime
    )
  }
}
