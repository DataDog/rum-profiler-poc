import type { ProfilerSample } from '../types';
/**
 * Counts number of samples when the thread was not idle (stackId is defined)
 * @param samples Array of collected samples
 * @returns Number of samples
 */
export declare function getNumberOfSamples(samples: ProfilerSample[]): number;
