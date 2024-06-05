import { beforeSend } from '../src/before-send'
import { mockLongTask } from './mock-long-task'
import { UUID_PATTERN } from './uuid-pattern'

describe('beforeSend', () => {
  it('ignores events that are not long tasks', () => {
    const originalEvent = { type: 'view' }

    const event = { ...originalEvent }
    const context = { performanceEntry: mockLongTask() }

    const result = beforeSend(event, context)

    expect(event).toEqual(originalEvent)
    expect(result).toBe(true)
  })

  it('adds long task id to the context', () => {
    const event: any = { type: 'long_task' }
    const context = { performanceEntry: mockLongTask() }

    beforeSend(event, context)

    expect(event.context.profile_long_task_id).toBeDefined()
    expect(event.context.profile_long_task_id).toMatch(UUID_PATTERN)
  })
})
