import { findProduct } from '../../../mocks/data'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')!
  const product = findProduct(slug)

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Товар не найден' })
  }

  return ok(product)
})
