import { membership } from '../../utils/org-state'
import { mockStatus } from '../../utils/mock-status'
import { companyDetails } from '../../utils/balance-state'

/**
 * Реквизиты компании-покупателя: от неё приходит перевод и на неё выставляется счёт.
 * Форматы Узбекистана: ИНН 9 цифр, МФО 5 цифр, расчётный счёт 20 цифр.
 *
 * TODO: Connect to backend endpoint PATCH /user/company
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  const read = (key: string) => String(body?.[key] ?? '').trim()

  const next = { name: read('name'), inn: read('inn'), bank: read('bank'), mfo: read('mfo'), account: read('account') }

  const errors = [
    !next.name && { code: 'company_name', message: 'Name is required', field: 'name' },
    !/^\d{9}$/.test(next.inn) && { code: 'company_inn', message: 'INN must be 9 digits', field: 'inn' },
    !next.bank && { code: 'company_bank', message: 'Bank is required', field: 'bank' },
    !/^\d{5}$/.test(next.mfo) && { code: 'company_mfo', message: 'MFO must be 5 digits', field: 'mfo' },
    !/^\d{20}$/.test(next.account) && { code: 'company_account', message: 'Account must be 20 digits', field: 'account' },
  ].filter(item => item !== false)

  if (errors.length) {
    mockStatus(event, 422)
    return fail(errors)
  }

  // Название и ИНН общие с разделом «Компания»
  const org = membership(event)?.state.company
  if (org) Object.assign(org, { name: next.name, inn: next.inn })
  return ok(Object.assign(companyDetails(event), next))
})
