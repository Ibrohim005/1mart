import type { Badge, ProductCard, Sku } from '#shared/types/catalog'
import { discountPercent, installmentPerMonth, money, moneyOrNull } from '../lib/money'

/**
 * Перевод товара из zoo-backend в карточку, которую рисует фронт.
 *
 * Чего в бэкенде НЕТ, то здесь честно пустое, а не выдумано: рассрочка,
 * «N человек купили на этой неделе», разбивка оценок. Подставить сюда
 * правдоподобное число — значит показать покупателю цифру, которой никто
 * не считал; пустое поле компоненты уже умеют не рисовать.
 */
export interface UpstreamVariant {
  id: string
  attributes: Record<string, string> | null
  /**
   * Те же атрибуты, но с человеческой подписью из реестра
   * (ShopProductVariantSerializer.attributes_display). Необязательное:
   * старый бэкенд его не отдаёт, и тогда `skus()` откатывается на ключ.
   */
  attributes_display?: Array<{
    key: string
    label: string
    value: string
    /** Переведённое значение; отсутствует у числовых («45», «5kg»). */
    value_label?: string
  }> | null
  sku: string | null
  price: string
  stock: number
  discount_price: string | null
  is_active: boolean
  effective_price: string
  is_discount_active: boolean
  swatch_image: string | null
}

export interface UpstreamProduct {
  id: string
  slug_uz: string | null
  slug_ru: string | null
  slug_en: string | null
  name: string
  seller: string
  seller_title: string | null
  images: Array<{ id: string, image: string, is_main: boolean, order: number }>
  variants: UpstreamVariant[]
  rating: number | null
  reviews_count: number | null
  badges?: Array<{ kind?: string, label?: string } | string>
  estimated_delivery_date: string | { min: string, max?: string } | null
  video_url: string | null
  /** Дата постановки на витрину — по ней считается «Новинка» */
  created_at?: string | null
  /** Условия сделки продавца; нас интересует ключ `delivery` */
  deal_conditions?: Array<{ key?: string, value?: unknown, label?: string }>
}

const DELIVERY_MONTHS: Record<string, string[]> = {
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'],
}

const DELIVERY_RELATIVE: Record<string, string[]> = {
  // индекс = дней до доставки: [сегодня, завтра, послезавтра]
  ru: ['сегодня', 'завтра', 'послезавтра'],
  uz: ['bugun', 'ertaga', 'indinga'],
}

/**
 * «сегодня» / «завтра» / «послезавтра», дальше сразу дата — «15 августа».
 * Даты сравниваем как календарные (Y-M-D), не через `new Date().getDate()`:
 * бэкенд отдаёт `estimated_delivery_date` в зоне Ташкента, а Node в
 * контейнере в UTC, так что часовая дельта не должна сдвигать день (см.
 * тот же довод в orderLabels.ts `orderDate`).
 *
 * Когда бэкенд отдаёт диапазон {min, max}, строим «3–7 ноября» (или
 * «завтра–послезавтра»). Устаревший формат (одна дата-строка) поддерживается.
 */
export function deliveryDateLabel(value: string | { min: string, max?: string } | null, locale: string): string {
  const relative = DELIVERY_RELATIVE[locale] ?? DELIVERY_RELATIVE.uz!
  const months = DELIVERY_MONTHS[locale] ?? DELIVERY_MONTHS.uz!
  const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000
  const today = new Date(Date.now() + TASHKENT_OFFSET_MS).toISOString().split('T')[0]!
  const msPerDay = 24 * 60 * 60 * 1000

  function singleLabel(day: string): string {
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return ''
    const daysAhead = Math.round((Date.parse(day) - Date.parse(today)) / msPerDay)
    if (daysAhead >= 0 && daysAhead <= 2) return relative[daysAhead]!
    const [, month, dayOfMonth] = day.split('-')
    return `${Number(dayOfMonth)} ${months[Number(month) - 1]}`
  }

  if (value && typeof value === 'object') {
    const minLabel = singleLabel(value.min)
    if (!minLabel) return ''
    if (!value.max) return minLabel
    const maxLabel = singleLabel(value.max)
    if (!maxLabel || maxLabel === minLabel) return minLabel
    return `${minLabel}–${maxLabel}`
  }

  return singleLabel(String(value ?? '').split('T')[0]!)
}

/** Язык влияет только на slug: имена бэкенд уже отдаёт по Accept-Language. */
export function slugOf(product: UpstreamProduct, locale: string): string {
  const byLocale: Record<string, string | null | undefined> = {
    uz: product.slug_uz,
    ru: product.slug_ru,
    en: product.slug_en,
  }
  // Пустой slug сломал бы ссылку на карточку, поэтому в крайнем случае
  // адресуемся по id — он всегда есть.
  return byLocale[locale] || product.slug_uz || product.slug_ru || product.id
}

function mainImage(product: UpstreamProduct): string {
  const images = product.images ?? []
  return (images.find(image => image.is_main) ?? images[0])?.image ?? ''
}

/**
 * Продаваемый вариант. Фронт кладёт в корзину именно его, поэтому берём
 * только активные: неактивный вариант нельзя купить, а показать его
 * означало бы дать нажать «в корзину» и получить отказ на бэкенде.
 */
export function skus(product: UpstreamProduct): Sku[] {
  return (product.variants ?? [])
    .filter(variant => variant.is_active)
    .map(variant => ({
      id: variant.id,
      // Подпись берём из `attributes_display`, а не из ключа: покупателю
      // показывали «gender_dog» и «live_weight» — заголовки чипов в BuyBox
      // строятся именно отсюда. Реестр знает человеческое название
      // («Jinsi», «Tirik vazni (kg)») и теперь присылает его рядом со
      // значением. Fallback на сырые `attributes` оставлен на случай
      // старого бэкенда: лучше ключ, чем пустой блок выбора.
      options: variant.attributes_display?.length
        ? variant.attributes_display.map(({ key, label, value, value_label }) => ({
            code: key,
            title: label || key,
            value: String(value),
            valueLabel: value_label || String(value),
          }))
        : Object.entries(variant.attributes ?? {}).map(([code, value]) => ({
            code,
            title: code,
            value: String(value),
          })),
      price: money(variant.effective_price ?? variant.price),
      fullPrice: variant.is_discount_active ? money(variant.price) : null,
      available: variant.stock ?? 0,
      ...(variant.sku ? { barcode: variant.sku } : {}),
    }))
}

/**
 * Сколько дней товар считается новинкой. Решение продуктовое, не техническое:
 * вынесено в одну константу, чтобы менялось одной цифрой.
 */
const NEW_FOR_DAYS = 14

/** Подпись — запасная: `UiBadge` переводит бейдж по виду, а не по тексту. */
const BADGE_LABELS: Record<string, Record<Badge['kind'], string>> = {
  ru: { cheaper: 'Стало дешевле', freeShipping: 'Бесплатная доставка', new: 'Новинка' },
  uz: { cheaper: 'Arzonlashdi', freeShipping: 'Bepul yetkazib berish', new: 'Yangi' },
}

function label(kind: Badge['kind'], locale: string): string {
  return (BADGE_LABELS[locale] ?? BADGE_LABELS.uz!)[kind]
}

/** Товар встал на витрину не позже чем NEW_FOR_DAYS назад */
function isNew(createdAt: string | null | undefined): boolean {
  const time = Date.parse(String(createdAt ?? ''))
  if (Number.isNaN(time)) return false
  return (Date.now() - time) <= NEW_FOR_DAYS * 24 * 60 * 60 * 1000
}

/** Продавец возит бесплатно: в `deal_conditions` есть включённый ключ `delivery` */
function hasFreeDelivery(product: UpstreamProduct): boolean {
  return (product.deal_conditions ?? []).some(
    condition => condition.key === 'delivery' && condition.value === true,
  )
}

/**
 * Бейдж карточки.
 *
 * Поле `badges` у бэкенда есть, но приходит пустым массивом на всех товарах,
 * поэтому в макете, где бейдж есть у каждой карточки, витрина выглядела
 * голой. Собираем его из данных, которые бэкенд отдаёт на самом деле:
 * скидка — из активной цены со скидкой, бесплатная доставка — из условий
 * продавца, новинка — из даты появления. Ничего не выдумываем: если ни
 * одно из условий не выполнено, бейджа нет.
 *
 * Бейдж один, как в макете, и приоритет тот же, что у мока:
 * скидка → бесплатная доставка → новинка.
 */
function badges(product: UpstreamProduct, discounted: boolean, locale: string): Badge[] {
  const fromBackend = (product.badges ?? [])
    .map((badge) => {
      if (typeof badge === 'string') return { kind: 'new' as const, label: badge }
      const kind = badge.kind
      const known = kind === 'cheaper' || kind === 'new' || kind === 'freeShipping'
      return known && badge.label ? { kind, label: badge.label } : null
    })
    .filter((badge): badge is Badge => badge !== null)

  // Прислал бэкенд — верим ему, а не своим догадкам
  if (fromBackend.length) return fromBackend

  const kind: Badge['kind'] | null = discounted
    ? 'cheaper'
    : hasFreeDelivery(product)
      ? 'freeShipping'
      : isNew(product.created_at)
        ? 'new'
        : null

  return kind ? [{ kind, label: label(kind, locale) }] : []
}

export function productCard(product: UpstreamProduct, locale: string): ProductCard {
  const variants = skus(product)
  // Витрина показывает цену «от»: у товара может быть несколько вариантов,
  // и самый дешёвый — то, что покупатель ожидает увидеть в гриде.
  const cheapest = variants.reduce<Sku | null>(
    (best, sku) => (best === null || sku.price.amount < best.price.amount ? sku : best),
    null,
  )
  const price = cheapest?.price ?? money(0)
  const fullPrice = cheapest?.fullPrice ?? null

  return {
    id: product.id,
    slug: slugOf(product, locale),
    title: product.name,
    image: mainImage(product),
    price,
    fullPrice,
    discountPercent: discountPercent(price, fullPrice),
    rating: product.rating ?? 0,
    reviewsCount: product.reviews_count ?? 0,
    // Бэкенд не считает продажи по товару — ноль честнее выдуманного числа.
    ordersCount: 0,
    badges: badges(product, fullPrice !== null, locale),
    installmentPerMonth: installmentPerMonth(price),
    deliveryDate: deliveryDateLabel(product.estimated_delivery_date, locale),
    available: variants.some(sku => sku.available > 0),
    // Кнопка «в корзину» в гриде кладёт вариант, не товар, а состава
    // вариантов у неё нет. Отдаём тот же самый дешёвый вариант, чью цену
    // карточка и показывает, — иначе покупатель нажимает на одну цену, а в
    // корзину попадает другая.
    ...(cheapest ? { defaultSkuId: cheapest.id } : {}),
    gallery: (product.images ?? []).map(image => image.image),
  }
}

export { moneyOrNull }
