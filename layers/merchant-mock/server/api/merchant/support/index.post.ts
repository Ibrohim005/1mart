import type { TicketDetail, TicketPriority } from '#shared/types/merchant'
import { tickets } from '../../../lib/db'

/**
 * Новое обращение в поддержку. Первое сообщение — текст обращения.
 * TODO: Connect to backend endpoint POST /merchant/support
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ subject?: string, text?: string, priority?: TicketPriority }>(event)
  const subject = String(body?.subject ?? '').trim()
  const text = String(body?.text ?? '').trim()

  if (subject.length < 3) throw createError({ statusCode: 422, statusMessage: 'Subject is required' })
  if (text.length < 3) throw createError({ statusCode: 422, statusMessage: 'Message is required' })

  const now = new Date().toISOString()
  const ticket: TicketDetail = {
    id: `tk-${Date.now().toString(36)}`,
    number: `TK-${200 + tickets.length}`,
    subject,
    status: 'open',
    priority: body?.priority ?? 'normal',
    createdAt: now,
    updatedAt: now,
    lastMessage: text,
    messages: [
      { id: `m-${Date.now().toString(36)}`, author: 'merchant', text, createdAt: now },
    ],
  }

  tickets.unshift(ticket)
  return ok(ticket)
})
