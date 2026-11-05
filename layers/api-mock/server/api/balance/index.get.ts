import { PLATFORM_REQUISITES, balanceState } from '../../utils/balance-state'
import { publicInvoice } from '../../utils/balance-view'
import { orderSeeds } from '../../utils/orders-state'
import { mockStampOf } from '../../utils/orders-view'
import type { BalanceOperation, BalanceOverview } from '#shared/types/order'

/**
 * Всё для страницы баланса: доступная сумма, резерв по заказам, реквизиты
 * компании и 1mart, счета на пополнение и движение денег.
 *
 * TODO: Connect to backend endpoint GET /balance
 */
export default defineEventHandler((event) => {
  const state = balanceState(event)
  const orders = orderSeeds(event).filter(order => order.cardId === null)

  const reserved = orders
    .filter(order => order.paymentStatus === 'held')
    .reduce((acc, order) => acc + order.amount, 0)

  const topups = state.invoices
    .filter(invoice => invoice.status === 'credited')
    .map(invoice => ({
      id: `t${invoice.id}`,
      kind: 'topup' as const,
      reference: invoice.number,
      amount: invoice.amount,
      sort: invoice.creditedAt ?? invoice.createdAt,
    }))

  const payments = orders.map(order => ({
    id: `p${order.id}`,
    kind: 'payment' as const,
    reference: order.number,
    orderId: order.id,
    amount: -order.amount,
    sort: order.placedAt,
  }))

  const refunds = orders
    .filter(order => order.paymentStatus === 'refunded')
    .map((order) => {
      const last = [...order.history].reverse().find(item => item.status === 'canceled' || item.status === 'rejectedBySeller')
      return {
        id: `r${order.id}`,
        kind: 'refund' as const,
        reference: order.number,
        orderId: order.id,
        amount: order.amount,
        sort: last?.at ?? order.placedAt,
      }
    })

  const operations: BalanceOperation[] = [...topups, ...payments, ...refunds]
    .sort((a, b) => b.sort - a.sort)
    .map(({ sort, amount, ...item }) => ({
      ...item,
      amount: { amount, currency: 'UZS' as const },
      date: mockStampOf(sort),
    }))

  const overview: BalanceOverview = {
    available: { amount: state.available, currency: 'UZS' },
    reserved: { amount: reserved, currency: 'UZS' },
    company: state.company,
    requisites: PLATFORM_REQUISITES,
    invoices: state.invoices.map(publicInvoice),
    operations,
    demo: true,
  }
  return ok(overview)
})
