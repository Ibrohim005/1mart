import type { OrderStatusCode } from '#shared/types/merchant'
import { getOrderDetail, orders } from '../../../lib/db'

const VALID: OrderStatusCode[] = [
  'new', 'confirmed', 'packing', 'shipped', 'delivered', 'completed', 'cancelled', 'returned',
]

/**
 * Смена статуса заказа продавцом (подтвердить, собрать, отгрузить и т. д.).
 * TODO: Connect to backend endpoint PATCH /merchant/orders/{id}
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody<{ statusCode?: OrderStatusCode }>(event)
  const statusCode = body?.statusCode

  if (!statusCode || !VALID.includes(statusCode))
    throw createError({ statusCode: 422, statusMessage: 'Invalid order status' })

  const listItem = orders.find(o => o.id === id)
  if (!listItem) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  listItem.statusCode = statusCode
  const detail = getOrderDetail(id)
  if (detail) {
    detail.statusCode = statusCode
    detail.timeline.push({ code: statusCode, at: new Date().toISOString() })
  }

  return ok(listItem)
})
