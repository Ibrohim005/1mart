/**
 * Регистрация, шаг 2: код из SMS. Здесь же открывается сеанс.
 *
 * Код шестизначный — столько цифр шлёт бэкенд; «000000» отвергается, чтобы
 * фронт умел показывать ошибку неверного кода.
 *
 * Сеанс в моке держит cookie на стороне браузера: закрывать серверу нечего,
 * и пары токенов, как у настоящего бэкенда, здесь нет — роут существует,
 * чтобы вызов из стора был одинаковым в обоих режимах.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ session?: string, code?: string }>(event)
  const session = String(body?.session ?? '')
  const code = String(body?.code ?? '')

  const digits = session.startsWith('mock-') ? session.slice(5) : ''
  if (digits.length !== 9) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid session' })
  }
  if (!/^\d{6}$/.test(code) || code === '000000') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired OTP' })
  }

  // Имени у только что зарегистрированного нет — как и у бэкенда.
  return ok({ phone: `+998 ${digits}`, name: '' })
})
