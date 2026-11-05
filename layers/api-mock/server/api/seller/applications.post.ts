/**
 * Заявка продавца с лендинга.
 *
 * Раньше форма не работала вообще: в `config.js` адрес отправки был пустым,
 * и любая заявка падала в «Не удалось отправить». Для лендинга, вся задача
 * которого — собирать заявки, это была главная мёртвая кнопка.
 *
 * Лендинг отдаётся этим же сервером, поэтому форма ходит на свой origin
 * и CORS не нужен. Бэкенду остаётся заменить обработчик на настоящий.
 *
 * TODO: Connect to backend endpoint POST /seller/applications
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name?: string
    phone?: string
    category?: string
    comment?: string
    lang?: string
    page?: string
  }>(event)

  const name = String(body?.name ?? '').trim()
  const digits = String(body?.phone ?? '').replace(/\D/g, '').replace(/^998/, '')

  if (name.length < 2) {
    throw createError({ statusCode: 422, statusMessage: 'Name is required' })
  }
  if (digits.length !== 9) {
    throw createError({ statusCode: 422, statusMessage: 'Phone is incomplete' })
  }

  return ok({
    id: `req-${Date.now().toString(36)}`,
    accepted: true,
    name,
    phone: `+998${digits}`,
    category: body?.category ?? null,
    comment: body?.comment ?? null,
    lang: body?.lang ?? 'ru',
  })
})
