interface ToggleResult {
  status: 'added' | 'removed'
  is_favorited: boolean
  product_id: string
}

/**
 * Удаление из избранного — зеркало favorites.post.ts, там же и разобрано,
 * почему один toggle бэкенда приходится доводить до нужного состояния вторым
 * вызовом и какой остаточный риск при этом остаётся.
 *
 * Товар берём из ТЕЛА запроса, а не из пути: фронт зовёт
 * `api.delete('/favorites', { productId })` — тело у DELETE, вопреки тому, что
 * предполагал TODO в моке («DELETE /favorites/{productId}»). Роут по пути
 * сломал бы вызывающий код в корзине.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ productId?: string | number }>(event)
  const productId = String(body?.productId ?? '')

  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'productId majburiy' })
  }

  const toggle = () => upstream<ToggleResult>(event, '/shop/favorites/toggle/', {
    method: 'POST',
    auth: true,
    body: { product_id: productId },
  })

  let state = await toggle()
  if (state.is_favorited) state = await toggle()

  return ok({ productId, isFavorite: state.is_favorited })
})
