import type { Employee, MerchantRole } from '#shared/types/merchant'
import { employees } from '../../../lib/db'

/**
 * Приглашение сотрудника. Новый сотрудник получает статус «приглашён»,
 * пока не примет приглашение.
 * TODO: Connect to backend endpoint POST /merchant/employees
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string, phone?: string, email?: string, role?: MerchantRole }>(event)
  const name = String(body?.name ?? '').trim()
  const phone = String(body?.phone ?? '').trim()

  if (name.length < 2) throw createError({ statusCode: 422, statusMessage: 'Name is required' })
  if (phone.length < 7) throw createError({ statusCode: 422, statusMessage: 'Phone is required' })

  const employee: Employee = {
    id: `emp-${Date.now().toString(36)}`,
    name,
    phone,
    email: String(body?.email ?? ''),
    role: body?.role ?? 'viewer',
    status: 'invited',
    lastActiveAt: null,
  }

  employees.push(employee)
  return ok(employee)
})
