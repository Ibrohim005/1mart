import { cartSummary, removeFromCart } from '../../utils/cart-state'

/**
 * Удаление позиции из корзины.
 * TODO: Connect to backend endpoint DELETE /cart/items/{skuId}
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ skuId: number }>(event)
  removeFromCart(event, body.skuId)
  return ok(cartSummary(event))
})
