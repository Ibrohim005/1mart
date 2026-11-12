import { mockStatus } from '../../../utils/mock-status'
import { staffGuard } from '../../../utils/org-guard'
import { removeEmployee } from '../../../utils/org-state'

/** Удалить сотрудника. Руководителя удалить нельзя. TODO: Connect to backend endpoint DELETE /company/employees/{id} */
export default defineEventHandler((event) => {
  const guard = staffGuard(event)
  if (guard.error) return guard.error
  const { state } = guard.member
  const employee = state.employees.find(item => item.id === getRouterParam(event, 'id'))
  if (!employee) {
    mockStatus(event, 404)
    return fail([{ code: 'not_found', message: 'Employee not found' }])
  }
  if (employee.isOwner) {
    mockStatus(event, 422)
    return fail([{ code: 'owner_locked', message: 'The head of the company cannot be removed' }])
  }
  removeEmployee(state, employee)
  return ok({ removed: true })
})
