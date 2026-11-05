import { isActive, orderSeeds } from '../utils/orders-state'
import { toOrderCard } from '../utils/orders-view'

/**
 * Список заказов покупателя.
 *
 * Вкладка приходила параметром и молча игнорировалась: на «Активных»
 * показывался доставленный заказ. Теперь фильтр действительно работает,
 * а ответ постраничный — иначе кабинет с сотней заказов нечем листать.
 *
 * TODO: Connect to backend endpoint GET /orders?status=active|all&page&perPage
 */
export default defineEventHandler((event) => {
  const query = getQuery(event) as Record<string, string>
  const tab = query.tab === 'all' ? 'all' : 'active'
  const page = Math.max(1, Number(query.page) || 1)
  const perPage = Math.min(50, Math.max(1, Number(query.perPage) || 10))

  const matched = orderSeeds(event)
    .filter(seed => (tab === 'all' ? true : isActive(seed.status)))
    // Свежие сверху
    .sort((a, b) => b.placedAt - a.placedAt)

  const start = (page - 1) * perPage

  return ok({
    items: matched.slice(start, start + perPage).map(seed => toOrderCard(event, seed)),
    total: matched.length,
    page,
    perPage,
  })
})
