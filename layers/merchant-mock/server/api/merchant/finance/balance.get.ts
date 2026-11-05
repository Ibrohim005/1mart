import { balance } from '../../../lib/db'

/**
 * Баланс продавца: доступно, в ожидании, удержано, заработано всего.
 * TODO: Connect to backend endpoint GET /merchant/finance/balance
 */
export default defineEventHandler(() => ok(balance))
