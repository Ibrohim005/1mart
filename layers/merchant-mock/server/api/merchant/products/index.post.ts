import type { ProductDetail, ProductInput } from '#shared/types/merchant'
import { categories, products } from '../../../lib/db'
import { sum } from '../../../lib/money'

/**
 * Создание товара. Форма работает в сумах — переводим в тийины.
 * Новый товар уходит на модерацию, если продавец не сохранил его черновиком.
 * TODO: Connect to backend endpoint POST /merchant/products
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<ProductInput>(event)
  if (!body?.title || String(body.title).trim().length < 2)
    throw createError({ statusCode: 422, statusMessage: 'Title is required' })

  // Категория товара — всегда лист дерева; на всякий случай подстраховываемся
  // первой листовой (со своей ставкой комиссии), если id не нашёлся.
  const category = categories.find(c => c.id === body.categoryId)
    ?? categories.find(c => c.commissionRate > 0)!
  const id = `p-new-${Date.now().toString(36)}`
  const status = body.status === 'draft' ? 'draft' : 'moderation'

  // Цена и остаток: если есть варианты — берём минимальную цену и сумму остатков
  // по вариантам; иначе — из простых полей товара.
  const variants = Array.isArray(body.variants) ? body.variants : []
  const priceSum = variants.length
    ? Math.min(...variants.map(v => Number(v.price) || 0))
    : Number(body.price) || 0
  const stockTotal = variants.length
    ? variants.reduce((s, v) => s + (Number(v.stock) || 0), 0)
    : Number(body.stock) || 0

  const product: ProductDetail = {
    id,
    title: String(body.title).trim(),
    sku: body.sku || `TP-${9000 + products.length}`,
    image: body.images?.[0] ?? null,
    categoryId: category.id,
    categoryName: category.name,
    price: sum(priceSum),
    oldPrice: body.oldPrice ? sum(Number(body.oldPrice)) : null,
    stock: stockTotal,
    status,
    rating: 0,
    sold: 0,
    description: body.description ?? '',
    images: body.images ?? [],
    attributes: body.attributes ?? [],
    commissionRate: category.commissionRate,
    variants,
    minOrderQty: body.minOrderQty,
    vat: body.vat,
    weightKg: body.weightKg,
    lengthCm: body.lengthCm,
    widthCm: body.widthCm,
    heightCm: body.heightCm,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  products.unshift(product)
  category.productCount++
  return ok(product)
})
