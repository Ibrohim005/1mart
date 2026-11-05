import { reviews } from '../../../../lib/db'

/**
 * Ответ продавца на отзыв. Повторная отправка заменяет ответ, пустой текст его удаляет.
 * TODO: Connect to backend endpoint POST /merchant/reviews/{id}/reply
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const review = reviews.find(item => item.id === id)
  if (!review) throw createError({ statusCode: 404, statusMessage: 'Review not found' })

  const body = await readBody<{ text?: string }>(event)
  const text = String(body?.text ?? '').trim()
  review.reply = text ? { text, createdAt: new Date().toISOString() } : null

  return ok(review)
})
