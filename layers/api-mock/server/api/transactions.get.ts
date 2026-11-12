import { orderSeeds } from '../utils/orders-state'
import { mockStampOf } from '../utils/orders-view'
import { paymentMethodLabel } from '../utils/cards-state'

/**
 * История транзакций по картам: резервы и списания по заказам и возвраты
 * на карту. Один платёж за корзину из нескольких продавцов —
 * одна строка на заказ, у всех общий id транзакции.
 *
 * TODO: Connect to backend endpoint GET /transactions
 */
export default defineEventHandler((event) => {
  const orders = orderSeeds(event)
  const at = (ms: number) => mockStampOf(ms).replace(', ', ' • ')

  const payments = orders.map((order, index) => ({
    id: 1000 + order.id,
    kind: 'order' as const,
    orderId: order.id,
    orderNumber: order.number,
    amount: { amount: -order.amount, currency: 'UZS' as const },
    positive: false,
    date: at(order.placedAt),
    method: paymentMethodLabel(event, order.cardId),
    placedBy: order.placedBy?.fullName,
    sort: order.placedAt + index,
  }))

  const refunds = orders
    .filter(order => order.paymentStatus === 'refunded')
    .map((order) => {
      const when = [...order.history].reverse().find(item => item.status === 'canceled' || item.status === 'rejectedBySeller')?.at ?? order.placedAt
      return {
        id: 2000 + order.id,
        kind: 'refund' as const,
        orderId: order.id,
        orderNumber: order.number,
        amount: { amount: order.amount, currency: 'UZS' as const },
        positive: true,
        date: at(when),
        method: paymentMethodLabel(event, order.cardId),
        sort: when,
      }
    })

  return ok([...payments, ...refunds]
    .sort((a, b) => b.sort - a.sort)
    .map(({ sort: _sort, ...item }) => item))
})
