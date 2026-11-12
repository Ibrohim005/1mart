import type { MockEvent } from './visitor'
import { perVisitor } from './visitor'
import { scopeId } from './org-state'
import type { BalanceInvoiceStatus, BankDetails } from '#shared/types/order'

/**
 * Баланс компании-покупателя (B2B). Компания получает счёт, переводит деньги
 * со своего расчётного счёта на реквизиты 1mart, и после поступления сумма
 * зачисляется на баланс. С баланса оплачиваются заказы: при оформлении сумма
 * резервируется, после подтверждения продавцом уходит на его расчётный счёт.
 *
 * Банка у мока нет, поэтому поступление перевода имитирует отдельный запрос.
 * Деньги — целые тийины, как и везде.
 *
 * TODO: Connect to backend endpoints GET /balance, POST /balance/invoices
 */

/**
 * Заглушка, а не настоящие реквизиты: их должен дать владелец площадки.
 * Страница предупреждает, что по ним нельзя переводить деньги (`demo` в ответе).
 */
export const PLATFORM_REQUISITES: BankDetails = {
  name: 'spotshop',
  inn: '000000000',
  bank: 'Test Bank',
  mfo: '00000',
  account: '00000000000000000000',
}

export interface InvoiceRecord {
  id: string
  number: string
  amount: number
  status: BalanceInvoiceStatus
  createdAt: number
  creditedAt?: number
}

interface BalanceRecord {
  /** Доступно для покупок, тийины. Резерв считается по заказам */
  available: number
  company: BankDetails
  invoices: InvoiceRecord[]
}

const OPENING_TOPUP = 2_000_000_000

function seed(): BalanceRecord {
  const createdAt = Date.now() - 6 * 24 * 60 * 60 * 1000
  return {
    available: OPENING_TOPUP,
    company: { name: 'ООО «TEST COMPANY»', inn: '111111111', bank: 'Test Bank', mfo: '11111', account: '11111111111111111111' },
    invoices: [{
      id: 'inv1',
      number: '1M-000101',
      amount: OPENING_TOPUP,
      status: 'credited',
      createdAt,
      creditedAt: createdAt + 3 * 60 * 60 * 1000,
    }],
  }
}

const store = perVisitor<BalanceRecord>(seed, 500, scopeId) // общее у всей компании, см. org-state

export function balanceState(event: MockEvent) {
  return store.get(event)
}

export function companyDetails(event: MockEvent) {
  return store.get(event).company
}

export function hasBalance(event: MockEvent, amount: number) {
  return store.get(event).available >= amount
}

export function holdBalance(event: MockEvent, amount: number) {
  store.get(event).available -= amount
}

export function releaseBalance(event: MockEvent, amount: number) {
  store.get(event).available += amount
}

export function createInvoice(event: MockEvent, amount: number) {
  const state = store.get(event)
  const invoice: InvoiceRecord = {
    id: `inv${Date.now().toString(36)}`,
    number: `1M-${String(101 + state.invoices.length).padStart(6, '0')}`,
    amount,
    status: 'awaiting',
    createdAt: Date.now(),
  }
  state.invoices.unshift(invoice)
  return invoice
}

/** Деньги пришли на счёт 1mart — сумма счёта становится доступной */
export function creditInvoice(event: MockEvent, id: string) {
  const state = store.get(event)
  const invoice = state.invoices.find(item => item.id === id)
  if (!invoice) return null
  if (invoice.status === 'awaiting') {
    invoice.status = 'credited'
    invoice.creditedAt = Date.now()
    state.available += invoice.amount
  }
  return invoice
}
