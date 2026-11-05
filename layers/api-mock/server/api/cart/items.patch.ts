import { setSelected } from '../../utils/cart-state'

/**
 * Галочка на позиции корзины (и «Выбрать все» — приходит списком).
 * TODO: Connect to backend endpoint PATCH /cart/items/selection
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ skuIds: number[], selected: boolean }>(event)
  setSelected(event, body.skuIds ?? [], body.selected)
  return ok({ ok: true })
})
