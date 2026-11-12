import { staffGuard } from '../../utils/org-guard'
import { viewDepartment, viewEmployee, viewRole } from '../../utils/org-state'

/**
 * Всё для страницы «Компания»: реквизиты, сотрудники, роли и отделы.
 * TODO: Connect to backend endpoint GET /company
 */
export default defineEventHandler((event) => {
  const guard = staffGuard(event)
  if (guard.error) return guard.error
  const { state } = guard.member
  return ok({
    company: state.company,
    employees: state.employees.map(viewEmployee),
    roles: state.roles.map(role => viewRole(state, role)),
    departments: state.departments.map(item => viewDepartment(state, item)),
  })
})
