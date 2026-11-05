import type { ProductCard, Seller } from '#shared/types/catalog'
import type { UpstreamProduct } from '../../utils/product'
import { productCard, slugOf } from '../../utils/product'
import { paging } from '../../utils/paging'

/**
 * Витрина продавца — «все товары продавца».
 *
 * Что здесь в `slug`. Ссылку на эту страницу ставит только карточка продавца
 * на товаре (`PdpSellerCard` → `/seller/${product.seller.slug}`), а сам
 * `product.seller.slug` собирает `products/[slug].get.ts` из вложенного
 * `seller_info`, где slug'а нет вовсе — остаётся `id`, то есть **id магазина
 * (MyMarket)**. Значит роут адресуется UUID магазина, и всё ниже исходит из
 * этого.
 *
 * Почему НЕ `GET /market/store/<uuid:id>/`. Во-первых, `PublicStoreAPIView`
 * ищет магазин по `user_id` («keyed by the seller's user id»), а у нас id
 * самого магазина — этот адрес просто не сойдётся. Во-вторых, и это важнее,
 * его `PublicStoreSerializer` считает совсем другие числа: `rating` берётся с
 * `obj.user.rating`, а `reviews_count` — из `Review.objects.filter(
 * target_user=obj.user)`, то есть это оценки ПОЛЬЗОВАТЕЛЯ на доске
 * объявлений. На странице товара рядом стоит `ShopMarketCardSerializer` с
 * рейтингом по `ShopReview` магазина — и расходятся они не теоретически: у
 * Demo Market на бою карточка товара показывает 4.3 и 5531 отзыв магазина, а
 * /market/store/ по тому же продавцу отдаёт rating 0.0 и reviews_count 0.
 * Покупатель попадает сюда кнопкой «другие товары продавца» прямо с карточки
 * товара, и если на следующем экране у того же продавца рейтинг обнулился —
 * это выглядит как подлог. Поэтому на странице магазина показываем
 * МАГАЗИННЫЕ числа.
 *
 * Как тогда берём карточку. Единственный публичный источник
 * `ShopMarketCardSerializer` — вложенный `seller_info` в карточке товара.
 * Отсюда два запроса подряд: сначала товары продавца (они на странице и так
 * нужны), потом карточка любого из них ради `seller_info`. Цена — два
 * обращения к бэкенду, зато ни одного лишнего и ни одной чужой цифры.
 *
 * Продавец без активных товаров отдаётся как 404: показать «все товары
 * продавца» без товаров и без карточки всё равно нечем, а мок на неизвестном
 * продавце вёл себя так же.
 */
interface UpstreamSellerInfo {
  id: string
  title: string | null
  logo: string | null
  rating: number | null
  reviews_count: number | null
}

interface UpstreamDetail extends UpstreamProduct {
  seller_info?: UpstreamSellerInfo | null
}

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') ?? '')
  const locale = (getHeader(event, 'accept-language') || 'uz').split('-')[0]!
  // Витрина догружает товары кнопкой «Показать ещё»: номер и размер страницы приходят от неё
  const page = paging(getQuery(event) as Record<string, unknown>)

  // Неизвестный (или не-UUID) продавец: фильтр `seller` у бэкенда —
  // ModelChoiceFilter, и он отвечает 400 «To'g'ri tanlovni tanlang», а не
  // пустым списком. Для страницы это «нет такого продавца», то есть 404.
  const response = await upstream<unknown>(event, '/shop/products/', {
    query: { seller: slug, limit: page.limit, offset: page.offset },
  }).catch(() => {
    throw createError({ statusCode: 404, statusMessage: 'Sotuvchi topilmadi' })
  })

  const products = items<UpstreamProduct>(response)
  const first = products[0]
  if (!first) {
    throw createError({ statusCode: 404, statusMessage: 'Sotuvchi topilmadi' })
  }

  // Карточка магазина — из `seller_info` любого его товара. Если карточка
  // товара почему-то не открылась, страницу всё равно показываем: название
  // есть и в списке (`seller_title`), а рейтинг честнее обнулить, чем ронять
  // всю витрину из-за второго запроса.
  const detail = await upstream<UpstreamDetail>(event, `/shop/products/${slugOf(first, locale)}/`)
    .catch(() => null)
  const info = detail?.seller_info ?? null

  const seller: Seller = {
    id: info?.id ?? first.seller,
    // В адресе страницы лежит ровно то, чем её открыли, — им же и остаётся:
    // slug'а у магазина на бэкенде нет.
    slug,
    title: info?.title ?? first.seller_title ?? '',
    // Средняя оценка приходит несокращённой (4.306996926414754), а страница
    // печатает её как есть, без toFixed. Округляем до десятой — столько же
    // знаков было в моке и столько же показывает карточка продавца на товаре.
    rating: Math.round((info?.rating ?? 0) * 10) / 10,
    reviewsCount: info?.reviews_count ?? 0,
    ...(info?.logo ? { logo: info.logo } : {}),
  }

  return ok<{ seller: Seller, products: ProductCard[], total: number }>({
    seller,
    products: products.map(product => productCard(product, locale)),
    total: total(response, products.length),
  })
})
