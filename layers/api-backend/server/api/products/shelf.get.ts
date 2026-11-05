import type { ProductCard } from '#shared/types/catalog'
import type { UpstreamProduct } from '../../utils/product'
import { productCard } from '../../utils/product'

/**
 * Полки главной ложатся на сортировки каталога — у бэкенда они уже есть
 * ровно с этим смыслом:
 *
 *   discounts   → sort=wow_deal   (товары с активной скидкой)
 *   recommended → sort=recommended
 *   wow         → sort=most_liked  (отдельного признака «вау» у бэкенда нет)
 *
 * `ending_soon` выглядел точнее для скидок, но на бою он отдаёт НОЛЬ товаров:
 * он требует проставленной даты окончания скидки, а её никто не заполняет.
 * `wow_deal` фильтрует по факту скидки и отдаёт 51 товар — полка, которая
 * всегда пуста, хуже отсутствующей.
 *
 * Все три дополнительно сужают выдачу на самом бэкенде (остаток, активная
 * скидка), поэтому полка может оказаться пустой — это нормальный ответ,
 * компонент уже умеет её не рисовать.
 *
 * Альтернатива — GET /shop/campaigns/: там полки собраны руками в админке и
 * приходят вместе с товарами. Если «полка» в дизайне означает именно
 * подборку редакции, переключать надо туда.
 */
const SHELVES: Record<string, Record<string, unknown>> = {
  discounts: { sort: 'wow_deal' },
  recommended: { sort: 'recommended' },
  wow: { sort: 'most_liked' },
  similar: { sort: 'recommended' },
  bought_with: { sort: 'recommended' },
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as Record<string, unknown>
  const kind = String(query.kind ?? 'recommended')
  const limit = Math.min(50, Number(query.limit) || 12)
  const locale = (getHeader(event, 'accept-language') || 'uz').split('-')[0]!
  const productId = query.product_id ? String(query.product_id) : undefined

  const backendQuery: Record<string, unknown> = {
    ...(SHELVES[kind] ?? SHELVES.recommended),
    limit,
    offset: 0,
  }
  if (kind === 'similar' && productId) backendQuery.similar_to = productId
  if (kind === 'bought_with' && productId) backendQuery.bought_with = productId

  const response = await upstream<unknown>(event, '/shop/products/', {
    query: backendQuery,
  })

  return ok<ProductCard[]>(
    items<UpstreamProduct>(response).map(product => productCard(product, locale)),
  )
})
