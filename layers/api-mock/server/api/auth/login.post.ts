/**
 * Вход по телефону и паролю.
 *
 * Мок принимает любой корректный узбекский номер; пароль «0000» отвергается,
 * чтобы фронт умел показывать ошибку неверных данных, — иначе экран входа
 * невозможно проверить в состоянии отказа.
 *
 * TODO: Connect to backend endpoint POST /auth/login
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string, password?: string }>(event)
  const digits = String(body?.phone ?? '').replace(/\D/g, '').replace(/^998/, '')
  const password = String(body?.password ?? '')

  if (digits.length !== 9) {
    throw createError({ statusCode: 422, statusMessage: 'Phone is incomplete' })
  }
  if (password.length < 4 || password === '0000') {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  return ok({ phone: `+998 ${digits}`, name: 'Отакулов Ферузбек' })
})
