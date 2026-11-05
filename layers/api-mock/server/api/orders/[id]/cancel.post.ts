import { cancelOrderSeed, findOrderSeed } from '../../../utils/orders-state'
import { toOrderCard } from '../../../utils/orders-view'

/**
 * Отмена заказа покупателем — пока продавец его не подтвердил. Резерв
 * снимается, деньги возвращаются тем же способом оплаты.
 *
 * TODO: Connect to backend endpoint POST /orders/{id}/cancel
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ reason?: string }>(event).catch(() => ({ reason: undefined }))

  if (!findOrderSeed(event, id)) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  const canceled = cancelOrderSeed(event, id, body?.reason?.trim() || '')

  if (!canceled) {
    throw createError({ statusCode: 409, statusMessage: 'Order can no longer be canceled' })
  }

  return ok(toOrderCard(event, canceled))
})
