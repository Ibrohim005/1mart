import type { MockEvent } from './visitor'
import { cartEntries, cartSummary, isSelected } from './cart-state'
import type { DeliveryProvider, DeliveryType } from '#shared/types/order'

/**
 * Расчёт заказа на сервере (ТЗ UC-FL-10, шаг «итоги: товары + доставка + комиссия»).
 *
 * Сумма к оплате не может приходить из браузера — здесь собран расчёт, который
 * обязан делать бэкенд: товары, промокод, доставка выбранной службой
 * (Express 24 / Maxsus Courier / Yandex Доставка) или пункт выдачи, комиссия.
 *
 * Детерминированные демо-правила (их же проверяет оформление заказа):
 * - А1: позиция в количестве 3 шт. и больше «закончилась» у продавца при
 *   повторной проверке остатка — покупателю предлагают убрать её;
 * - А2: заказ, где у товара ровно 2 шт., продавец отклоняет (см. orders-state).
 *
 * TODO: Connect to backend endpoint POST /checkout/quote
 */

export interface PromoCode {
  id: string
  code: string
  description: string
  /** Доля от суммы товаров */
  percent: number
  freeDelivery?: boolean
  /** Срок действия, ISO-дата */
  until: string
}

/** Промокоды покупателя. У каждого своя дата окончания */
export function promoCodes(): PromoCode[] {
  return [
    { id: 'p1', code: 'PAYLOV-10', description: 'Скидка 10% на заказ', percent: 10, until: inDays(30) },
    { id: 'p2', code: 'PAYLOV-15', description: 'Скидка 15% для новых покупателей', percent: 15, until: inDays(14) },
    { id: 'p3', code: 'FREE-DOST', description: 'Бесплатная доставка', percent: 0, freeDelivery: true, until: inDays(7) },
  ]
}

/** Промокоды, которые предлагает корзина — набор мельче, чем на оформлении */
export function cartPromoCodes(): PromoCode[] {
  return [
    { id: 'p1', code: 'PAYLOV-10', description: 'Скидка 10% на заказ', percent: 10, until: inDays(30) },
    { id: 'p2', code: 'FREE-DOST', description: 'Бесплатная доставка', percent: 0, freeDelivery: true, until: inDays(7) },
  ]
}

function inDays(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Тарифы служб доставки по Ташкенту, тийины, и срок в днях */
const COURIERS: Array<{ id: DeliveryProvider, price: number, days: number }> = [
  { id: 'express24', price: 2_500_000, days: 1 },
  { id: 'maxsus', price: 1_800_000, days: 2 },
  { id: 'yandex', price: 2_200_000, days: 1 },
]

export interface PickupPointOption {
  id: string
  title: string
  address: string
  workingHours: string
  days: number
  price: number
  eta: string
}

const PICKUP_POINTS = [
  { id: 'pp1', title: '1mart — Чиланзар', address: 'Ташкент, Чиланзарский район, ул. Бунёдкор, 12', workingHours: '09:00–21:00', days: 2 },
  { id: 'pp2', title: '1mart — Юнусабад', address: 'Ташкент, Юнусабадский район, ул. Амира Темура, 108', workingHours: '09:00–20:00', days: 2 },
  { id: 'pp3', title: '1mart — Мирзо-Улугбек', address: 'Ташкент, ул. Мустакиллик, 12', workingHours: '10:00–22:00', days: 3 },
]

/** Демо-правило А1: столько штук и больше «нет в наличии» при оформлении */
export const OUT_OF_STOCK_QTY = 500
/** Демо-правило А2: позиция ровно в стольких штуках — продавец отклонит заказ */
export const SELLER_REJECT_QTY = 13

/** Комиссия 1mart для покупателя при оплате картой */
export const COMMISSION_PERCENT = 0

function etaDate(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export interface StockIssue {
  skuId: number
  title: string
  image: string
  requested: number
  available: number
}

/** Позиции, которых при повторной проверке остатка не оказалось (А1) */
export function stockIssues(event: MockEvent): StockIssue[] {
  return cartEntries(event)
    .filter(entry => isSelected(event, entry.skuId) && entry.quantity >= OUT_OF_STOCK_QTY)
    .map(entry => ({
      skuId: entry.skuId,
      title: entry.product.title,
      image: entry.product.image,
      requested: entry.quantity,
      available: 0,
    }))
}

export interface QuoteOptions {
  promoCode?: string | null
  deliveryType?: DeliveryType
  provider?: DeliveryProvider | null
  pickupPointId?: string | null
}

export interface Quote {
  goods: number
  promoCode: string | null
  promoPercent: number
  promoAmount: number
  deliveryType: DeliveryType
  provider: DeliveryProvider | null
  pickupPointId: string | null
  delivery: number
  commission: number
  payable: number
  couriers: Array<{ id: DeliveryProvider, price: number, days: number, eta: string }>
  pickupPoints: PickupPointOption[]
  stockIssues: StockIssue[]
  /** ISO-дата ожидаемой доставки выбранным способом */
  eta: string
  deliveryBlocked: Array<{ sellerId: string, sellerTitle: string, reason: string }>
}

export function quoteFor(event: MockEvent, options: QuoteOptions): Quote {
  const goods = cartSummary(event).total.amount
  const promo = options.promoCode
    ? promoCodes().find(item => item.code === options.promoCode) ?? null
    : null

  const promoAmount = promo ? Math.round(goods * promo.percent / 100) : 0
  const afterPromo = Math.max(0, goods - promoAmount)

  const deliveryType: DeliveryType = options.deliveryType === 'pickupPoint' ? 'pickupPoint' : 'courier'
  const courier = COURIERS.find(item => item.id === options.provider) ?? COURIERS[0]!
  const pickup = PICKUP_POINTS.find(item => item.id === options.pickupPointId) ?? PICKUP_POINTS[0]!

  const basePrice = deliveryType === 'courier' ? courier.price : 0
  const delivery = goods > 0 && !promo?.freeDelivery ? basePrice : 0

  const commission = Math.round((afterPromo + delivery) * COMMISSION_PERCENT / 100)

  return {
    goods,
    promoCode: promo?.code ?? null,
    promoPercent: promo?.percent ?? 0,
    promoAmount,
    deliveryType,
    provider: deliveryType === 'courier' ? courier.id : null,
    pickupPointId: deliveryType === 'pickupPoint' ? pickup.id : null,
    delivery,
    commission,
    payable: afterPromo + delivery + commission,
    couriers: COURIERS.map(item => ({ ...item, eta: etaDate(item.days) })),
    pickupPoints: PICKUP_POINTS.map(item => ({ ...item, price: 0, eta: etaDate(item.days) })),
    stockIssues: stockIssues(event),
    eta: etaDate(deliveryType === 'courier' ? courier.days : pickup.days),
    deliveryBlocked: [],
  }
}

export function pickupPointById(id: string | null | undefined) {
  return PICKUP_POINTS.find(item => item.id === id) ?? null
}
