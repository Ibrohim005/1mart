import { reviews } from '../../../lib/db'
import { paginate, readPaging } from '../../../lib/query'

/**
 * Отзывы о товарах продавца: сначала новые, можно отобрать те, что ждут ответа.
 * TODO: Connect to backend endpoint GET /merchant/reviews
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const status = String(query.status ?? 'all')
  const rating = Number(query.rating) || 0
  const needle = String(query.q ?? '').trim().toLowerCase()
  const { page, perPage } = readPaging(event)

  const matched = reviews
    .filter(item => !rating || item.rating === rating)
    .filter(item => !needle || `${item.productTitle} ${item.author} ${item.text}`.toLowerCase().includes(needle))

  const items = matched.filter((item) => {
    if (status === 'unanswered') return !item.reply
    if (status === 'answered') return !!item.reply
    return true
  })

  const average = reviews.length
    ? Math.round((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length) * 10) / 10
    : 0

  return ok({
    ...paginate(items, page, perPage),
    counts: {
      all: matched.length,
      unanswered: matched.filter(item => !item.reply).length,
      answered: matched.filter(item => !!item.reply).length,
    },
    average,
    totalReviews: reviews.length,
  })
})
