import type { RumProfilerTrace } from '../types'

/**
 * This class is used to spread sampling bias between samples.
 * Let's say we have 4 samples and 20ms sampling interval:
 * |-----|-----|---------|
 * 0     1     2         3
 * 0ms   20ms  40ms      80ms
 *                       ^ something happened and this sample was taken later than expected
 *
 * For each sample we define start, middle and end time.
 * For example:
 * Sample | Start | Middle | End
 * 0      | -10ms |  0ms   | 10ms
 * 1      |  10ms | 20ms   | 30ms
 * 2      |  30ms | 40ms   | 60ms
 * 3      |  60ms | 80ms   | 90ms
 *
 * This way we cover entire timeline, even if some samples were taken later than expected.
 * This is useful when we want to corelate samples with other events.
 */
export class SamplesView {
  constructor(private readonly trace: Pick<RumProfilerTrace, 'samples' | 'sampleInterval'>) {}

  /**
   * Get sample start time.
   * /!\ It assumes a sample exists at given index.
   *
   * @param index Index of sample in samples array
   * @returns Sample start time
   */
  getStartTime(index: number): number {
    if (index === 0) {
      // First sample - remove half of the interval
      return this.trace.samples[index].timestamp - this.trace.sampleInterval / 2
    }

    // Spread bias between samples
    return (this.trace.samples[index - 1].timestamp + this.trace.samples[index].timestamp) / 2
  }

  /**
   * Get sample middle time.
   * /!\ It assumes a sample exists at given index.
   *
   * @param index Index of sample in samples array
   * @returns Sample middle time
   */
  getMiddleTime(index: number): number {
    return this.trace.samples[index].timestamp
  }

  /**
   * Get sample end time.
   * /!\ It assumes a sample exists at given index.
   *
   * @param index Index of sample in samples array
   * @returns Sample end time
   */
  getEndTime(index: number): number {
    if (index === this.trace.samples.length - 1) {
      // Last sample - add half of the interval
      return this.trace.samples[index].timestamp + this.trace.sampleInterval / 2
    }

    // Spread bias between samples
    return (this.trace.samples[index].timestamp + this.trace.samples[index + 1].timestamp) / 2
  }
}
