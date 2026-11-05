import { openSession } from '../../utils/session'

/**
 * Регистрация, шаг 2 — подтверждение кода: бэкенд `POST /users/verify-otp/`.
 *
 * Именно здесь бэкенд заводит пользователя (по телефону, имени и паролю из
 * записи OTP) и сразу отдаёт пару токенов. Кладём их в те же `httpOnly`
 * cookie, что и вход: наружу токен не уходит, иначе любая XSS унесла бы
 * только что открытый сеанс.
 *
 * Номер берём из ответа бэкенда, а не из тела запроса: по коду заявки он
 * может отличаться от того, что помнит браузер (нормализация, повторная
 * отправка), а в шапке должен стоять тот, под которым завели учётную запись.
 */
interface UpstreamVerifyOtp {
  access: string
  refresh: string
  user_id: string
  phone_number: string
  message: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ session?: string, code?: string }>(event)
  const session = String(body?.session ?? '')
  const code = String(body?.code ?? '')

  // Код у бэкенда шестизначный (`generate_otp_code`, `max_length=6`).
  if (!session || !/^\d{6}$/.test(code)) {
    throw createError({ statusCode: 422, statusMessage: 'Tasdiqlash kodi to\'liq emas' })
  }

  const tokens = await upstream<UpstreamVerifyOtp>(event, '/users/verify-otp/', {
    method: 'POST',
    // Поле кода у этого роута называется `otp`, а не `code`, — в отличие от
    // восстановления пароля, где оно `code`. Разводим прямо здесь.
    body: { session, otp: code },
  })

  openSession(event, tokens)

  // Имя бэкенд в ответе не возвращает (и при регистрации с сайта оно пустое) —
  // отдаём пустую строку. Придумывать нельзя: попадёт в шапку как чужое.
  return ok({ phone: tokens.phone_number, name: '' })
})
