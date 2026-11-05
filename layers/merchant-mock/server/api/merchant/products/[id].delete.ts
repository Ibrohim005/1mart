import { ok } from '../../../utils/response'
import { allProductDetails, products } from '../../../lib/db'

/**
 * Архивирование/удаление товара из списка продавца.
 * TODO: Connect to backend endpoint DELETE /merchant/products/{id}
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')!
  const idx = products.findIndex(p => p.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  products.splice(idx, 1)
  allProductDetails.delete(id)
  return ok({ id, deleted: true })
})
