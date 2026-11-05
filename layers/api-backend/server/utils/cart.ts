import type { Cart, CartItem } from '#shared/types/cart'
import { discountPercent, installmentPerMonth, money } from '../lib/money'

/**
 * Корзина zoo-backend (`GET /shop/cart/`, CartSerializer) в том виде, который
 * рисует фронт.
 *
 * Две вещи здесь расходятся с контрактом фронта, и обе важны:
 *
 * 1. `skuId` — это id ВАРИАНТА (`ShopProductVariant`), а не строки корзины.
 *    Фронт кладёт в корзину `sku.id` с карточки товара и тем же значением
 *    потом меняет количество, поэтому ключом строки обязан остаться вариант.
 *    Бэкенд же адресует строку по `CartItem.id` — это РАЗНЫЕ UUID, и
 *    перевод одного в другой делает `itemByVariant()` ниже.
 *
 * 2. Ссылку на сам ТОВАР `CartItemSerializer` отдаёт неполно. Есть
 *    `product_id`, `product_slug`, `product_image` и `seller` — их хватает,
 *    чтобы нарисовать строку, сгруппировать её по магазину и увести на
 *    карточку. Нет галереи, рейтинга товара и числа отзывов — это уезжает
 *    пустым: выдумывать «4.9 и 320 отзывов» тут нельзя.
 *
 *    Поля товара помечены необязательными не для красоты: развёрнутый
 *    бэкенд может быть старше и не отдавать их вовсе. Тогда строка честно
 *    остаётся без картинки и ссылки, вместо того чтобы подставить id
 *    варианта вместо id товара и увести «в избранное» не тот товар.
 */
export interface UpstreamCartVariant {
  id: string
  attributes: Record<string, string> | null
  sku: string | null
  price: string
  currency: string
  stock: number
  discount_price: string | null
  is_active: boolean
  effective_price: string
  is_discount_active: boolean
  discount_percent: number | null
  is_low_stock: boolean
  swatch_image: string | null
}

export interface UpstreamCartItem {
  id: string
  variant: UpstreamCartVariant
  product_name: string
  product_id?: string | null
  product_slug?: string | null
  product_image?: string | null
  seller?: { id: string, title: string, slug: string } | null
  quantity: number
  is_selected: boolean
  line_total: string
  is_available: boolean
  available_stock: number
  badges: Array<{ key?: string, label?: string, tone?: string }>
  free_delivery_until: string | null
}

export interface UpstreamCartGroup {
  delivery_type: string
  label: string
  items: UpstreamCartItem[]
  subtotal: string
  estimated_delivery_date: string | null
}

export interface UpstreamCart {
  id: string
  items: UpstreamCartItem[]
  total: string
  original_total: string
  discount_amount: string
  delivery_groups: UpstreamCartGroup[]
}

export async function fetchCart(event: NitroEvent): Promise<UpstreamCart> {
  return upstream<UpstreamCart>(event, '/shop/cart/', { auth: true })
}

/**
 * Строка корзины по варианту. Нужна всем изменениям: фронт присылает id
 * варианта, а `PATCH`/`DELETE /shop/cart/items/<uuid>/` ждут id строки.
 * Без этого перевода бэкенд отвечал бы 404 на каждое изменение количества.
 */
export function itemByVariant(cart: UpstreamCart, variantId: string): UpstreamCartItem | null {
  return (cart.items ?? []).find(item => item.variant?.id === variantId) ?? null
}

/**
 * Счётчик в шапке. Штуки считаем по ВСЕЙ корзине, а сумму — только по
 * отмеченным позициям: ровно так же считает бэкенд (`CartSerializer.total`
 * фильтрует по `is_selected`), иначе бейдж и итог спорили бы друг с другом.
 */
/** `null` — посетитель ещё не назвался; см. `emptyCart()`. */
export function summaryOf(cart: UpstreamCart | null) {
  const count = (cart?.items ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0)
  return { count, total: money(cart?.total ?? 0) }
}

function toItem(item: UpstreamCartItem): CartItem {
  const variant = item.variant
  const price = money(variant?.effective_price ?? variant?.price)
  const fullPrice = variant?.is_discount_active ? money(variant.price) : null

  return {
    id: item.id,
    productId: item.product_id ?? '',
    skuId: variant?.id ?? '',
    product: {
      id: item.product_id ?? '',
      slug: item.product_slug ?? '',
      title: item.product_name ?? '',
      // Главная картинка товара; если её нет — своё фото варианта
      // (`swatch_image`, цветовой образец). Обе могут быть пустыми:
      // товар заводят и без фотографий.
      image: item.product_image ?? variant?.swatch_image ?? '',
      price,
      fullPrice,
      discountPercent: discountPercent(price, fullPrice),
      rating: 0,
      reviewsCount: 0,
      ordersCount: 0,
      // У бэкенда бейджи свои («deal conditions» и `campaign:<uuid>`), а в
      // контракте фронта их всего три вида. Сводить одно к другому наугад
      // значит подписать товар тем, чем он не является.
      badges: [],
      installmentPerMonth: installmentPerMonth(price),
      deliveryDate: '',
      available: item.is_available ?? false,
      // Остальные фото товара в корзине не приходят — только главное.
      gallery: [],
    },
    skuOptions: Object.entries(variant?.attributes ?? {}).map(([code, value]) => ({
      // Человеческого названия у ключа в этом ответе нет — показываем ключ,
      // как и карточка товара (см. utils/product.ts).
      title: code,
      value: String(value),
    })),
    quantity: item.quantity ?? 0,
    // Потолок «плюсика» — реальный остаток, который бэкенд проверит на
    // checkout (`available_stock` считается тем же кодом, что и отказ
    // InsufficientStock), а не круглое число из макета.
    maxQuantity: item.available_stock ?? 0,
    price,
    fullPrice,
    selected: item.is_selected ?? false,
    seller: {
      id: item.seller?.id ?? '',
      slug: item.seller?.slug ?? '',
      title: item.seller?.title ?? '',
      // Рейтинг и число отзывов магазина в корзину не едут намеренно: это
      // агрегат на КАЖДУЮ строку, а корзина — не витрина. Покупатель их
      // уже видел на карточке товара, откуда сюда и пришёл.
      rating: 0,
      reviewsCount: 0,
    },
  }
}

/**
 * Корзина посетителя, который ещё никак себя не назвал.
 *
 * Идентификатор устройства заводится только в браузере (`useApi` создаёт
 * cookie на клиенте), поэтому САМЫЙ ПЕРВЫЙ заход рисуется на сервере вообще
 * без него. Для чтения это не ошибка, а точный ответ: у того, кто ничего не
 * клал, корзина пуста. Отвечать 400 значит показать новому посетителю
 * страницу ошибки вместо пустой корзины — что и происходило.
 *
 * На ЗАПИСЬ правило обратное и остаётся строгим: положить товар «никому» —
 * это молча его потерять, поэтому там по-прежнему `requireCartOwner`.
 */
export function emptyCart(): Cart {
  return {
    groups: [],
    items: [],
    subtotal: money(0),
    discount: money(0),
    deliveryPrice: money(0),
    total: money(0),
    selectedCount: 0,
  }
}

export function toCart(cart: UpstreamCart): Cart {
  const all = (cart.items ?? []).map(toItem)
  const chosen = all.filter(item => item.selected)

  return {
    groups: (cart.delivery_groups ?? []).map(group => ({
      id: group.delivery_type,
      kicker: group.label,
      // Бэкенд отдаёт одну подпись на группу плюс дату; «Доставим завтра»
      // взять неоткуда, поэтому вторая строка — сама дата или пусто.
      title: group.estimated_delivery_date ?? '',
      items: (group.items ?? []).map(toItem),
    })),
    items: all,
    subtotal: money(cart.original_total),
    discount: money(cart.discount_amount),
    // Доставку бэкенд считает не в корзине, а в `POST /shop/checkout/calculate/`
    // (и только при DELIVERY_PRICING_ENABLED). Здесь честный ноль, а не
    // угаданная сумма: настоящую цифру знает экран оформления.
    deliveryPrice: money(0),
    total: money(cart.total),
    // Единицы, а не строки — рядом стоит сумма за единицы.
    selectedCount: chosen.reduce((sum, item) => sum + item.quantity, 0),
  }
}
