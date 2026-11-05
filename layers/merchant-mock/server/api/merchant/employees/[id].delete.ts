import { employees } from '../../../lib/db'

/**
 * Удаление сотрудника. Владельца компании удалить нельзя.
 * TODO: Connect to backend endpoint DELETE /merchant/employees/{id}
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')!
  const idx = employees.findIndex(e => e.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Employee not found' })
  if (employees[idx]!.role === 'owner')
    throw createError({ statusCode: 422, statusMessage: 'Owner cannot be removed' })

  employees.splice(idx, 1)
  return ok({ id, deleted: true })
})
