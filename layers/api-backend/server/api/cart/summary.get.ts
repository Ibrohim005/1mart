import { fetchCart, summaryOf } from '../../utils/cart'

/**
 * Счётчик в шапке. Отдельного «лёгкого» эндпоинта у бэкенда нет, поэтому
 * берём ту же `GET /shop/cart/`, что и сама корзина, — так бейдж и содержимое
 * гарантированно не расходятся.
 *
 * `POST /shop/checkout/calculate/` сюда не годится принципиально: он не
 * считает штуки вовсе и отвечает 400 «Savatda tanlangan mahsulot yo'q»,
 * когда ничего не отмечено, — то есть на пустой корзине упал бы на каждой
 * странице сайта.
 */
export default defineEventHandler(async (event) => {
  // Бейдж в шапке рисуется на КАЖДОЙ странице, в том числе на первой,
  // серверной, когда идентификатора устройства ещё нет. Ноль — верный ответ.
  if (!hasCartOwner(event)) return ok(summaryOf(null))
  return ok(summaryOf(await fetchCart(event)))
})
