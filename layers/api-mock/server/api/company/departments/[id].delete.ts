import { mockStatus } from '../../../utils/mock-status'
import { staffGuard } from '../../../utils/org-guard'

/** Удалить отдел: его сотрудники остаются без отдела. TODO: Connect to backend endpoint DELETE /company/departments/{id} */
export default defineEventHandler((event) => {
  const guard = staffGuard(event)
  if (guard.error) return guard.error
  const { state } = guard.member
  const department = state.departments.find(item => item.id === getRouterParam(event, 'id'))
  if (!department) {
    mockStatus(event, 404)
    return fail([{ code: 'not_found', message: 'Department not found' }])
  }
  state.departments = state.departments.filter(item => item.id !== department.id)
  for (const employee of state.employees) {
    if (employee.departmentId === department.id) employee.departmentId = null
  }
  return ok({ removed: true })
})
