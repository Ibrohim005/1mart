import type { SellerApplication } from '#shared/types/merchant'

/**
 * Заявка на подключение продавца с лендинга. Собирает контакт и профиль
 * бизнеса; настоящий бэкенд заведёт лид и запустит проверку компании.
 * TODO: Connect to backend endpoint POST /merchant/applications
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<SellerApplication>>(event)
  const name = String(body?.name ?? '').trim()
  const digits = String(body?.phone ?? '').replace(/\D/g, '').replace(/^998/, '')
  const shopName = String(body?.shopName ?? '').trim()

  if (name.length < 2)
    throw createError({ statusCode: 422, statusMessage: 'Укажите имя' })
  if (digits.length !== 9)
    throw createError({ statusCode: 422, statusMessage: 'Проверьте номер телефона' })
  if (shopName.length < 2)
    throw createError({ statusCode: 422, statusMessage: 'Укажите название магазина' })

  return ok({
    id: `app-${Date.now().toString(36)}`,
    accepted: true,
    name,
    phone: `+998${digits}`,
    shopName,
    legalForm: body?.legalForm ?? 'llc',
    category: body?.category ?? null,
  })
})
