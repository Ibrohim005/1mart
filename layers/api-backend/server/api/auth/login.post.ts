import { normalizePhone, openSession } from '../../utils/session'

/**
 * Вход по телефону и паролю: бэкенд `POST /users/login/`.
 *
 * Пара токенов кладётся в `httpOnly` cookie и наружу НЕ отдаётся. Раньше
 * фронт хранил сеанс в обычной cookie `zoo_auth`, читаемой из JS, — там
 * лежали только имя и телефон для отрисовки, и это было безопасно ровно
 * потому, что настоящего токена в ней не было. Access-токен по тому же
 * пути отдавать нельзя: любая XSS унесла бы сеанс целиком.
 *
 * Регистрации здесь нет намеренно: у бэкенда `send-otp` требует пароль и
 * отвергает уже зарегистрированный номер, то есть беспарольного входа для
 * существующего пользователя не существует. Сама регистрация — отдельная
 * пара роутов `register` + `verify`, а смена забытого пароля — `password/*`.
 */
interface UpstreamLogin {
  access: string
  refresh: string
  user_id: string
  phone_number: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string, password?: string }>(event)
  const phone = normalizePhone(String(body?.phone ?? ''))
  const password = String(body?.password ?? '')

  if (phone.length !== 13 || !password) {
    throw createError({ statusCode: 422, statusMessage: 'Telefon yoki parol to\'liq emas' })
  }

  const tokens = await upstream<UpstreamLogin>(event, '/users/login/', {
    method: 'POST',
    body: { phone_number: phone, password },
  })

  openSession(event, tokens)

  // Имени в ответе логина нет — фронт покажет телефон, пока не подтянет
  // профиль. Придумывать имя здесь нельзя: оно попадёт в шапку как чужое.
  return ok({ phone: tokens.phone_number, name: '' })
})
