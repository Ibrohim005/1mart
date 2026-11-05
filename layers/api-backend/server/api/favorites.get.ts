import type { ProductCard } from '#shared/types/catalog'
import type { UpstreamProduct } from '../utils/product'
import { productCard } from '../utils/product'

/**
 * Избранное покупателя.
 *
 * Бэкенд отдаёт его тем же сериализатором, что и каталог
 * (ShopProductListSerializer), поэтому перевод — обычный productCard, без
 * отдельной ветки.
 *
 * Про анонимов: вьюха закрыта `IsAuthenticated`, и общее для проекта
 * «мягкое» JWT тут НЕ маскирует отсутствие токена — SilentJWTAuthentication
 * молча делает запрос анонимным, а permission следом отвечает честным 401
 * (проверено на бою: GET /shop/favorites/ без токена → 401). Пропускаем его
 * наверх, а не подменяем пустым списком: пустое избранное и «вы не вошли» —
 * разные экраны, и подмена показывала бы гостю «здесь пока пусто» вместо
 * предложения войти.
 */
export default defineEventHandler(async (event) => {
  const locale = (getHeader(event, 'accept-language') || 'uz').split('-')[0]!

  // Одной страницей: на странице избранного нет пагинации — она рисует всё,
  // что пришло. Сто — потолок, дальше запрос уже тяжелее пользы; если у
  // покупателя избранного больше, хвост не покажется, и это заметно лучше,
  // чем тянуть весь список без ограничения.
  const response = await upstream<unknown>(event, '/shop/favorites/', {
    auth: true,
    query: { limit: 100, offset: 0 },
  })

  return ok<ProductCard[]>(
    items<UpstreamProduct>(response).map(product => productCard(product, locale)),
  )
})
