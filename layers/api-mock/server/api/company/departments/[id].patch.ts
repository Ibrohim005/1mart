import { mockStatus } from '../../../utils/mock-status'
import { staffGuard } from '../../../utils/org-guard'
import { categoriesFrom } from '../../../utils/org-input'
import { viewDepartment } from '../../../utils/org-state'

/** Название отдела и его категории. TODO: Connect to backend endpoint PATCH /company/departments/{id} */
export default defineEventHandler(async (event) => {
  const guard = staffGuard(event)
  if (guard.error) return guard.error
  const { state } = guard.member
  const department = state.departments.find(item => item.id === getRouterParam(event, 'id'))
  if (!department) {
    mockStatus(event, 404)
    return fail([{ code: 'not_found', message: 'Department not found' }])
  }
  const body = await readBody<Record<string, unknown>>(event).catch(() => null) ?? {}
  if (typeof body.title === 'string') {
    const title = body.title.trim()
    if (title.length < 2) {
      mockStatus(event, 422)
      return fail([{ code: 'department_title', message: 'Title is required', field: 'title' }])
    }
    department.title = title
  }
  if (body.categories !== undefined) department.categories = categoriesFrom(body.categories)
  return ok(viewDepartment(state, department))
})
