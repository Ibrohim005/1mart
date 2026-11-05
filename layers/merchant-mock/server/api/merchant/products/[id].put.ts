import type { ProductInput } from '#shared/types/merchant'
import { allProductDetails, categories, getProductDetail, products } from '../../../lib/db'
import { sum } from '../../../lib/money'

/**
 * Редактирование товара.
 * TODO: Connect to backend endpoint PUT /merchant/products/{id}
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const detail = getProductDetail(id)
  const listItem = products.find(p => p.id === id)
  if (!detail || !listItem) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

  const body = await readBody<Partial<ProductInput>>(event)
  if (body.title !== undefined) listItem.title = detail.title = String(body.title)
  if (body.sku !== undefined) listItem.sku = detail.sku = String(body.sku)
  if (body.price !== undefined) listItem.price = detail.price = sum(Number(body.price))
  if (body.oldPrice !== undefined) listItem.oldPrice = detail.oldPrice = body.oldPrice ? sum(Number(body.oldPrice)) : null
  if (body.stock !== undefined) listItem.stock = detail.stock = Number(body.stock)
  if (body.status !== undefined) listItem.status = detail.status = body.status
  if (body.description !== undefined) detail.description = String(body.description)
  if (body.attributes !== undefined) detail.attributes = body.attributes
  if (body.categoryId !== undefined) {
    const category = categories.find(c => c.id === body.categoryId)
    if (category) {
      listItem.categoryId = detail.categoryId = category.id
      listItem.categoryName = detail.categoryName = category.name
    }
  }
  if (body.images !== undefined) {
    detail.images = body.images
    listItem.image = body.images[0] ?? null
  }
  // Если пришли варианты — цена/остаток считаются по ним (минимум/сумма),
  // перекрывая простые поля.
  const variants = Array.isArray(body.variants) ? body.variants : []
  if (variants.length) {
    listItem.price = detail.price = sum(Math.min(...variants.map(v => Number(v.price) || 0)))
    listItem.stock = detail.stock = variants.reduce((s, v) => s + (Number(v.stock) || 0), 0)
  }
for (const key of ['minOrderQty', 'vat', 'weightKg', 'lengthCm', 'widthCm', 'heightCm'] as const) {
    if (body[key] !== undefined) (detail as unknown as Record<string, unknown>)[key] = body[key]
  }
  if (Array.isArray(body.variants)) detail.variants = body.variants
  detail.updatedAt = new Date().toISOString()
  allProductDetails.set(id, detail)
  return ok(detail)
})
