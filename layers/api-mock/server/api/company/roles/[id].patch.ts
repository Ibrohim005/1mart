import { mockStatus } from '../../../utils/mock-status'
import { staffGuard } from '../../../utils/org-guard'
import { permissionsFrom } from '../../../utils/org-input'
import { viewRole } from '../../../utils/org-state'

/** Правка своей роли. Готовые роли не меняются. TODO: Connect to backend endpoint PATCH /company/roles/{id} */
export default defineEventHandler(async (event) => {
  const guard = staffGuard(event)
  if (guard.error) return guard.error
  const { state } = guard.member
  const role = state.roles.find(item => item.id === getRouterParam(event, 'id'))
  if (!role || role.preset) {
    mockStatus(event, role ? 422 : 404)
    return fail([{ code: role ? 'role_preset' : 'not_found', message: 'Preset roles cannot be changed' }])
  }
  const body = await readBody<Record<string, unknown>>(event).catch(() => null) ?? {}
  const title = typeof body.title === 'string' ? body.title.trim() : role.title
  const permissions = body.permissions === undefined ? role.permissions : permissionsFrom(body.permissions)
  if (title.length < 2 || !permissions.length) {
    mockStatus(event, 422)
    return fail([{ code: title.length < 2 ? 'role_title' : 'role_permissions', message: 'Title and at least one permission are required' }])
  }
  role.title = title
  role.permissions = permissions
  return ok(viewRole(state, role))
})
