import type { Id } from '#shared/types/catalog'
import { fetchCart, itemByVariant, summaryOf } from '../../utils/cart'

/**
 * Изменение количества — `PATCH /shop/cart/items/<uuid>/`
 * (CartItemDetailAPIView + CartItemQuantitySerializer).
 *
 * Здесь сходятся обе ловушки корзины сразу:
 *
 * 1. `PUT` во фронте значит «сделать количество равным n», а `POST`
 *    /shop/cart/items/ на бэкенде ПРИБАВЛЯЕТ. Поэтому «плюсик» в корзине
 *    обязан идти через PATCH, иначе 1 → 2 превратилось бы в 1 → 3.
 * 2. Адрес строки — `CartItem.id`, а фронт знает только id варианта. Читаем
 *    корзину и переводим одно в другое; иначе бэкенд отвечает 404.
 *
 * Ноль трактуем как удаление — так же, как мок: `quantity` на бэкенде
 * объявлен с min_value=1 и нулём его не обнулить.
 */
export default defineEventHandler(async (event) => {
  requireCartOwner(event)
  const body = await readBody<{ skuId?: Id, quantity?: number }>(event)

  const variant = String(body?.skuId ?? '')
  if (!variant) {
    throw createError({ statusCode: 400, statusMessage: 'Variant tanlanmagan' })
  }

  const quantity = Math.floor(Number(body?.quantity ?? 1)) || 0
  const item = itemByVariant(await fetchCart(event), variant)

  if (quantity <= 0) {
    if (item) await upstream(event, `/shop/cart/items/${item.id}/`, { method: 'DELETE', auth: true })
  }
  else if (item) {
    await upstream(event, `/shop/cart/items/${item.id}/`, {
      method: 'PATCH',
      auth: true,
      body: { quantity },
    })
  }
  else {
    // Варианта в корзине ещё нет: «сделать количество равным n» для пустой
    // строки — это и есть «положить n штук», и прибавлять не к чему.
    await upstream(event, '/shop/cart/items/', {
      method: 'POST',
      auth: true,
      body: { variant, quantity },
    })
  }

  return ok(summaryOf(await fetchCart(event)))
})
