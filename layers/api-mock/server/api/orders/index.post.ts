import { mockStatus } from '../../utils/mock-status'
import { cartEntries, isSelected, removeFromCart } from '../../utils/cart-state'
import { checkoutPrecheck, parseCheckoutRequest } from '../../utils/checkout-request'
import { consumeOtpToken } from '../../utils/otp-state'
import { createOrderSeeds, newTransactionId } from '../../utils/orders-state'
import { receiptFor } from '../../utils/orders-view'
import { holdFunds } from '../../utils/cards-state'
import { productCards } from '../../../mocks/data'

/**
 * Оформление заказа (ТЗ UC-FL-10). Оплата корпоративной картой принимается только
 * с токеном, который выдала проверка SMS-кода под эту же сумму и эту же карту.
 * Оплата с баланса подтверждается покупателем на странице и кода не требует.
 *
 * Деньги не списываются, а резервируются (hold): заказ уходит продавцу со статусом
 * «Ожидает подтверждения продавца», после подтверждения они идут на его расчётный счёт.
 * Корзина делится по продавцам, оплата одна — с общим id транзакции и чеком.
 *
 * TODO: Connect to backend endpoint POST /orders
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  const request = parseCheckoutRequest(body)

  const { quote, problem } = checkoutPrecheck(event, request)
  if (problem) return ok(problem)

  if (request.paymentMethod === 'card') {
    const confirmed = consumeOtpToken(event, typeof body?.otpToken === 'string' ? body.otpToken : undefined, {
      amount: quote.payable,
      cardId: request.cardId,
    })
    if (!confirmed) {
      mockStatus(event, 403)
      return fail([{ code: 'otp_required', message: 'Operation must be confirmed with an SMS code' }])
    }
  }

  const entries = cartEntries(event).filter(entry => isSelected(event, entry.skuId))
  const lines = entries
    .map(entry => ({
      productIndex: productCards.findIndex(item => item.id === entry.product.id),
      quantity: entry.quantity,
      price: entry.product.price.amount,
    }))
    .filter(line => line.productIndex >= 0)

  const courier = quote.couriers.find(item => item.id === quote.provider)
  const pickup = quote.pickupPoints.find(item => item.id === quote.pickupPointId)

  const transactionId = newTransactionId()
  const orders = createOrderSeeds(event, {
    lines,
    deliveryType: quote.deliveryType,
    provider: quote.provider,
    pickupPointId: quote.pickupPointId,
    cardId: request.cardId,
    promoPercent: quote.promoPercent,
    promoAmount: quote.promoAmount,
    delivery: quote.delivery,
    etaDays: (quote.deliveryType === 'courier' ? courier?.days : pickup?.days) ?? 2,
    transactionId,
    comment: request.comment,
  })

  const reserved = orders.reduce((acc, order) => acc + order.amount, 0)
  holdFunds(event, request.cardId, reserved)

  // Оформленные позиции уходят из корзины, невыбранные остаются
  for (const entry of entries) removeFromCart(event, entry.skuId)

  return ok({
    status: 'placed' as const,
    orders: orders.map(order => ({ id: order.id, number: order.number, amount: { amount: order.amount, currency: 'UZS' as const } })),
    transactionId,
    reserved: { amount: reserved, currency: 'UZS' as const },
    paymentStatus: 'held' as const,
    receipt: receiptFor(event, orders),
  })
})
