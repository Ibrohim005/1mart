import { mockStatus } from '../../utils/mock-status'
import { forgetIdentity, identityOf } from '../../utils/org-signin'
import { companyByInn } from '../../utils/org-state'

/**
 * Вход руководителя через OneID или ЭЦП, если его компания уже зарегистрирована.
 * TODO: Connect to backend endpoint POST /auth/identity-login
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ token?: string, inn?: string }>(event).catch(() => null)
  const identity = identityOf(String(body?.token ?? ''))
  const candidate = identity?.companies.find(item => item.inn === body?.inn)
  const state = candidate ? companyByInn(candidate.inn) : null
  const owner = state?.employees.find(item => item.isOwner)
  if (!identity || !state || !owner) {
    mockStatus(event, 401)
    return fail([{ code: 'identity_expired', message: 'Confirm your identity again' }])
  }
  forgetIdentity(String(body?.token))
  return ok({ phone: owner.phone, name: owner.fullName, mustChangePassword: false })
})
