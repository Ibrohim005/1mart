import type { CommissionSummary } from '#shared/types/merchant'
import { commissions, company } from '../../../lib/db'
import { tiyin } from '../../../lib/money'
import { paginate, readPaging } from '../../../lib/query'

/**
 * Комиссии маркетплейса: базовая ставка, удержано за период, разбивка по
 * категориям и постраничный журнал удержаний.
 * TODO: Connect to backend endpoint GET /merchant/finance/commissions
 */
export default defineEventHandler((event) => {
  const { page, perPage } = readPaging(event)

  const periodTotal = tiyin(commissions.reduce((s, c) => s + c.amount.amount, 0))

  const grouped = new Map<string, { categoryName: string, rate: number, amount: number }>()
  for (const c of commissions) {
    const row = grouped.get(c.categoryName) ?? { categoryName: c.categoryName, rate: c.rate, amount: 0 }
    row.amount += c.amount.amount
    grouped.set(c.categoryName, row)
  }

  const summary: CommissionSummary = {
    baseRate: company.commissionRate,
    periodTotal,
    rows: paginate(commissions, page, perPage),
    byCategory: [...grouped.values()].map(g => ({
      categoryName: g.categoryName,
      rate: g.rate,
      amount: tiyin(g.amount),
    })),
  }

  return ok(summary)
})
