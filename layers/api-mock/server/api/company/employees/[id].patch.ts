import { mockStatus } from '../../../utils/mock-status'
import { staffGuard } from '../../../utils/org-guard'
import { viewEmployee } from '../../../utils/org-state'

/**
 * Правка сотрудника: роль, отдел, свои категории, лимит, блокировка.
 * Руководителя (владельца компании) заблокировать или понизить нельзя.
 * TODO: Connect to backend endpoint PATCH /company/employees/{id}
 */
export default defineEventHandler(async (event) => {
  const guard = staffGuard(event)
  if (guard.error) return guard.error
  const { state } = guard.member
  const employee = state.employees.find(item => item.id === getRouterParam(event, 'id'))
  if (!employee) {
    mockStatus(event, 404)
    return fail([{ code: 'not_found', message: 'Employee not found' }])
  }

  const body = await readBody<Record<string, unknown>>(event).catch(() => null) ?? {}
  if (employee.isOwner && (body.roleId !== undefined || body.status === 'blocked')) {
    mockStatus(event, 422)
    return fail([{ code: 'owner_locked', message: 'The head of the company cannot be blocked or reassigned' }])
  }

  if (typeof body.fullName === 'string' && body.fullName.trim().length >= 3) employee.fullName = body.fullName.trim()
  if (typeof body.roleId === 'string' && state.roles.some(role => role.id === body.roleId)) employee.roleId = body.roleId
  if (body.departmentId === null || (typeof body.departmentId === 'string' && state.departments.some(item => item.id === body.departmentId)))
    employee.departmentId = body.departmentId as string | null
  if (Array.isArray(body.extraCategories)) employee.extraCategories = body.extraCategories.map(String)
  if (body.monthlyLimit === null) employee.monthlyLimit = null
  else if (Number(body.monthlyLimit) > 0) employee.monthlyLimit = Number(body.monthlyLimit)
  if (body.status === 'blocked') employee.status = 'blocked'
  if (body.status === 'active' && employee.status === 'blocked') employee.status = 'active'

  return ok(viewEmployee(employee))
})
