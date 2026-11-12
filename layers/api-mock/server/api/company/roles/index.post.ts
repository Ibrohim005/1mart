import { mockStatus } from '../../../utils/mock-status'
import { staffGuard } from '../../../utils/org-guard'
import { permissionsFrom } from '../../../utils/org-input'
import { newRoleId, viewRole } from '../../../utils/org-state'

/** Своя роль: название и набор прав. TODO: Connect to backend endpoint POST /company/roles */
export default defineEventHandler(async (event) => {
  const guard = staffGuard(event)
  if (guard.error) return guard.error
  const { state } = guard.member
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  const title = String(body?.title ?? '').trim()
  const permissions = permissionsFrom(body?.permissions)
  if (title.length < 2 || !permissions.length) {
    mockStatus(event, 422)
    return fail([{ code: title.length < 2 ? 'role_title' : 'role_permissions', message: 'Title and at least one permission are required', field: title.length < 2 ? 'title' : 'permissions' }])
  }
  if (state.roles.some(role => role.title.toLowerCase() === title.toLowerCase())) {
    mockStatus(event, 422)
    return fail([{ code: 'role_title_taken', message: 'A role with this title exists', field: 'title' }])
  }
  const role = { id: newRoleId(), preset: null, title, permissions }
  state.roles.push(role)
  return ok(viewRole(state, role))
})
