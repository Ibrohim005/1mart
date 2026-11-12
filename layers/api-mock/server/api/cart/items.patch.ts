import { setSelected } from '../../utils/cart-state'

/**
 * Галочка на позиции корзины (и «Выбрать все» — приходит списком).
 * TODO: Connect to backend endpoint PATCH /cart/items/selection
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ skuIds?: number[], lineIds?: string[], selected: boolean }>(event)
  // Ключи строк точнее: у закупщика одна и та же бумага может быть в двух заявках
  setSelected(event, [...(body.lineIds ?? []), ...(body.skuIds ?? [])], body.selected)
  return ok({ ok: true })
})
