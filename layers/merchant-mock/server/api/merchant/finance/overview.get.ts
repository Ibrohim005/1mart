import type { FinanceOverview } from '#shared/types/merchant'
import { balance, transactions } from '../../../lib/db'
import { tiyin } from '../../../lib/money'

/**
 * Финансовая сводка: баланс, обороты за период, последние движения,
 * ближайшая запланированная выплата.
 * TODO: Connect to backend endpoint GET /merchant/finance/overview
 */
export default defineEventHandler(() => {
  const sumBy = (type: string) =>
    transactions.filter(t => t.type === type).reduce((s, t) => s + Math.abs(t.amount.amount), 0)

  const next = new Date()
  next.setDate(next.getDate() + 5)

  const overview: FinanceOverview = {
    balance,
    periodRevenue: tiyin(sumBy('sale')),
    periodCommission: tiyin(sumBy('commission')),
    periodPayouts: tiyin(sumBy('payout')),
    recentTransactions: transactions.slice(0, 8),
    nextPayout: { amount: balance.available, date: next.toISOString() },
  }

  return ok(overview)
})
