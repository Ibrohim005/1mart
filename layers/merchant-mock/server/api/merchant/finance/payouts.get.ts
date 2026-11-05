import { payouts } from '../../../lib/db'
import { paginate, readPaging } from '../../../lib/query'

/**
 * История выплат продавцу.
 * TODO: Connect to backend endpoint GET /merchant/finance/payouts
 */
export default defineEventHandler((event) => {
  const { page, perPage } = readPaging(event)
  return ok(paginate(payouts, page, perPage))
})
