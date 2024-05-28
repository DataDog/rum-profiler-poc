import { getLongTaskId } from '../../src/utils/get-long-task-id'
import { mockLongTask } from '../mock-long-task'
import { UUID_PATTERN } from '../uuid-pattern'

describe('getLongTaskId', () => {
  it('returns long task id', () => {
    const longTaskA = mockLongTask()
    const longTaskB = mockLongTask()

    const idA = getLongTaskId(longTaskA)
    const idB = getLongTaskId(longTaskB)

    // Ids should be unique
    expect(idA).not.toEqual(idB)
    // Ids should be UUIDs
    expect(idA).toMatch(UUID_PATTERN)
    expect(idB).toMatch(UUID_PATTERN)
    // Ids should consistent
    expect(getLongTaskId(longTaskA)).toEqual(idA)
    expect(getLongTaskId(longTaskB)).toEqual(idB)
  })
})
