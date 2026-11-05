import { normalizePhone } from '../../../utils/session'

/**
 * Восстановление пароля, шаг 1 — заявка на код:
 * бэкенд `POST /users/forgot-password/request/`.
 *
 * Отдельная от регистрации ветка именно потому, что `send-otp` отвергает
 * уже зарегистрированный номер, а здесь всё наоборот: незарегистрированный
 * номер — ошибка («Bu telefon raqam bilan ro'yxatdan o'tgan foydalanuvchi
 * topilmadi»). Её текст показывает диалог: молча перекидывать на
 * регистрацию нельзя — тем же 400 отвечают и другие отказы (лимит частоты).
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string }>(event)
  const phone = normalizePhone(String(body?.phone ?? ''))

  if (phone.length !== 13) {
    throw createError({ statusCode: 422, statusMessage: 'Telefon raqami to\'liq emas' })
  }

  // Ответ бэкенда — только текст «код отправлен» (`detail`); срока до
  // повторной отправки он не сообщает, поэтому наружу отдаём сам факт.
  await upstream(event, '/users/forgot-password/request/', {
    method: 'POST',
    body: { phone_number: phone },
  })

  return ok({ sent: true })
})
