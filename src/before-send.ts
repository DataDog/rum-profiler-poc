import { getLongTaskId } from './utils/get-long-task-id'

/**
 * This is the temporary integration point with RUM.
 * Hopefully, in the future it will integrated into the RUM SDK.
 *
 * @param event The RUM event
 * @param context The context around that event
 * @returns Always true as this handler does not block any event
 */
export function beforeSend(event: any, context: any): boolean {
  if (event.type === 'long_task') {
    if (!event.context) {
      event.context = {}
    }

    event.context.profile_long_task_id = getLongTaskId(context.performanceEntry)
  }

  return true
}
