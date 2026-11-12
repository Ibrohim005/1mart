import type { IssuedCredentials } from '#shared/types/company'
import { mockStatus } from '../../../../utils/mock-status'
import { staffGuard } from '../../../../utils/org-guard'
import { resetPassword } from '../../../../utils/org-state'

/**
 * Новый временный пароль сотруднику: снова уходит по SMS, руководитель может
 * скопировать. Старый пароль перестаёт работать.
 * TODO: Connect to backend endpoint POST /company/employees/{id}/password
 */
export default defineEventHandler((event) => {
  const guard = staffGuard(event)
  if (guard.error) return guard.error
  const employee = guard.member.state.employees.find(item => item.id === getRouterParam(event, 'id'))
  if (!employee || employee.isOwner) {
    mockStatus(event, employee ? 422 : 404)
    return fail([{ code: employee ? 'owner_locked' : 'not_found', message: 'Cannot reset this password' }])
  }
  const credentials: IssuedCredentials = { login: employee.phone, password: resetPassword(employee), smsSent: true }
  return ok(credentials)
})
