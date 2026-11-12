import type { Access } from '#shared/types/company'
import { pendingOf } from '../../utils/cart-state'
import { mockStatus } from '../../utils/mock-status'
import { allowedCategories, membership, roleOf, viewEmployee, viewRole } from '../../utils/org-state'

/**
 * Кто я в компании и что мне можно: роль, права, открытые категории, остаток лимита.
 * Интерфейс по нему прячет недоступное; запрещает всё равно сервер.
 * TODO: Connect to backend endpoint GET /company/access
 */
export default defineEventHandler((event) => {
  const member = membership(event)
  if (!member) {
    mockStatus(event, 401)
    return fail([{ code: 'unauthorized', message: 'Login required' }])
  }
  const { state, employee } = member
  const role = roleOf(state, employee)
  const limitLeft = employee.monthlyLimit === null
    ? null
    : { amount: Math.max(0, employee.monthlyLimit - employee.spentThisMonth - pendingOf(event, employee.id)), currency: 'UZS' as const }

  const access: Access = {
    company: state.company,
    employee: viewEmployee(employee),
    role: viewRole(state, role),
    department: state.departments.filter(item => item.id === employee.departmentId).map(({ id, title }) => ({ id, title }))[0] ?? null,
    permissions: [...role.permissions],
    categories: allowedCategories(event),
    limitLeft,
  }
  return ok(access)
})
