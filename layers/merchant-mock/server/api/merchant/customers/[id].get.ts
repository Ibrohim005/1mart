import { getCustomerDetail } from '../../../lib/db'

/**
 * Карточка покупателя с его средним чеком и последними заказами.
 * TODO: Connect to backend endpoint GET /merchant/customers/{id}
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')!
  const customer = getCustomerDetail(id)
  if (!customer) throw createError({ statusCode: 404, statusMessage: 'Customer not found' })
  return ok(customer)
})
