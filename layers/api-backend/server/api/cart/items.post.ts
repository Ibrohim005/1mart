import type { Id } from '#shared/types/catalog'
import { fetchCart, summaryOf } from '../../utils/cart'

/**
 * Добавление в корзину — `POST /shop/cart/items/` (CartItemCreateAPIView).
 *
 * Бэкенд ПРИБАВЛЯЕТ количество к уже лежащему в корзине варианту
 * (`apps/shop/services/cart.py`: `item.quantity = F("quantity") + quantity`),
 * а не выставляет его. Фронтовый `addItem(skuId, n)` значит ровно «положить
 * ещё n штук», так что смысл совпадает и пересчитывать ничего не нужно.
 * Обратное — `PUT /cart/items` — это уже «сделать количество равным n», и
 * оно ходит другим путём (см. items.put.ts): отправь его сюда, и количество
 * молча удвоилось бы.
 *
 * Тело бэкенда — `{ variant, quantity }`, где `variant` это id варианта, то
 * есть то же самое, что фронт зовёт `skuId`.
 */
export default defineEventHandler(async (event) => {
  requireCartOwner(event)
  const body = await readBody<{ skuId?: Id, quantity?: number }>(event)

  const variant = String(body?.skuId ?? '')
  if (!variant) {
    throw createError({ statusCode: 400, statusMessage: 'Variant tanlanmagan' })
  }

  // У бэкенда `quantity` объявлен с min_value=1: ноль и минус он отвергнет
  // ошибкой валидации, а «добавить ноль штук» и так не имеет смысла.
  const quantity = Math.max(1, Math.floor(Number(body?.quantity ?? 1)) || 1)

  await upstream(event, '/shop/cart/items/', {
    method: 'POST',
    auth: true,
    body: { variant, quantity },
  })

  // Ответ на добавление — одна строка корзины, а фронту нужен весь счётчик,
  // поэтому сразу перечитываем корзину целиком.
  return ok(summaryOf(await fetchCart(event)))
})
