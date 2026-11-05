import { checkoutPrecheck, parseCheckoutRequest } from '../../../utils/checkout-request'
import { OTP_TTL_MS, issueOtp, otpLockedUntil } from '../../../utils/otp-state'

/**
 * Запрос SMS-кода перед оплатой (ТЗ п.4.1.6.10). Перед выдачей кода сервер
 * ещё раз проверяет наличие (А1) и деньги на карте (А3) — чтобы не просить код
 * у операции, которая всё равно не пройдёт.
 *
 * Ответ — исход, а не ошибка: `sent`, `locked`, `outOfStock`, `insufficientFunds`.
 * В демо код возвращается в `testCode` (SMS-шлюза у мока нет) и пишется в лог.
 *
 * TODO: Connect to backend endpoint POST /checkout/otp
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  const request = parseCheckoutRequest(body)

  const lockedUntil = otpLockedUntil(event)
  if (lockedUntil) return ok({ status: 'locked' as const, lockedUntil: new Date(lockedUntil).toISOString() })

  const { quote, problem } = checkoutPrecheck(event, request)
  if (problem) return ok(problem)

  const { session, attemptsLeft } = issueOtp(event, {
    amount: quote.payable,
    cardId: request.cardId,
  })

  console.info(`[1mart-mock] OTP for checkout ${session.id}: ${session.code}`)

  return ok({
    status: 'sent' as const,
    otpId: session.id,
    expiresIn: Math.round(OTP_TTL_MS / 1000),
    attemptsLeft,
    phone: '+998 90 ***-**-67',
    amount: quote.payable,
    testCode: session.code,
  })
})
