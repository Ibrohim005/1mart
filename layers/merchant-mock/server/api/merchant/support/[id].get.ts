import { tickets } from '../../../lib/db'

/**
 * Карточка обращения с полной перепиской.
 * TODO: Connect to backend endpoint GET /merchant/support/{id}
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')!
  const ticket = tickets.find(t => t.id === id)
  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Ticket not found' })
  return ok(ticket)
})
