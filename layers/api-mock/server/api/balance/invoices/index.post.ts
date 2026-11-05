import { mockStatus } from '../../../utils/mock-status'
import { createInvoice } from '../../../utils/balance-state'
import { publicInvoice } from '../../../utils/balance-view'

/**
 * Счёт на пополнение баланса. Сумма — целые тийины.
 *
 * TODO: Connect to backend endpoint POST /balance/invoices
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ amount?: number }>(event).catch(() => null)
  const amount = Number(body?.amount)

  if (!Number.isInteger(amount) || amount <= 0) {
    mockStatus(event, 422)
    return fail([{ code: 'invoice_amount', message: 'Amount is invalid', field: 'amount' }])
  }

  return ok(publicInvoice(createInvoice(event, amount)))
})
