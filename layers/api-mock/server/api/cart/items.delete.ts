import { cartSummary, removeFromCart } from '../../utils/cart-state'

/**
 * Удаление позиции из корзины.
 * TODO: Connect to backend endpoint DELETE /cart/items/{skuId}
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ skuId: number, lineId?: string }>(event)
  // lineId — строка чужой заявки (её убирает закупщик); без него — своя строка с этим SKU
  removeFromCart(event, body.lineId ?? body.skuId)
  return ok(cartSummary(event))
})
