import type { RumNavigationEntry, RumProfilerTrace } from '../types';
import { Timeline } from './timeline';
export declare class NavigationTimeline extends Timeline<RumNavigationEntry> {
    constructor(trace: RumProfilerTrace);
}
