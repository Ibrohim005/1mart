import { mockStatus } from '../../../utils/mock-status'
import { verifyOtp } from '../../../utils/otp-state'

/**
 * Проверка SMS-кода. Неверные попытки считает сервер: третья подряд
 * блокирует финансовые действия на 15 минут (ТЗ п.4.1.6.10).
 *
 * TODO: Connect to backend endpoint POST /checkout/otp/verify
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ otpId?: string, code?: string }>(event).catch(() => null)
  const code = String(body?.code ?? '')

  if (!/^[A-Za-z0-9]{6}$/.test(code)) {
    mockStatus(event, 422)
    return fail([{ code: 'otp_format', message: 'Code must be 6 characters A-Z a-z 0-9', field: 'code' }])
  }

  const result = verifyOtp(event, String(body?.otpId ?? ''), code)
  if (result.status === 'locked') return ok({ status: 'locked' as const, lockedUntil: new Date(result.lockedUntil).toISOString() })
  return ok(result)
})
