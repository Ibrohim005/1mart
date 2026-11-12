import type { CompanyCandidate } from '#shared/types/company'
import { REGISTRY, isInnTaken } from './org-state'

/**
 * Подтверждённая личность из OneID или ЭЦП. Сервер помнит её под одноразовым
 * токеном: регистрация компании принимает только токен, а не ИНН из браузера —
 * иначе любой зарегистрировал бы чужую фирму.
 */
interface Verified {
  source: 'oneid' | 'eimzo'
  fullName: string
  companies: CompanyCandidate[]
  expires: number
}

const verified = new Map<string, Verified>()

export function rememberIdentity(source: Verified['source'], fullName: string, companies: CompanyCandidate[]) {
  const token = crypto.randomUUID()
  verified.set(token, { source, fullName, companies, expires: Date.now() + 15 * 60_000 })
  return token
}

export function identityOf(token: string) {
  const found = verified.get(token)
  if (!found || found.expires < Date.now()) return null
  return found
}

export function forgetIdentity(token: string) {
  verified.delete(token)
}

/** Компания для ответа: зарегистрирована ли уже — тогда фронт предлагает войти */
export function candidateView(candidate: CompanyCandidate) {
  return { ...candidate, registered: isInnTaken(candidate.inn) }
}

/** Демо-ключи ЭЦП. В бою список ключей отдаёт приложение E-IMZO на компьютере пользователя, не сервер. */
export const DEMO_KEYS = [
  { id: 'key-audit', owner: 'KARIMOV BAXTIYOR', company: REGISTRY[0]!, validTo: '2027-03-14' },
  { id: 'key-digital', owner: 'YULDASHEVA NIGORA', company: REGISTRY[1]!, validTo: '2027-08-02' },
  { id: 'key-hokimiyat', owner: 'RAHIMOV SHUHRAT', company: REGISTRY[2]!, validTo: '2026-12-30' },
]
