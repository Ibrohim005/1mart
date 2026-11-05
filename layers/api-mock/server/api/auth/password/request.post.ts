/**
 * Первый шаг восстановления пароля: заявка на код.
 *
 * Мок принимает любой корректный узбекский номер и отвечает длительностью
 * таймера — её показывает экран ввода кода. Номер, начинающийся на 00,
 * считается незарегистрированным: фронту нужен и этот сценарий.
 *
 * TODO: Connect to backend endpoint POST /auth/password/request
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string }>(event)
  const digits = String(body?.phone ?? '').replace(/\D/g, '').replace(/^998/, '')

  if (digits.length !== 9) {
    throw createError({ statusCode: 422, statusMessage: 'Phone is incomplete' })
  }
  if (digits.startsWith('00')) {
    throw createError({ statusCode: 404, statusMessage: 'Phone is not registered' })
  }

  return ok({ sent: true, resendAfter: 90 })
})
