import { mockStatus } from '../../utils/mock-status'
import { forgetIdentity, identityOf } from '../../utils/org-signin'
import { digitsOf, formatPhone, isInnTaken, isPhoneTaken, registerCompany } from '../../utils/org-state'

/**
 * Регистрация компании после OneID или ЭЦП. Данные компании сервер берёт из
 * подтверждённой личности (token), из браузера — только выбор ИНН, телефон
 * руководителя для SMS и входа и его пароль. Кто зарегистрировал — руководитель.
 * TODO: Connect to backend endpoint POST /company/register
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  const identity = identityOf(String(body?.token ?? ''))
  if (!identity) {
    mockStatus(event, 401)
    return fail([{ code: 'identity_expired', message: 'Confirm your identity again' }])
  }
  const candidate = identity.companies.find(item => item.inn === String(body?.inn ?? ''))
  const digits = digitsOf(String(body?.phone ?? ''))
  const password = String(body?.password ?? '')

  const errors = [
    !candidate && { code: 'company_unknown', message: 'Choose your company', field: 'inn' },
    candidate && isInnTaken(candidate.inn) && { code: 'company_registered', message: 'This company is already registered', field: 'inn' },
    digits.length !== 9 && { code: 'phone_incomplete', message: 'Phone is incomplete', field: 'phone' },
    digits.length === 9 && isPhoneTaken(digits) && { code: 'phone_taken', message: 'This phone already belongs to an employee', field: 'phone' },
    (password.length < 8 || !/\d/.test(password) || !/[a-zа-я]/i.test(password)) && { code: 'password_weak', message: 'At least 8 characters with letters and digits', field: 'password' },
  ].filter(Boolean) // && даёт и false, и null/undefined — в ошибки идут только объекты
  if (errors.length) {
    mockStatus(event, 422)
    return fail(errors as Array<{ code: string, message: string, field: string }>)
  }

  const state = registerCompany(candidate!, identity.source, { fullName: identity.fullName, phone: formatPhone(digits) }, password)
  forgetIdentity(String(body?.token))
  return ok({ phone: formatPhone(digits), name: identity.fullName, company: state.company })
})
