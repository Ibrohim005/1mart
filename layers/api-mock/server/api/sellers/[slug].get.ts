import { isSellerShown, productsOfSeller, sellers } from '../../../mocks/data'

/**
 * Продавец и его товары. Макет «Все товары продавца» (5082:124919):
 * карточка продавца, полка его товаров, баннеры и подборка снизу.
 * TODO: Connect to backend endpoint GET /sellers/{slug}
 */
export default defineEventHandler((event) => {
  const slug = String(getRouterParam(event, 'slug') ?? '')
  const seller = sellers.find(item => item.slug === slug)

  // Скрытый от покупателей продавец для витрины не существует: та же 404, что и для неизвестного
  if (!seller || !isSellerShown(slug)) {
    throw createError({ statusCode: 404, statusMessage: 'Seller not found' })
  }

  const all = productsOfSeller(slug)
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const perPage = Math.max(1, Number(query.perPage) || all.length || 1)

  return ok({
    seller,
    products: all.slice((page - 1) * perPage, page * perPage),
    total: all.length,
  })
})
