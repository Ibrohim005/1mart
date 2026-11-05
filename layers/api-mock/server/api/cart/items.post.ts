import { addToCart, cartSummary } from '../../utils/cart-state'

/** Добавление товара увеличивает количество в корзине этого посетителя */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ skuId: number, quantity: number }>(event)
  addToCart(event, body.skuId, body.quantity ?? 1)
  return ok(cartSummary(event))
})
