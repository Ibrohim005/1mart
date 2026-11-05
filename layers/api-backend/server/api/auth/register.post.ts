import { normalizePhone } from '../../utils/session'

/**
 * Регистрация, шаг 1 — заявка на код: бэкенд `POST /users/send-otp/`.
 *
 * У бэкенда это именно РЕГИСТРАЦИЯ, а не «вход по коду»: сериализатор
 * требует пароль и отвергает уже зарегистрированный номер
 * (`SendOtpSerializer.validate_phone_number`). Поэтому пароль спрашивается
 * здесь, на первом шаге, а не после подтверждения кода: бэкенд хеширует и
 * кладёт его в запись OTP, а пользователя заводит уже `verify-otp`. До
 * подтверждения кода пользователя в базе нет вовсе.
 *
 * Восстановление пароля через этот путь пройти не может (номер занят) —
 * у него свои три роута `/auth/password/*`.
 */
interface UpstreamSendOtp {
  /** UUID заявки; его же ждёт шаг подтверждения. */
  session: string
  message: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string, password?: string, name?: string }>(event)
  const phone = normalizePhone(String(body?.phone ?? ''))
  const password = String(body?.password ?? '')

  if (phone.length !== 13 || !password) {
    throw createError({ statusCode: 422, statusMessage: 'Telefon yoki parol to\'liq emas' })
  }

  const sent = await upstream<UpstreamSendOtp>(event, '/users/send-otp/', {
    method: 'POST',
    // `full_name` у бэкенда необязателен (`allow_blank`, default ""), а экран
    // регистрации имени не спрашивает — шлём пустую строку, а не выдуманное.
    // В шапке имени после регистрации не будет, пока его не заполнит профиль.
    body: { phone_number: phone, full_name: String(body?.name ?? ''), password },
  })

  // `message` — текст «код отправлен по SMS/в Telegram» от самого бэкенда:
  // канал выбирает он (Eskiz → Telegram), и угадывать его здесь нельзя.
  // Длительности блокировки повторной отправки бэкенд не сообщает вовсе —
  // обратный отсчёт на экране кода остаётся своим, фронтовым.
  return ok({ session: sent.session, message: sent.message, phone })
})
