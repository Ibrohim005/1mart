import { addFavorite, favoriteItems } from '../utils/favorites-state'

/**
 * Добавление в избранное.
 * TODO: Connect to backend endpoint POST /favorites { productId }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ productId: number }>(event)
  addFavorite(event, body.productId)
  return ok({ count: favoriteItems(event).length })
})
