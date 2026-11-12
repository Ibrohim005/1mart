import type { IssuedCredentials } from '#shared/types/company'
import { mockStatus } from '../../../utils/mock-status'
import { staffGuard } from '../../../utils/org-guard'
import { addEmployee, digitsOf, formatPhone, isPhoneTaken, viewEmployee } from '../../../utils/org-state'

/**
 * Новый сотрудник. Логин — его телефон, пароль временный: сервер шлёт их по SMS
 * на этот номер, а руководителю возвращает тоже — он может скопировать и
 * передать сам. При первом входе сотрудник задаёт свой пароль.
 * TODO: Connect to backend endpoint POST /company/employees (+ отправка SMS)
 */
export default defineEventHandler(async (event) => {
  const guard = staffGuard(event)
  if (guard.error) return guard.error
  const { state } = guard.member

  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  const fullName = String(body?.fullName ?? '').trim()
  const digits = digitsOf(String(body?.phone ?? ''))
  const roleId = String(body?.roleId ?? '')
  const departmentId = body?.departmentId ? String(body.departmentId) : null
  const limit = body?.monthlyLimit == null ? null : Number(body.monthlyLimit)
  const extraCategories = Array.isArray(body?.extraCategories) ? body.extraCategories.map(String) : []

  const errors = [
    fullName.length < 3 && { code: 'employee_name', message: 'Full name is required', field: 'fullName' },
    digits.length !== 9 && { code: 'employee_phone', message: 'Phone is incomplete', field: 'phone' },
    digits.length === 9 && isPhoneTaken(digits) && { code: 'employee_phone_taken', message: 'This phone already belongs to an employee', field: 'phone' },
    !state.roles.some(role => role.id === roleId) && { code: 'employee_role', message: 'Choose a role', field: 'roleId' },
    departmentId && !state.departments.some(item => item.id === departmentId) && { code: 'employee_department', message: 'Unknown department', field: 'departmentId' },
    limit !== null && !(limit > 0) && { code: 'employee_limit', message: 'Limit must be positive', field: 'monthlyLimit' },
  ].filter(Boolean) // && даёт и false, и null/undefined — в ошибки идут только объекты
  if (errors.length) {
    mockStatus(event, 422)
    return fail(errors as Array<{ code: string, message: string, field: string }>)
  }

  const { employee, password } = addEmployee(state, {
    fullName,
    phone: formatPhone(digits),
    roleId,
    departmentId,
    extraCategories,
    monthlyLimit: limit,
  })
  const credentials: IssuedCredentials = { login: employee.phone, password, smsSent: true }
  return ok({ employee: viewEmployee(employee), credentials })
})
