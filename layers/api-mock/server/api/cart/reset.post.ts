import { resetCart } from '../../utils/cart-state'
import { resetFavorites } from '../../utils/favorites-state'

/** Сброс состояния мок-корзины — нужен автотестам, чтобы они не влияли друг на друга. */
export default defineEventHandler((event) => {
  // Только в разработке: на проде этот адрес обнулял бы корзину всем сразу
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  resetCart(event)
  resetFavorites(event)
  return ok({ reset: true })
})
