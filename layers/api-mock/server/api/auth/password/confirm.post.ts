/**
 * Третий шаг восстановления: новый пароль по токену со шага с кодом.
 *
 * Код сюда больше не приходит: его проверяет `password/verify` и выдаёт
 * `reset_token` — так устроен бэкенд, и мок повторяет его порядок, иначе
 * фронт пришлось бы ветвить по режиму. Минимум в 8 символов тоже взят
 * оттуда (`min_length=8`), чтобы короткий пароль отвергался одинаково.
 *
 * `signedIn` показывает, открыт ли сеанс: у бэкенда смена пароля токенов не
 * возвращает, и он входит отдельным вызовом, который может не удаться. В
 * моке входить нечем и незачем — сеанс считается открытым.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string, resetToken?: string, password?: string }>(event)
  const resetToken = String(body?.resetToken ?? '')
  const password = String(body?.password ?? '')

  if (!resetToken.startsWith('mock-reset-')) {
    throw createError({ statusCode: 400, statusMessage: 'Token is invalid or expired' })
  }
  if (password.length < 8) {
    throw createError({ statusCode: 422, statusMessage: 'Password is too short' })
  }

  return ok({ changed: true, signedIn: true, phone: String(body?.phone ?? '') })
})
