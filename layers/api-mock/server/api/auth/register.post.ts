/**
 * Регистрация, шаг 1: заявка на код из SMS.
 *
 * Мок принимает любой корректный узбекский номер; номер, начинающийся на 99,
 * считается уже занятым — фронту нужен и этот сценарий, иначе сообщение
 * «такой номер уже зарегистрирован» нечем проверить. (В восстановлении
 * пароля сторож обратный: там «незарегистрированным» считается номер на 00.)
 *
 * Заявку мок держит не в памяти, а прямо в её идентификаторе: сервер моков
 * перезапускается на каждом изменении файла, и хранилище в переменной
 * потеряло бы наполовину пройденную регистрацию. Шаг подтверждения достаёт
 * номер обратно из этой же строки.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string, password?: string }>(event)
  const digits = String(body?.phone ?? '').replace(/\D/g, '').replace(/^998/, '')
  const password = String(body?.password ?? '')

  if (digits.length !== 9) {
    throw createError({ statusCode: 422, statusMessage: 'Phone is incomplete' })
  }
  if (!password) {
    throw createError({ statusCode: 422, statusMessage: 'Password is required' })
  }
  if (digits.startsWith('99')) {
    throw createError({ statusCode: 400, statusMessage: 'Phone is already registered' })
  }

  return ok({
    session: `mock-${digits}`,
    message: 'Tasdiqlash kodi SMS orqali yuborildi.',
    phone: `+998${digits}`,
  })
})
