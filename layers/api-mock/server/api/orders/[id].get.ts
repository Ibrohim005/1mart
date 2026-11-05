import { canCancel, findOrderSeed, orderSeeds } from '../../utils/orders-state'
import { receiptFor, toOrderCard } from '../../utils/orders-view'
import { pickupPointById } from '../../utils/checkout-quote'
import { paymentMethodLabel } from '../../utils/cards-state'
import { profileState } from '../../utils/profile-state'
import type { OrderAction } from '#shared/types/order'

/**
 * Один заказ целиком: карточка, доставка, оплата, чек и доступные действия.
 * Какие действия разрешены, решает сервер (ТЗ: отмена — пока продавец не
 * подтвердил; возврат и отзыв — после доставки).
 *
 * TODO: Connect to backend endpoint GET /orders/{id}
 */
export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const seed = findOrderSeed(event, id)

  if (!seed) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  const card = toOrderCard(event, seed)

  const actions: OrderAction[] = ['repeat']
  if (canCancel(seed.status)) actions.unshift('cancel')
  if (seed.status === 'delivered') actions.push('return')
  if ((seed.status === 'delivered' || seed.status === 'returnRequested') && !seed.reviewed) actions.push('review')
  if (seed.transactionId) actions.push('receipt')

  const pickup = seed.deliveryType === 'pickupPoint'
  const point = pickupPointById(seed.pickupPointId)
  const sameTransaction = orderSeeds(event).filter(order => order.transactionId === seed.transactionId)

  return ok({
    ...card,
    address: pickup
      ? `${point?.title ?? '1mart'}: ${point?.address ?? ''}`
      : 'Узбекистан, Ташкент, улица Ширин Файзулаевой, 169, кв. 18',
    recipient: profileState(event).fullName,
    recipientPhone: '+998 90 123-45-67',
    paymentLabel: paymentMethodLabel(event, seed.cardId),
    deliveryPrice: { amount: seed.deliveryPrice, currency: 'UZS' as const },
    commission: { amount: 0, currency: 'UZS' as const },
    receipt: receiptFor(event, sameTransaction.length ? sameTransaction : [seed]),
    returnReason: seed.returnReason,
    actions,
  })
})
