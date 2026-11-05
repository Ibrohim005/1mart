import { cartSummary, setQuantity } from '../../utils/cart-state'

/** Изменение количества сохраняется, чтобы корзина вела себя как настоящая */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ skuId: number, quantity: number }>(event)
  setQuantity(event, body.skuId, body.quantity ?? 1)
  return ok(cartSummary(event))
})
