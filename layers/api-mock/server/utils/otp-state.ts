import type { MockEvent } from './visitor'
import { perVisitor } from './visitor'

/**
 * Второй фактор перед оплатой (ТЗ п.4.1.6.10): SMS-код из 6 символов
 * A-Z a-z 0-9, живёт 59 секунд, после 3 неверных вводов действия
 * блокируются на 15 минут. Попытки считает сервер, не браузер.
 *
 * Код в демо возвращается в ответе (`testCode`), чтобы его можно было
 * показать на экране: SMS-шлюза у мока нет.
 *
 * TODO: Connect to backend endpoints POST /checkout/otp, POST /checkout/otp/verify
 */

export const OTP_LENGTH = 6
export const OTP_TTL_MS = 59_000
export const OTP_MAX_ATTEMPTS = 3
export const OTP_LOCK_MS = 15 * 60_000
/** Подтверждённый код даёт токен на одно оформление, живёт 5 минут */
const TOKEN_TTL_MS = 5 * 60_000

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export interface OtpPurpose {
  amount: number
  cardId: string | null
}

interface OtpState {
  session: (OtpPurpose & { id: string, code: string, expiresAt: number }) | null
  wrong: number
  lockedUntil: number
  tokens: Map<string, OtpPurpose & { expiresAt: number }>
}

const store = perVisitor<OtpState>(() => ({ session: null, wrong: 0, lockedUntil: 0, tokens: new Map() }))

function randomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(OTP_LENGTH))
  let code = ''
  for (const byte of bytes) code += ALPHABET[byte % ALPHABET.length]
  // Хотя бы одна буква и одна цифра — так код легче отличить от суммы в SMS
  if (!/\d/.test(code)) code = code.slice(0, 5) + String(bytes[0]! % 10)
  if (!/[A-Za-z]/.test(code)) code = 'K' + code.slice(1)
  return code
}

export function otpLockedUntil(event: MockEvent) {
  const state = store.get(event)
  if (state.lockedUntil && state.lockedUntil <= Date.now()) {
    state.lockedUntil = 0
    state.wrong = 0
  }
  return state.lockedUntil
}

export function issueOtp(event: MockEvent, purpose: OtpPurpose) {
  const state = store.get(event)
  const session = {
    ...purpose,
    id: crypto.randomUUID(),
    code: randomCode(),
    expiresAt: Date.now() + OTP_TTL_MS,
  }
  state.session = session
  return { session, attemptsLeft: OTP_MAX_ATTEMPTS - state.wrong }
}

export type OtpCheck =
  | { status: 'ok', token: string }
  | { status: 'wrong', attemptsLeft: number }
  | { status: 'expired' }
  | { status: 'locked', lockedUntil: number }

export function verifyOtp(event: MockEvent, otpId: string, code: string): OtpCheck {
  const state = store.get(event)
  const lockedUntil = otpLockedUntil(event)
  if (lockedUntil) return { status: 'locked', lockedUntil }

  const session = state.session
  if (!session || session.id !== otpId || session.expiresAt < Date.now()) return { status: 'expired' }

  // Регистр важен: алфавит кода — A-Z a-z 0-9
  if (session.code !== code) {
    state.wrong += 1
    if (state.wrong >= OTP_MAX_ATTEMPTS) {
      state.lockedUntil = Date.now() + OTP_LOCK_MS
      state.session = null
      return { status: 'locked', lockedUntil: state.lockedUntil }
    }
    return { status: 'wrong', attemptsLeft: OTP_MAX_ATTEMPTS - state.wrong }
  }

  state.wrong = 0
  state.session = null
  const token = crypto.randomUUID()
  state.tokens.set(token, {
    amount: session.amount,
    cardId: session.cardId,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  })
  return { status: 'ok', token }
}

/** Токен одноразовый и привязан к сумме и карте, под которые выдан код */
export function consumeOtpToken(event: MockEvent, token: string | undefined, purpose: OtpPurpose) {
  if (!token) return false
  const state = store.get(event)
  const saved = state.tokens.get(token)
  state.tokens.delete(token)
  return Boolean(saved
    && saved.expiresAt > Date.now()
    && saved.amount === purpose.amount
    && (saved.cardId ?? null) === (purpose.cardId ?? null))
}
