import { visibleCards } from '../../utils/org-input'

/** Полки главной: скидки недели, рекомендуем, wow-выгода */
export default defineEventHandler((event) => {
  // Сотрудник ищет только в открытых ему категориях
  const cards = visibleCards(event)
  const { kind = 'recommended', limit = '10', product_id: productId } = getQuery(event) as Record<string, string>
  const size = Number(limit)

  // B2B: офисные товары на полках идут первыми. Настоящий бэкенд подберёт порядок
  // по ОКЭД компании покупателя; мок просто ставит офис вперёд.
  const office = (p: typeof cards[number]) => p.facets?.categorySlug === 'ofis-i-kancelyariya'
  const officeFirst = (list: typeof cards) => [...list.filter(office), ...list.filter(p => !office(p))]

  const discounted = officeFirst(cards.filter(p => p.discountPercent !== null))
  // Полки стоят на одной странице: хиты не должны повторять первые строки скидок,
  // а новинки (скидки с конца) — первые строки тоже. Главная берёт по 4 карточки.
  const inDiscounts = new Set(discounted.slice(0, 4).map(p => p.id))
  const wow = officeFirst(discounted.filter(p => !inDiscounts.has(p.id)).reverse())
  const onShelves = new Set([...inDiscounts, ...wow.slice(0, 4).map(p => p.id)])

  const current = cards.find(p => String(p.id) === productId)
  const others = cards.filter(p => p.id !== current?.id)
  // Похожие из той же подкатегории; с этим покупают из той же категории, но другого вида.
  const similar = others.filter(p => p.facets?.subcategorySlug === current?.facets?.subcategorySlug)
  const boughtWith = others.filter(p => p.facets?.categorySlug === current?.facets?.categorySlug && p.facets?.subcategorySlug !== current?.facets?.subcategorySlug)

  const byKind: Record<string, typeof cards> = {
    similar,
    bought_with: boughtWith,
    discounts: discounted,
    recommended: officeFirst(cards
      .filter(p => !onShelves.has(p.id))
      .sort((a, b) => b.ordersCount - a.ordersCount)),
    wow,
  }

  const items = (byKind[kind] ?? cards).slice(0, size)

  // В макете у карточек «Скидок недели» бейдж процента скрыт —
  // там показывается только плашка «Стало дешевле».
  if (kind === 'discounts') {
    return ok(items.map(item => ({ ...item, discountPercent: null })))
  }

  return ok(items)
})
