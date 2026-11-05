import type { ProductListItem, ProductStatus } from '#shared/types/merchant'
import { products } from '../../../lib/db'
import { matches, paginate, readPaging } from '../../../lib/query'

const STATUSES: ProductStatus[] = ['active', 'draft', 'moderation', 'archived', 'rejected']

/**
 * Список товаров: поиск по названию/артикулу, фильтр по статусу и категории,
 * сортировка, постраничный вывод. Дополнительно отдаём число товаров по каждому
 * статусу (для вкладок-фильтров) — считается по набору без фильтра по статусу,
 * но с учётом поиска и категории.
 * TODO: Connect to backend endpoint GET /merchant/products
 */
export default defineEventHandler((event) => {
  const q = getQuery(event)
  const { page, perPage } = readPaging(event)

  const base = products.filter((p) => {
    if (q.categoryId && q.categoryId !== 'all' && p.categoryId !== q.categoryId) return false
    return matches(`${p.title} ${p.sku}`, q.q)
  })

  const statusCounts: Record<string, number> = { all: base.length }
  for (const s of STATUSES) statusCounts[s] = base.filter(p => p.status === s).length

  let list = base.filter(p => !q.status || q.status === 'all' || p.status === (q.status as ProductStatus))

  switch (q.sort) {
    case 'priceAsc': list = [...list].sort((a, b) => a.price.amount - b.price.amount); break
    case 'priceDesc': list = [...list].sort((a, b) => b.price.amount - a.price.amount); break
    case 'stock': list = [...list].sort((a, b) => a.stock - b.stock); break
    case 'sold': list = [...list].sort((a, b) => b.sold - a.sold); break
    default: break
  }

  return ok({ ...paginate(list, page, perPage), statusCounts })
})
