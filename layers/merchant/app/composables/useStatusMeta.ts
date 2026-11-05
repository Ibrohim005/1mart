/**
 * Карты статусов → тон бейджа + ключ подписи. Ветвимся по машинному коду,
 * не по переведённой строке (урок из CLAUDE.md). Подпись берётся из словаря
 * вызывающим кодом: `$t(meta.key)`.
 */
type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'
export interface StatusMeta { tone: Tone, key: string }

const ORDER: Record<string, Tone> = {
  new: 'warning',
  confirmed: 'info',
  packing: 'info',
  shipped: 'info',
  delivered: 'success',
  completed: 'success',
  cancelled: 'danger',
  returned: 'danger',
}
const PAYOUT: Record<string, Tone> = {
  requested: 'warning',
  processing: 'info',
  paid: 'success',
  rejected: 'danger',
}
const PRODUCT: Record<string, Tone> = {
  active: 'success',
  draft: 'neutral',
  moderation: 'warning',
  archived: 'neutral',
  rejected: 'danger',
}
const DOCUMENT: Record<string, Tone> = {
  ready: 'success',
  generating: 'info',
  signRequired: 'warning',
}
const TICKET: Record<string, Tone> = {
  open: 'warning',
  answered: 'info',
  closed: 'neutral',
}
const EMPLOYEE: Record<string, Tone> = {
  active: 'success',
  invited: 'warning',
  blocked: 'danger',
}
const COMPANY: Record<string, Tone> = {
  active: 'success',
  pending: 'warning',
  rejected: 'danger',
  suspended: 'danger',
}

export function useStatusMeta() {
  const make = (map: Record<string, Tone>, ns: string) =>
    (code: string): StatusMeta => ({ tone: map[code] ?? 'neutral', key: `${ns}.${code}` })

  return {
    order: make(ORDER, 'm.orderStatus'),
    payout: make(PAYOUT, 'm.payoutStatus'),
    product: make(PRODUCT, 'm.productStatus'),
    document: make(DOCUMENT, 'm.documentStatus'),
    ticket: make(TICKET, 'm.ticketStatus'),
    employee: make(EMPLOYEE, 'm.employeeStatus'),
    company: make(COMPANY, 'm.companyStatus'),
  }
}
