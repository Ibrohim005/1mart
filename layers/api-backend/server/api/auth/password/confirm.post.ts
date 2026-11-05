import { normalizePhone, openSession } from '../../../utils/session'

/**
 * Восстановление пароля, шаг 3 — новый пароль:
 * бэкенд `POST /users/forgot-password/confirm/`.
 *
 * Пароль уходит дважды (`new_password` + `confirm_password`), потому что
 * бэкенд сверяет их сам. Повтор пользователь уже вводил в диалоге, и оттуда
 * приходит одно значение — подставлять его в оба поля честно: расхождение
 * поймано раньше, на экране.
 *
 * Токенов этот роут не возвращает, а после смены пароля пользователь должен
 * оказаться внутри — иначе фронт нарисовал бы вошедшего без сеанса, и первый
 * же запрос за личными данными получил бы 401. Поэтому сразу после успеха
 * делаем настоящий вход тем паролем, который пользователь только что задал.
 * Это не «поддельный» сеанс: те же `/users/login/` и та же пара токенов.
 *
 * Если вход всё-таки не удался — пароль уже сменён, и врать про это нельзя:
 * отдаём `signedIn: false`, и фронт открывает обычный диалог входа.
 */
interface UpstreamLogin {
  access: string
  refresh: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string, resetToken?: string, password?: string }>(event)
  const phone = normalizePhone(String(body?.phone ?? ''))
  const resetToken = String(body?.resetToken ?? '')
  const password = String(body?.password ?? '')

  // Минимум 8 символов — требование бэкенда (`min_length=8` у обоих полей).
  if (!resetToken || password.length < 8) {
    throw createError({ statusCode: 422, statusMessage: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak' })
  }

  await upstream(event, '/users/forgot-password/confirm/', {
    method: 'POST',
    body: { reset_token: resetToken, new_password: password, confirm_password: password },
  })

  let signedIn = false
  if (phone.length === 13) {
    try {
      const tokens = await upstream<UpstreamLogin>(event, '/users/login/', {
        method: 'POST',
        body: { phone_number: phone, password },
      })
      openSession(event, tokens)
      signedIn = true
    }
    catch {
      // Пароль сменён — это главное; сеанс пользователь откроет входом.
    }
  }

  return ok({ changed: true, signedIn, phone })
})
