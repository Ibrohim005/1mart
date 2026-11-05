import { mockStatus } from '../../../utils/mock-status'
import { findOrderSeed, returnOrderSeed } from '../../../utils/orders-state'
import { toOrderCard } from '../../../utils/orders-view'

/**
 * Оформление возврата (ТЗ UC-58): после доставки, с причиной и,
 * по желанию, фото. Сами файлы мок не хранит — только их число.
 *
 * TODO: Connect to backend endpoint POST /orders/{id}/return
 */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ reason?: string, photos?: number }>(event).catch(() => null)
  const reason = String(body?.reason ?? '').trim()

  if (!findOrderSeed(event, id)) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  if (reason.length < 3) {
    mockStatus(event, 422)
    return fail([{ code: 'reason_required', message: 'Return reason is required', field: 'reason' }])
  }

  const order = returnOrderSeed(event, id, reason.slice(0, 500), Math.max(0, Math.min(5, Number(body?.photos) || 0)))
  if (!order) {
    throw createError({ statusCode: 409, statusMessage: 'Return is available only after delivery' })
  }

  return ok(toOrderCard(event, order))
})
