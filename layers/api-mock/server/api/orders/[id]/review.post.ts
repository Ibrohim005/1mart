import { findOrderSeed } from '../../../utils/orders-state'

/**
 * Отзыв о покупке после доставки (ТЗ UC-FL-10, последний шаг).
 *
 * TODO: Connect to backend endpoint POST /orders/{id}/review
 */
export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const order = findOrderSeed(event, id)

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }
  if (order.status !== 'delivered' && order.status !== 'returnRequested') {
    throw createError({ statusCode: 409, statusMessage: 'Review is available only after delivery' })
  }

  order.reviewed = true
  return ok({ reviewed: true })
})
