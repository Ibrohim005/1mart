import { mockStatus } from '../../../utils/mock-status'
import { staffGuard } from '../../../utils/org-guard'

/** Удалить свою роль, если на ней нет людей. TODO: Connect to backend endpoint DELETE /company/roles/{id} */
export default defineEventHandler((event) => {
  const guard = staffGuard(event)
  if (guard.error) return guard.error
  const { state } = guard.member
  const role = state.roles.find(item => item.id === getRouterParam(event, 'id'))
  if (!role || role.preset || state.employees.some(item => item.roleId === role.id)) {
    mockStatus(event, role ? 422 : 404)
    return fail([{ code: !role ? 'not_found' : role.preset ? 'role_preset' : 'role_in_use', message: 'This role cannot be removed' }])
  }
  state.roles = state.roles.filter(item => item.id !== role.id)
  return ok({ removed: true })
})
