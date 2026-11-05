import { findOrderSeed, orderProducts } from '../../../utils/orders-state'
import { addToCart } from '../../../utils/cart-state'

/**
 * «Повторить заказ» — складывает позиции прошлого заказа в корзину.
 *
 * TODO: Connect to backend endpoint POST /orders/{id}/repeat
 */
export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const seed = findOrderSeed(event, id)

  if (!seed) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  const products = orderProducts(seed)
  for (const product of products) addToCart(event, Number(product.id) * 10 + 1, 1)

  return ok({ added: products.length })
})
