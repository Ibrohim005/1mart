import type { MerchantUser } from '#shared/types/merchant'
import { company } from '../../../lib/db'

/**
 * Текущая сессия. Кабинет рисует вошедшего из cookie, но эндпоинт нужен
 * бэкенду для серверной проверки сеанса.
 * TODO: Connect to backend endpoint GET /merchant/auth/session
 */
export default defineEventHandler(() => {
  const user: MerchantUser = {
    id: 'emp-1',
    name: 'Azizov Sardor',
    phone: company.phone,
    email: company.email,
    role: 'owner',
    company: { id: company.id, shopName: company.shopName, status: company.status },
  }
  return ok(user)
})
