import type { CustomerListItem } from '#shared/types/merchant'
import { customers } from '../../../lib/db'
import { matches, paginate, readPaging } from '../../../lib/query'

/**
 * Список покупателей: поиск по имени, компании и телефону.
 * TODO: Connect to backend endpoint GET /merchant/customers
 */
export default defineEventHandler((event) => {
  const q = getQuery(event)
  const { page, perPage } = readPaging(event)

  const list: CustomerListItem[] = customers.filter(c =>
    matches(`${c.name} ${c.company ?? ''} ${c.phone}`, q.q),
  )

  return ok(paginate(list, page, perPage))
})
