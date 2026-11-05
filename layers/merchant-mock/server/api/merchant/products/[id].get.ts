import { getProductDetail } from '../../../lib/db'

/**
 * Карточка товара.
 * TODO: Connect to backend endpoint GET /merchant/products/{id}
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')!
  const product = getProductDetail(id)
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  return ok(product)
})
