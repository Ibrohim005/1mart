import type { OrderListItem, OrderStatusCode } from '#shared/types/merchant'
import { orders } from '../../../lib/db'
import { matches, paginate, readPaging } from '../../../lib/query'

/**
 * Список заказов: поиск по номеру и покупателю, фильтр по статусу, страницы.
 * TODO: Connect to backend endpoint GET /merchant/orders
 */
export default defineEventHandler((event) => {
  const q = getQuery(event)
  const { page, perPage } = readPaging(event)

  const list: OrderListItem[] = orders.filter((o) => {
    if (q.status && q.status !== 'all' && o.statusCode !== (q.status as OrderStatusCode)) return false
    return matches(`${o.number} ${o.customerName}`, q.q)
  })

  return ok(paginate(list, page, perPage))
})
