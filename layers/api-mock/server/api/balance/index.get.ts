import { PLATFORM_REQUISITES, balanceState } from '../../utils/balance-state'
import { publicInvoice } from '../../utils/balance-view'
import { orderSeeds } from '../../utils/orders-state'
import { mockStampOf } from '../../utils/orders-view'
import type { BalanceOperation, BalanceOverview } from '#shared/types/order'
import { mockStatus } from '../../utils/mock-status'
import { can, membership } from '../../utils/org-state'

/**
 * Всё для страницы баланса: доступная сумма, резерв по заказам, реквизиты
 * компании и 1mart, счета на пополнение и движение денег.
 *
 * TODO: Connect to backend endpoint GET /balance
 */
export default defineEventHandler((event) => {
  // Баланс видит тот, кто им управляет или платит за заказы (закупщик); сотрудник — нет
  if (!can(event, 'balance.manage') && !can(event, 'requests.approve')) {
    mockStatus(event, 403)
    return fail([{ code: 'balance_forbidden', message: 'This role cannot see the company balance' }])
  }

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
    // Название и ИНН — компании покупателя (как в разделе «Компания»), банк и счёт — из реквизитов баланса
    company: { ...state.company, ...companyOf(membership(event)?.state.company) },
    requisites: PLATFORM_REQUISITES,
    invoices: state.invoices.map(publicInvoice),
    operations,
    demo: true,
  }
  return ok(overview)
})

function companyOf(company: { name: string, inn: string } | undefined) {
  return company?.inn ? { name: company.name, inn: company.inn } : {}
}
