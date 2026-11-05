import type { TransactionType } from '#shared/types/merchant'
import { transactions } from '../../../lib/db'
import { paginate, readPaging } from '../../../lib/query'

/**
 * Журнал транзакций: продажи, комиссии, выплаты, возвраты, корректировки.
 * TODO: Connect to backend endpoint GET /merchant/finance/transactions
 */
export default defineEventHandler((event) => {
  const q = getQuery(event)
  const { page, perPage } = readPaging(event)

  const list = transactions.filter((t) => {
    if (q.type && q.type !== 'all' && t.type !== (q.type as TransactionType)) return false
    return true
  })

  return ok(paginate(list, page, perPage))
})
