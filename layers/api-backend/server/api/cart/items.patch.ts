import type { Id } from '#shared/types/catalog'
import { fetchCart, itemByVariant } from '../../utils/cart'

/**
 * Галочки на позициях корзины (и «выбрать всё» — приходит списком).
 *
 * У бэкенда это то же `PATCH /shop/cart/items/<uuid>/`, что и количество:
 * `CartItemQuantitySerializer` пишет и `quantity`, и `is_selected`.
 * Отдельной ручки «выделить пачкой» нет, поэтому шлём по запросу на строку —
 * параллельно, так как строки независимы.
 *
 * Отметка — не косметика: `POST /shop/checkout/` и `checkout/calculate/`
 * считают ТОЛЬКО отмеченное (`filter(is_selected=True)`), а checkout ещё и
 * удаляет из корзины именно его.
 */
export default defineEventHandler(async (event) => {
  requireCartOwner(event)
  const body = await readBody<{ skuIds?: Id[], selected?: boolean }>(event)

  const cart = await fetchCart(event)
  const targets = (body?.skuIds ?? [])
    .map(skuId => itemByVariant(cart, String(skuId)))
    .filter((item): item is NonNullable<typeof item> => item !== null)

  await Promise.all(targets.map(item => upstream(event, `/shop/cart/items/${item.id}/`, {
    method: 'PATCH',
    auth: true,
    body: { is_selected: Boolean(body?.selected) },
  })))

  return ok({ ok: true })
})
