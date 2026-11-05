/**
 * Второй шаг восстановления: код из SMS.
 *
 * Код проверяется здесь, а не вместе с новым паролем, — так же, как у
 * бэкенда: он меняет пароль не по коду, а по `reset_token`, который выдаёт
 * ровно на этом шаге. Код шестизначный; «000000» отвергается, чтобы фронт
 * умел показывать ошибку неверного кода.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string, code?: string }>(event)
  const digits = String(body?.phone ?? '').replace(/\D/g, '').replace(/^998/, '')
  const code = String(body?.code ?? '')

  if (digits.length !== 9) {
    throw createError({ statusCode: 422, statusMessage: 'Phone is incomplete' })
  }
  if (!/^\d{6}$/.test(code) || code === '000000') {
    throw createError({ statusCode: 400, statusMessage: 'Code is invalid' })
  }

  return ok({ resetToken: `mock-reset-${digits}` })
})
