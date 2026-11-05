import type { MerchantUser } from '#shared/types/merchant'
import { company } from '../../../lib/db'

/**
 * Вход в кабинет продавца. В моках принимаем любой телефон и пароль от 4 знаков
 * и возвращаем владельца демо-магазина. Настоящий бэкенд обменяет пару на токены
 * и поставит httpOnly-cookie — формат ответа (MerchantUser) не изменится.
 * TODO: Connect to backend endpoint POST /merchant/auth/login
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string, password?: string }>(event)
  const phone = String(body?.phone ?? '').replace(/\D/g, '')
  const password = String(body?.password ?? '')

  if (phone.length < 9)
    throw createError({ statusCode: 422, statusMessage: 'Введите корректный номер телефона' })
  if (password.length < 4)
    throw createError({ statusCode: 422, statusMessage: 'Пароль слишком короткий' })

  const user: MerchantUser = {
    id: 'emp-1',
    name: 'Azizov Sardor',
    phone: `+998${phone.replace(/^998/, '')}`,
    email: company.email,
    role: 'owner',
    company: { id: company.id, shopName: company.shopName, status: company.status },
  }
  return ok(user)
})
