import type { MockEvent } from './visitor'
import type { OrderSeed } from './orders-state'
import { orderProducts } from './orders-state'
import { paymentMethodLabel } from './cards-state'
import { sellerFor } from '../../mocks/data'
import type { OrderCard, OrderStatus, OrderStatusEvent, PaymentReceipt } from '#shared/types/order'

/**
 * Сборка карточки заказа для витрины.
 *
 * Подписи статусов отдаём на языке запроса, а машинный статус — рядом:
 * фронт решает, что рисовать, только по коду (`status`, `paymentStatus`).
 */

const STATUS_LABELS: Record<string, Record<OrderStatus, string>> = {
  'ru': {
    created: 'Заказ принят',
    paid: 'Оплачен',
    processing: 'В обработке',
    onTheWay: 'В пути',
    readyForPickup: 'Готов к выдаче',
    delivered: 'Доставлен',
    canceled: 'Отменён',
    awaitingSeller: 'Ожидает подтверждения продавца',
    confirmed: 'Подтверждён, в обработке',
    handedToDelivery: 'Передан в доставку',
    rejectedBySeller: 'Отменён продавцом',
    returnRequested: 'Возврат оформлен',
  },
  'uz': {
    created: 'Buyurtma qabul qilindi',
    paid: "To'langan",
    processing: 'Ishlov berilmoqda',
    onTheWay: "Yo'lda",
    readyForPickup: 'Olib ketishga tayyor',
    delivered: 'Yetkazildi',
    canceled: 'Bekor qilindi',
    awaitingSeller: 'Sotuvchi tasdig\'ini kutmoqda',
    confirmed: 'Tasdiqlandi, ishlov berilmoqda',
    handedToDelivery: 'Yetkazib berishga topshirildi',
    rejectedBySeller: 'Sotuvchi bekor qildi',
    returnRequested: 'Qaytarish rasmiylashtirildi',
  },
  'uz-cyrl': {
    created: 'Буюртма қабул қилинди',
    paid: 'Тўланган',
    processing: 'Ишлов берилмоқда',
    onTheWay: 'Йўлда',
    readyForPickup: 'Олиб кетишга тайёр',
    delivered: 'Етказилди',
    canceled: 'Бекор қилинди',
    awaitingSeller: 'Сотувчи тасдиғини кутмоқда',
    confirmed: 'Тасдиқланди, ишлов берилмоқда',
    handedToDelivery: 'Етказиб беришга топширилди',
    rejectedBySeller: 'Сотувчи бекор қилди',
    returnRequested: 'Қайтариш расмийлаштирилди',
  },
  'en': {
    created: 'Order accepted',
    paid: 'Paid',
    processing: 'Processing',
    onTheWay: 'On the way',
    readyForPickup: 'Ready for pickup',
    delivered: 'Delivered',
    canceled: 'Canceled',
    awaitingSeller: 'Awaiting seller confirmation',
    confirmed: 'Confirmed, processing',
    handedToDelivery: 'Handed to delivery',
    rejectedBySeller: 'Canceled by seller',
    returnRequested: 'Return requested',
  },
  'kaa': {
    created: 'Buyırtpa qabıl etildi',
    paid: 'Tólengen',
    processing: 'Islenbekte',
    onTheWay: 'Jolda',
    readyForPickup: 'Alıp ketiwge tayın',
    delivered: 'Jetkizildi',
    canceled: 'Biykar etildi',
    awaitingSeller: 'Satıwshı tastıyıqlawın kútpekte',
    confirmed: 'Tastıyıqlandı, islenbekte',
    handedToDelivery: 'Jetkiziwge tapsırıldı',
    rejectedBySeller: 'Satıwshı biykar etti',
    returnRequested: 'Qaytarıw rásmiylestirildi',
  },
}

const MONTHS: Record<string, string[]> = {
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
  'uz-cyrl': ['январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентабр', 'октабр', 'ноябр', 'декабр'],
}

export function langOf(event: MockEvent) {
  const header = (getHeader(event, 'accept-language') ?? 'ru').split(',')[0]!.trim()
  return STATUS_LABELS[header] ? header : 'ru'
}

export function statusLabel(event: MockEvent, status: OrderStatus) {
  return STATUS_LABELS[langOf(event)]![status]
}

function shift(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

/**
 * «20.09.2026» — формат дат мок-заказов, сдвинутых от «сегодня» на N дней.
 *
 * Названо отдельно от боевого `orderDate` (см. `api-backend/server/utils/orderLabels.ts`):
 * совпадение имён однажды уже маскировало реальный баг автоимпорта Nitro.
 */
export function mockOrderDate(days: number) {
  const date = shift(days)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

const TASHKENT = 'Asia/Tashkent'

/** «09.10.2026» по ташкентскому времени */
export function mockDateOf(ms: number) {
  return new Intl.DateTimeFormat('ru-RU', { timeZone: TASHKENT, day: '2-digit', month: '2-digit', year: 'numeric' }).format(ms)
}

/** «09.10.2026, 14:32» по ташкентскому времени */
export function mockStampOf(ms: number) {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: TASHKENT,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(ms)
}

/** «25 сентября» — подпись ожидаемой доставки */
export function orderDay(event: MockEvent, days: number) {
  return mockDayLabel(event, shift(days).getTime())
}

export function mockDayLabel(event: MockEvent, ms: number) {
  const date = new Date(ms)
  const lang = langOf(event)
  const months = MONTHS[lang] ?? MONTHS.uz!
  return lang === 'en'
    ? `${months[date.getMonth()]} ${date.getDate()}`
    : `${date.getDate()} ${months[date.getMonth()]}`
}

function historyFor(seed: OrderSeed): OrderStatusEvent[] {
  return seed.history.map(item => ({ status: item.status, at: mockStampOf(item.at) }))
}

export function toOrderCard(event: MockEvent, seed: OrderSeed): OrderCard {
  const products = orderProducts(seed)

  const items = products.map(product => ({
    id: product.id,
    title: product.title,
    image: product.image,
    quantity: product.quantity,
    price: product.price,
    seller: sellerFor(product.id).title,
    badge: statusLabel(event, seed.status),
  }))

  return {
    id: seed.id,
    number: seed.number,
    images: items.map(item => item.image),
    items,
    // Сумма заказа — то, что заблокировано/списано: товары − промокод + доставка
    total: { amount: seed.amount, currency: 'UZS' as const },
    status: seed.status,
    statusLabel: statusLabel(event, seed.status),
    date: mockDateOf(seed.placedAt),
    deliveryType: seed.deliveryType,
    expectedAt: seed.expectedAt === null ? undefined : mockDayLabel(event, seed.expectedAt),
    history: historyFor(seed),
    canceledReason: seed.canceledReason,
    paymentStatus: seed.paymentStatus,
    tracking: seed.trackingNumber ? { provider: seed.provider, number: seed.trackingNumber } : undefined,
  }
}

export const RECEIPT_OPERATOR = 'АО «Octagram»'
export const RECEIPT_INN = '307993034'

/** Чек одного платежа: все заказы с тем же id транзакции */
export function receiptFor(event: MockEvent, orders: OrderSeed[]): PaymentReceipt | undefined {
  const first = orders[0]
  if (!first?.transactionId) return undefined

  const refunded = orders.every(order => order.paymentStatus === 'refunded')
  const held = orders.some(order => order.paymentStatus === 'held')

  return {
    transactionId: first.transactionId,
    operator: RECEIPT_OPERATOR,
    inn: RECEIPT_INN,
    amount: { amount: orders.reduce((acc, order) => acc + order.amount, 0), currency: 'UZS' },
    date: mockStampOf(first.placedAt),
    paymentMethod: paymentMethodLabel(event, first.cardId),
    orderNumbers: orders.map(order => order.number),
    paymentStatus: refunded ? 'refunded' : held ? 'held' : 'charged',
  }
}
