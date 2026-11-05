import type { InvoiceRecord } from './balance-state'
import { mockStampOf } from './orders-view'
import type { BalanceInvoice } from '#shared/types/order'

export function publicInvoice(invoice: InvoiceRecord): BalanceInvoice {
  return {
    id: invoice.id,
    number: invoice.number,
    amount: { amount: invoice.amount, currency: 'UZS' },
    status: invoice.status,
    createdAt: mockStampOf(invoice.createdAt),
  }
}
