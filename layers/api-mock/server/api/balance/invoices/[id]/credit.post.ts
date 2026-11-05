import { mockStatus } from '../../../../utils/mock-status'
import { creditInvoice } from '../../../../utils/balance-state'
import { publicInvoice } from '../../../../utils/balance-view'

/**
 * Только для мока: имитирует поступление перевода на счёт 1mart.
 * На настоящем бэкенде счёт закрывает банковская выписка, такого запроса нет.
 */
export default defineEventHandler((event) => {
  const invoice = creditInvoice(event, getRouterParam(event, 'id') ?? '')
  if (!invoice) {
    mockStatus(event, 404)
    return fail([{ code: 'not_found', message: 'Invoice not found' }])
  }
  return ok(publicInvoice(invoice))
})
