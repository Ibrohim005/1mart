import { productCards, sellerFor } from '../../mocks/data'
import type { MockEvent } from './visitor'
import { perVisitor } from './visitor'
import { can, membership, requesterOf, scopeId } from './org-state'
import { releaseFunds } from './cards-state'
import { SELLER_REJECT_QTY } from './checkout-quote'
import type { DeliveryProvider, DeliveryType, OrderStatus, PaymentStatus } from '#shared/types/order'
import type { Requester } from '#shared/types/company'

/**
 * Состояние заказов посетителя — машинное: статусы, состав, деньги, даты.
 * Подписи считаются в обработчике на языке запроса.
 *
 * Поток 1mart (ТЗ UC-FL-10):
 *   оформление → «Ожидает подтверждения продавца» (средства зарезервированы)
 *   → +20 с «Подтверждён» (средства списаны)
 *   → +40 с «Передан в доставку» (трек-номер службы)
 *   → +65 с «Доставлен» (у самовывоза: +65 с «Готов к выдаче», +90 с «Получен»).
 * А2: заказ, где у позиции ровно SELLER_REJECT_QTY шт., продавец отклоняет на 20-й секунде —
 * «Отменён продавцом», средства возвращаются тем же способом оплаты.
 *
 * Мок без фоновых задач: стадия досчитывается при каждом чтении по времени
 * оформления, поэтому статус «живёт», пока страница опрашивает сервер.
 *
 * TODO: Connect to backend endpoint GET /orders
 */

export interface OrderSeed {
  id: number
  number: string
  /** Индексы товаров в каталоге — из них собираются позиции и фото */
  productIds: number[]
  /** Штук по каждой позиции; нет — по одной */
  quantities?: number[]
  /** Цена позиции на момент оформления, тийины; нет — текущая цена товара */
  prices?: number[]
  status: OrderStatus
  deliveryType: DeliveryType
  placedAt: number
  /** Ожидаемая доставка, ms; null — заказ завершён */
  expectedAt: number | null
  history: Array<{ status: OrderStatus, at: number }>
  canceledReason?: string
  /** Корпоративная карта, которой оплачен заказ; null — оплата с баланса */
  cardId: string | null
  paymentStatus: PaymentStatus
  provider?: DeliveryProvider
  pickupPointId?: string
  trackingNumber?: string
  /** Доставка, отнесённая к этому заказу, тийины */
  deliveryPrice: number
  promoAmount: number
  /** Сколько заблокировано/списано по заказу: товары − промокод + доставка */
  amount: number
  transactionId?: string
  comment?: string | null
  /** Оформлен в этой сессии — стадии идут по таймеру */
  live?: boolean
  /** А2: продавец отклонит заказ */
  willReject?: boolean
  returnReason?: string
  /** Автор заявки по каждой позиции (в порядке productIds); у старых заказов нет */
  requesters?: Array<Requester | null>
  /** Кто оформил (одобрил) заказ в компании */
  placedBy?: Requester | null
  returnPhotos?: number
  reviewed?: boolean
}

const SECOND = 1000
const DAY = 86_400_000

/** Через сколько после оформления заказ переходит в стадию */
export const STAGE_AT = {
  confirmed: 20 * SECOND,
  handedToDelivery: 40 * SECOND,
  readyForPickup: 65 * SECOND,
  deliveredCourier: 65 * SECOND,
  deliveredPickup: 90 * SECOND,
}

const TRACK_PREFIX: Record<DeliveryProvider, string> = {
  spotshop: 'SPS',
  express24: 'E24',
  maxsus: 'MXC',
  yandex: 'YND',
}

function trackingFor(order: Pick<OrderSeed, 'id' | 'provider'>) {
  const prefix = order.provider ? TRACK_PREFIX[order.provider] : 'PLV'
  return `${prefix}-${String(7_300_000 + order.id * 7919).padStart(8, '0')}`
}

export function newTransactionId() {
  const digits = Array.from(crypto.getRandomValues(new Uint8Array(12)), byte => byte % 10).join('')
  return `PLV${digits}`
}

function staticSeed(input: {
  id: number
  productIds: number[]
  status: OrderStatus
  path: OrderStatus[]
  deliveryType: DeliveryType
  daysAgo: number
  expectedInDays: number | null
  cardId: string | null
  paymentStatus: PaymentStatus
  provider?: DeliveryProvider
  pickupPointId?: string
}): OrderSeed {
  const placedAt = Date.now() - input.daysAgo * DAY - 2 * 3_600_000
  const step = input.daysAgo > 0 ? (input.daysAgo * DAY) / Math.max(1, input.path.length) : 15 * 60_000
  const prices = input.productIds.map(index => productCards[index % productCards.length]?.price.amount ?? 0)
  const goods = prices.reduce((acc, price) => acc + price, 0)
  const deliveryPrice = input.deliveryType === 'courier' ? 2_500_000 : 0

  const order: OrderSeed = {
    id: input.id,
    number: `#1200${20 + input.id}`,
    productIds: input.productIds,
    prices,
    status: input.status,
    deliveryType: input.deliveryType,
    placedAt,
    expectedAt: input.expectedInDays === null ? null : Date.now() + input.expectedInDays * DAY,
    history: input.path.map((status, index) => ({ status, at: placedAt + Math.round(index * step) })),
    cardId: input.cardId,
    paymentStatus: input.paymentStatus,
    provider: input.provider,
    pickupPointId: input.pickupPointId,
    deliveryPrice,
    promoAmount: 0,
    amount: goods + deliveryPrice,
    transactionId: `PLV${String(480_215_000_000 + input.id * 1_234_567).padStart(12, '0')}`,
  }
  if (['handedToDelivery', 'readyForPickup', 'delivered'].includes(input.status)) order.trackingNumber = trackingFor(order)
  return order
}

/** Шесть заказов на все состояния дорожки 1mart, включая отказ продавца */
function seed(): OrderSeed[] {
  return [
    staticSeed({ id: 1, productIds: [0, 1], status: 'confirmed', path: ['awaitingSeller', 'confirmed'], deliveryType: 'courier', daysAgo: 0, expectedInDays: 2, cardId: null, paymentStatus: 'charged', provider: 'spotshop' }),
    staticSeed({ id: 2, productIds: [2, 3, 4], status: 'handedToDelivery', path: ['awaitingSeller', 'confirmed', 'handedToDelivery'], deliveryType: 'courier', daysAgo: 1, expectedInDays: 1, cardId: 'c1', paymentStatus: 'charged', provider: 'spotshop' }),
    staticSeed({ id: 3, productIds: [5, 6, 7, 8, 9, 10], status: 'handedToDelivery', path: ['awaitingSeller', 'confirmed', 'handedToDelivery'], deliveryType: 'courier', daysAgo: 3, expectedInDays: 1, cardId: null, paymentStatus: 'charged', provider: 'spotshop' }),
    staticSeed({ id: 4, productIds: [11, 12], status: 'readyForPickup', path: ['awaitingSeller', 'confirmed', 'handedToDelivery', 'readyForPickup'], deliveryType: 'pickupPoint', daysAgo: 4, expectedInDays: 0, cardId: null, paymentStatus: 'charged', pickupPointId: 'pp1' }),
    staticSeed({ id: 5, productIds: [13, 14, 15], status: 'delivered', path: ['awaitingSeller', 'confirmed', 'handedToDelivery', 'delivered'], deliveryType: 'courier', daysAgo: 12, expectedInDays: null, cardId: 'c1', paymentStatus: 'charged', provider: 'spotshop' }),
    staticSeed({ id: 6, productIds: [16, 17], status: 'rejectedBySeller', path: ['awaitingSeller', 'rejectedBySeller'], deliveryType: 'courier', daysAgo: 20, expectedInDays: null, cardId: null, paymentStatus: 'refunded', provider: 'spotshop' }),
  ]
}

const store = perVisitor<OrderSeed[]>(seed, 500, scopeId) // общее у всей компании, см. org-state

/** Досчитать стадию заказа по времени — вместо фоновой задачи продавца и курьера */
function advance(event: MockEvent, order: OrderSeed, now: number) {
  if (!order.live) return
  if (order.status !== 'awaitingSeller' && order.status !== 'confirmed'
    && order.status !== 'handedToDelivery' && order.status !== 'readyForPickup') return

  const elapsed = now - order.placedAt

  if (order.willReject) {
    if (order.status === 'awaitingSeller' && elapsed >= STAGE_AT.confirmed) {
      order.status = 'rejectedBySeller'
      order.paymentStatus = 'refunded'
      order.expectedAt = null
      order.history.push({ status: 'rejectedBySeller', at: order.placedAt + STAGE_AT.confirmed })
      releaseFunds(event, order.cardId, order.amount)
    }
    return
  }

  const pickup = order.deliveryType === 'pickupPoint'
  const stages: Array<[OrderStatus, number]> = [
    ['confirmed', STAGE_AT.confirmed],
    ['handedToDelivery', STAGE_AT.handedToDelivery],
    ...(pickup ? [['readyForPickup', STAGE_AT.readyForPickup] as [OrderStatus, number]] : []),
    ['delivered', pickup ? STAGE_AT.deliveredPickup : STAGE_AT.deliveredCourier],
  ]

  for (const [status, offset] of stages) {
    if (elapsed < offset || order.history.some(item => item.status === status)) continue
    order.status = status
    order.history.push({ status, at: order.placedAt + offset })
    if (status === 'confirmed') order.paymentStatus = 'charged'
    if (status === 'handedToDelivery') order.trackingNumber = trackingFor(order)
    if (status === 'delivered') order.expectedAt = null
  }
}

/**
 * Стартовые заказы компании подписываем её людьми: кто оформил и чьи заявки.
 * В демо-компании — закупщик и бухгалтер, заявки бухгалтера и айтишника;
 * в «своей» компании всё оформил руководитель.
 */
function signSeeds(event: MockEvent, orders: OrderSeed[]) {
  const member = membership(event)
  if (!member) return
  const people = member.state.employees
  const byName = (name: string) => people.find(item => item.fullName === name)
  const owner = people.find(item => item.isOwner)!
  for (const order of orders) {
    if (order.placedBy !== undefined || order.live) continue
    if (member.state.shared) {
      const placer = byName(order.id % 2 ? 'Саидова Дильноза' : 'Иванова Анна') ?? owner
      const authors = [byName('Иванова Анна'), byName('Турсунов Жасур')].filter((item): item is NonNullable<typeof item> => Boolean(item))
      order.placedBy = requesterOf(member.state, placer)
      order.requesters = order.productIds.map((_, index) => requesterOf(member.state, authors[index % authors.length] ?? owner))
    }
    else {
      order.placedBy = requesterOf(member.state, owner)
    }
  }
}

export function orderSeeds(event: MockEvent) {
  const orders = store.get(event)
  const now = Date.now()
  signSeeds(event, orders)
  for (const order of orders) advance(event, order, now)
  // Без orders.viewAll сотрудник видит только заказы, где есть его заявки
  if (can(event, 'orders.viewAll')) return orders
  const mine = membership(event)?.employee.id
  return orders.filter(order => order.requesters?.some(requester => requester?.employeeId === mine))
}

export function findOrderSeed(event: MockEvent, id: number) {
  return orderSeeds(event).find(order => order.id === id)
}

/** Завершённые — сюда не попадают «Активные» */
const FINISHED: OrderStatus[] = ['delivered', 'canceled', 'rejectedBySeller', 'returnRequested']

export function isActive(status: OrderStatus) {
  return !FINISHED.includes(status)
}

/** ТЗ: отменить можно, пока продавец не подтвердил заказ */
export function canCancel(status: OrderStatus) {
  return status === 'awaitingSeller' || status === 'created' || status === 'paid'
}

export function cancelOrderSeed(event: MockEvent, id: number, reason: string) {
  const order = findOrderSeed(event, id)
  if (!order || !canCancel(order.status)) return null

  order.status = 'canceled'
  order.expectedAt = null
  order.canceledReason = reason
  order.history.push({ status: 'canceled', at: Date.now() })
  // Резерв снимается — деньги возвращаются тем же способом оплаты
  if (order.paymentStatus !== 'refunded') {
    order.paymentStatus = 'refunded'
    releaseFunds(event, order.cardId, order.amount)
  }
  return order
}

export function returnOrderSeed(event: MockEvent, id: number, reason: string, photos: number) {
  const order = findOrderSeed(event, id)
  if (!order || order.status !== 'delivered') return null

  order.status = 'returnRequested'
  order.returnReason = reason
  order.returnPhotos = photos
  order.history.push({ status: 'returnRequested', at: Date.now() })
  return order
}

/** Товары заказа с количеством и ценой на момент оформления */
export function orderProducts(order: OrderSeed) {
  return order.productIds
    .map((index, position) => {
      const product = productCards[index % productCards.length]
      if (!product) return null
      return {
        ...product,
        quantity: order.quantities?.[position] ?? 1,
        price: { amount: order.prices?.[position] ?? product.price.amount, currency: 'UZS' as const },
      }
    })
    .filter(<T>(item: T | null): item is T => item !== null)
}

export interface PlacementLine {
  productIndex: number
  quantity: number
  price: number
  /** Чья заявка: имя остаётся у позиции и в заказе */
  requester: Requester | null
}

/**
 * Новые заказы после подтверждения кодом. Корзина делится по продавцам —
 * у каждого продавца свой заказ и своё подтверждение; доставка и промокод
 * раскладываются по заказам, а оплата одна, с общим id транзакции.
 */
export function createOrderSeeds(event: MockEvent, options: {
  lines: PlacementLine[]
  deliveryType: DeliveryType
  provider: DeliveryProvider | null
  pickupPointId: string | null
  cardId: string | null
  promoPercent: number
  /** Скидка по промокоду на всю корзину — раскладывается по заказам без потери тийинов */
  promoAmount: number
  delivery: number
  etaDays: number
  transactionId: string
  comment?: string | null
  /** Кто оформил: закупщик, бухгалтер или руководитель */
  placedBy?: Requester | null
}) {
  const orders = store.get(event)
  const groups = new Map<number | string, PlacementLine[]>()
  for (const line of options.lines) {
    const seller = sellerFor(productCards[line.productIndex]!.id).id
    groups.set(seller, [...(groups.get(seller) ?? []), line])
  }

  const now = Date.now()
  const created: OrderSeed[] = []
  let index = 0
  let promoLeft = options.promoAmount

  for (const lines of groups.values()) {
    const id = Math.max(0, ...orders.map(order => order.id)) + 1
    const goods = lines.reduce((acc, line) => acc + line.price * line.quantity, 0)
    const last = index === groups.size - 1
    const promoAmount = last ? promoLeft : Math.min(promoLeft, Math.round(goods * options.promoPercent / 100))
    promoLeft -= promoAmount
    const deliveryPrice = index === 0 ? options.delivery : 0

    const order: OrderSeed = {
      id,
      number: `#1200${20 + id}`,
      productIds: lines.map(line => line.productIndex),
      quantities: lines.map(line => line.quantity),
      prices: lines.map(line => line.price),
      requesters: lines.map(line => line.requester),
      placedBy: options.placedBy ?? null,
      status: 'awaitingSeller',
      deliveryType: options.deliveryType,
      placedAt: now,
      expectedAt: now + options.etaDays * DAY,
      history: [{ status: 'awaitingSeller', at: now }],
      cardId: options.cardId,
      paymentStatus: 'held',
      provider: options.provider ?? undefined,
      pickupPointId: options.pickupPointId ?? undefined,
      deliveryPrice,
      promoAmount,
      amount: goods - promoAmount + deliveryPrice,
      transactionId: options.transactionId,
      comment: options.comment ?? null,
      live: true,
      willReject: lines.some(line => line.quantity === SELLER_REJECT_QTY),
    }

    orders.unshift(order)
    created.push(order)
    index += 1
  }

  return created
}
