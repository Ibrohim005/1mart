import { emptyCart, fetchCart, toCart } from '../../utils/cart'

/**
 * Корзина покупателя — `GET /shop/cart/` (CartAPIView + CartSerializer).
 *
 * Работает и без входа: бэкенд держит гостевую корзину по `X-Install-Id`
 * (`Cart.install_id`), а на входе сливает её с корзиной пользователя. Сам
 * заголовок фронт слал всегда — `upstream()` теперь его пробрасывает.
 *
 * Если нет НИ сеанса, НИ идентификатора устройства — корзина пуста, и это
 * не ошибка: идентификатор заводится в браузере, поэтому самый первый заход
 * рисуется на сервере без него. См. `emptyCart()`. На запись правило
 * обратное и строгое — там `requireCartOwner`.
 */
export default defineEventHandler(async (event) => {
  if (!hasCartOwner(event)) return ok(emptyCart())
  return ok(toCart(await fetchCart(event)))
})
