import type { CompanyProfile } from '#shared/types/merchant'
import { company } from '../../lib/db'

/**
 * Сохранение профиля компании. Меняем только разрешённые поля — реквизиты
 * (ИНН, счёт) после проверки маркетплейсом правятся отдельной процедурой.
 * TODO: Connect to backend endpoint PUT /merchant/company
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<CompanyProfile>>(event)
  if (body.shopName !== undefined) company.shopName = String(body.shopName)
  if (body.director !== undefined) company.director = String(body.director)
  if (body.phone !== undefined) company.phone = String(body.phone)
  if (body.email !== undefined) company.email = String(body.email)
  if (body.logo !== undefined) company.logo = body.logo || null
  if (body.legalAddress !== undefined) company.legalAddress = String(body.legalAddress)
  return ok(company)
})
