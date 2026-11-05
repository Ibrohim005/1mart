import { notifications } from '../../../lib/db'

/**
 * Уведомления продавца (новые заказы, финансы, модерация, система).
 * TODO: Connect to backend endpoint GET /merchant/notifications
 */
export default defineEventHandler(() => ok(notifications))
