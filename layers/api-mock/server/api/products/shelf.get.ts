import { productCards } from '../../../mocks/data'

/** Полки главной: скидки недели, рекомендуем, wow-выгода */
export default defineEventHandler((event) => {
  const { kind = 'recommended', limit = '10', product_id: productId } = getQuery(event) as Record<string, string>
  const size = Number(limit)

  const discounted = productCards.filter(p => p.discountPercent !== null)
  // Полки стоят на одной странице: хиты не должны повторять первые строки скидок.
  const inDiscounts = new Set(discounted.slice(0, 5).map(p => p.id))

  const current = productCards.find(p => String(p.id) === productId)
  const others = productCards.filter(p => p.id !== current?.id)
  // Похожие из той же подкатегории; с этим покупают из той же категории, но другого вида.
  const similar = others.filter(p => p.facets?.subcategorySlug === current?.facets?.subcategorySlug)
  const boughtWith = others.filter(p => p.facets?.categorySlug === current?.facets?.categorySlug && p.facets?.subcategorySlug !== current?.facets?.subcategorySlug)

  const byKind: Record<string, typeof productCards> = {
    similar,
    bought_with: boughtWith,
    discounts: discounted,
    recommended: productCards
      .filter(p => !inDiscounts.has(p.id))
      .sort((a, b) => b.ordersCount - a.ordersCount),
    wow: discounted.slice().reverse(),
  }

  const items = (byKind[kind] ?? productCards).slice(0, size)

  // В макете у карточек «Скидок недели» бейдж процента скрыт —
  // там показывается только плашка «Стало дешевле».
  if (kind === 'discounts') {
    return ok(items.map(item => ({ ...item, discountPercent: null })))
  }

  return ok(items)
})
