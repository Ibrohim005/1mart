import { mockStatus } from '../../../utils/mock-status'
import { DEMO_KEYS, candidateView, rememberIdentity } from '../../../utils/org-signin'

/**
 * Подпись PKCS#7 проверяется на сервере (в бою — через E-IMZO Server / сервис
 * проверки ЭЦП). Из сертификата берутся ИНН организации и ФИО директора.
 * Мок понимает свою «подпись» вида `mock-pkcs7:<id ключа>:<challenge>`.
 * TODO: Connect to backend endpoint POST /auth/eimzo/verify
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ pkcs7?: string }>(event).catch(() => null)
  const [, keyId] = String(body?.pkcs7 ?? '').split(':')
  const key = DEMO_KEYS.find(item => item.id === keyId)
  if (!key) {
    mockStatus(event, 400)
    return fail([{ code: 'eimzo_signature', message: 'Signature could not be verified' }])
  }
  const fullName = key.company.director
  return ok({ token: rememberIdentity('eimzo', fullName, [key.company]), fullName, companies: [candidateView(key.company)] })
})
