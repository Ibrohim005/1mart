import type { TicketListItem } from '#shared/types/merchant'
import { tickets } from '../../../lib/db'

/**
 * Список обращений в поддержку (без переписки — она в карточке обращения).
 * TODO: Connect to backend endpoint GET /merchant/support
 */
export default defineEventHandler(() => {
  const list: TicketListItem[] = tickets.map(({ messages: _messages, ...rest }) => rest)
  return ok(list)
})
