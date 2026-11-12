import { mockStatus } from '../../../utils/mock-status'
import { candidateView, rememberIdentity } from '../../../utils/org-signin'
import { REGISTRY } from '../../../utils/org-state'

/**
 * Код из OneID меняется на человека и компании, где он директор
 * (по ПИНФЛ из налогового реестра).
 * TODO: Connect to backend endpoint POST /auth/oneid/callback
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ code?: string }>(event).catch(() => null)
  if (!body?.code) {
    mockStatus(event, 400)
    return fail([{ code: 'oneid_code', message: 'OneID code is missing' }])
  }
  const fullName = 'Юлдашева Нигора Алишеровна'
  const companies = [REGISTRY[1]!]
  return ok({ token: rememberIdentity('oneid', fullName, companies), fullName, companies: companies.map(candidateView) })
})
