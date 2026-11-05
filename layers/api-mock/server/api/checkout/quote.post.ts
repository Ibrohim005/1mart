import { quoteFor } from '../../utils/checkout-quote'
import { parseCheckoutRequest } from '../../utils/checkout-request'

/**
 * Итог заказа считает сервер: товары, промокод, доставка выбранной службой
 * или пункт выдачи, комиссия и проблемы с наличием (А1).
 *
 * TODO: Connect to backend endpoint POST /checkout/quote
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  return ok(quoteFor(event, parseCheckoutRequest(body)))
})
