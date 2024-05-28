import type { RumProfilerTrace } from '../types'
import { SamplesView } from '../utils/samples-view'

import { Timeline } from './timeline'

/**
 * A task inferred from stack samples.
 */
interface InferredTask {
  readonly entryType: string
  readonly startTime: number
  readonly duration: number
}

/**
 * Build a timeline of inferred tasks from stack samples.
 *
 * This is mostly used for short tasks that are not reported by Long Tasks API.
 * For example, we can infer tasks from the following stack samples:
 * ```
 * time | stackId
 * 0ms  | 1
 * 1ms  | 2
 * 2ms  | 6
 * 3ms  | undefined
 * 4ms  | 2
 * 5ms  | 2
 * 6ms  | undefined
 * ```
 * In this case, we can infer that there were two tasks:
 * - task 1 that started at 0ms and ended at 2ms
 * - task 2 that started at 4ms and ended at 5ms
 *
 * It's not 100% accurate because of sampling, but it should work most of the time.
 */
export class InferredTasksTimeline extends Timeline<InferredTask> {
  constructor(trace: RumProfilerTrace) {
    const samplesView = new SamplesView(trace)
    const inferredTasks: InferredTask[] = []

    if (trace.samples.length) {
      let taskStartTimestamp: number | undefined
      let taskStackId: number | undefined

      for (let sampleIndex = 0; sampleIndex < trace.samples.length - 1; sampleIndex++) {
        const sample = trace.samples[sampleIndex]

        if (taskStartTimestamp !== undefined && taskStackId !== undefined && sample.stackId !== taskStackId) {
          // End the current task
          inferredTasks.push({
            entryType: 'inferred-task',
            startTime: taskStartTimestamp,
            duration: samplesView.getStartTime(sampleIndex) - taskStartTimestamp,
          })
          taskStartTimestamp = undefined
          taskStackId = undefined
        }

        if (taskStartTimestamp === undefined && sample.stackId !== undefined) {
          // Start a new task
          taskStartTimestamp = samplesView.getStartTime(sampleIndex)
          taskStackId = sample.stackId
        }
      }

      if (taskStartTimestamp !== undefined && taskStackId !== undefined) {
        // End the last task
        inferredTasks.push({
          entryType: 'inferred-task',
          startTime: taskStartTimestamp,
          duration: samplesView.getEndTime(trace.samples.length - 1) - taskStartTimestamp,
        })
      }
    }

    super(
      inferredTasks,
      (entry) => entry.startTime,
      (entry) => entry.startTime + entry.duration
    )
  }
}
