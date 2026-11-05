import { notifications } from '../../../lib/db'

/**
 * Отметить уведомление прочитанным. Без id — отмечает все.
 * TODO: Connect to backend endpoint POST /merchant/notifications/read
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ id?: string }>(event)
  if (body?.id) {
    const n = notifications.find(n => n.id === body.id)
    if (n) n.read = true
  }
  else {
    notifications.forEach(n => (n.read = true))
  }
  return ok({ unread: notifications.filter(n => !n.read).length })
})
