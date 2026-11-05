import { getOrderDetail } from '../../../lib/db'

/**
 * Карточка заказа с позициями, итогами, комиссией и лентой событий.
 * TODO: Connect to backend endpoint GET /merchant/orders/{id}
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')!
  const order = getOrderDetail(id)
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  return ok(order)
})
