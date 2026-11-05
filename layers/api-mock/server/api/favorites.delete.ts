import { favoriteItems, removeFavorite } from '../utils/favorites-state'

/**
 * Удаление из избранного.
 * TODO: Connect to backend endpoint DELETE /favorites/{productId}
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ productId: number }>(event)
  removeFavorite(event, body.productId)
  return ok({ count: favoriteItems(event).length })
})
