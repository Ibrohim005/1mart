import { mockStatus } from '../../../utils/mock-status'
import { staffGuard } from '../../../utils/org-guard'
import { categoriesFrom } from '../../../utils/org-input'
import { newDepartmentId, viewDepartment } from '../../../utils/org-state'

/** Новый отдел и открытые ему категории. TODO: Connect to backend endpoint POST /company/departments */
export default defineEventHandler(async (event) => {
  const guard = staffGuard(event)
  if (guard.error) return guard.error
  const { state } = guard.member
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  const title = String(body?.title ?? '').trim()
  if (title.length < 2) {
    mockStatus(event, 422)
    return fail([{ code: 'department_title', message: 'Title is required', field: 'title' }])
  }
  if (state.departments.some(item => item.title.toLowerCase() === title.toLowerCase())) {
    mockStatus(event, 422)
    return fail([{ code: 'department_title_taken', message: 'A department with this title exists', field: 'title' }])
  }
  const department = { id: newDepartmentId(), title, categories: categoriesFrom(body?.categories) }
  state.departments.push(department)
  return ok(viewDepartment(state, department))
})
