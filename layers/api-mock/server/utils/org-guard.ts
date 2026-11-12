import type { MockEvent } from './visitor'
import { mockStatus } from './mock-status'
import { can, membership } from './org-state'

/**
 * Управлять компанией может только тот, у кого право staff.manage.
 * Возвращает компанию или ответ-ошибку, который эндпоинт отдаёт как есть.
 */
export function staffGuard(event: MockEvent) {
  const member = membership(event)
  if (!member) {
    mockStatus(event, 401)
    return { error: fail([{ code: 'unauthorized', message: 'Login required' }]) }
  }
  if (!can(event, 'staff.manage')) {
    mockStatus(event, 403)
    return { error: fail([{ code: 'staff_forbidden', message: 'Only the head of the company manages staff' }]) }
  }
  return { member }
}
