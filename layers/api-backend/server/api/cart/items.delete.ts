import type { Id } from '#shared/types/catalog'
import { fetchCart, itemByVariant, summaryOf } from '../../utils/cart'

/**
 * Удаление позиции — `DELETE /shop/cart/items/<uuid>/`.
 *
 * Адрес снова по `CartItem.id`, а фронт присылает id варианта, поэтому
 * сначала читаем корзину и переводим. Строки уже нет — молча отвечаем
 * текущим счётчиком: удаление обязано быть идемпотентным, иначе повтор
 * запроса (двойной клик, ретрай после таймаута) показывал бы ошибку там,
 * где всё в порядке.
 */
export default defineEventHandler(async (event) => {
  requireCartOwner(event)
  const body = await readBody<{ skuId?: Id }>(event)

  const variant = String(body?.skuId ?? '')
  const item = variant ? itemByVariant(await fetchCart(event), variant) : null
  if (item) await upstream(event, `/shop/cart/items/${item.id}/`, { method: 'DELETE', auth: true })

  return ok(summaryOf(await fetchCart(event)))
})
