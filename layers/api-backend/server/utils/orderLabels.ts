/**
 * Подписи статусов заказа. Бэкенд отдаёт статус кодом (`compute_order_status`),
 * перевода на сервере нет, поэтому подписи живут здесь — и в списке заказов,
 * и на странице одного заказа, одним словарём, чтобы карточка и деталка не
 * разошлись в терминах.
 *
 * Код уезжает рядом, в `statusCode`: по нему OrderCard.vue решает, красить ли
 * плашку зелёным. По подписи решать нельзя — она переводится.
 */
export const ORDER_STATUS: Record<string, Record<string, string>> = {
  ru: {
    payment_pending: 'Ожидает оплаты',
    processing: 'Заказ принят',
    shipped: 'В пути',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  },
  uz: {
    payment_pending: 'To\'lov kutilmoqda',
    processing: 'Buyurtma qabul qilindi',
    shipped: 'Yo\'lda',
    delivered: 'Yetkazildi',
    cancelled: 'Bekor qilindi',
  },
}

export const ITEM_STATUS: Record<string, Record<string, string>> = {
  ru: { pending: 'Заказ принят', shipped: 'В пути', delivered: 'Доставлен', cancelled: 'Отменён' },
  uz: { pending: 'Qabul qilindi', shipped: 'Yo\'lda', delivered: 'Yetkazildi', cancelled: 'Bekor qilindi' },
}

/**
 * Бэкенд отдаёт статус своим кодом (см. выше), а `OrderCard.status` типа
 * ждёт машинный код фронта (`OrderStatus` в `#shared/types/order`) — это два
 * разных словаря кодов, не один и тот же под разными именами. Без этой
 * карты `status` фронта был бы равен переводу (`"Yetkazildi"`), и любое
 * сравнение `=== 'delivered'` или `t('account.orderState.' + status)`
 * молчаливо промахивалось бы мимо всех заказов.
 */
export const STATUS_CODE: Record<string, import('#shared/types/order').OrderStatus> = {
  payment_pending: 'created',
  processing: 'processing',
  shipped: 'onTheWay',
  delivered: 'delivered',
  cancelled: 'canceled',
}

/**
 * «04.01.2024» — один формат даты на всё приложение.
 *
 * Берём дату из ответа как есть, а не через `new Date().getDate()`: бэкенд
 * отдаёт её уже в своей зоне (Asia/Tashkent), а Node в контейнере почти
 * всегда в UTC. Заказ, оформленный до 05:00 по Ташкенту, через `getDate()`
 * показывался бы вчерашним — и покупателю, и в поддержке.
 */
export function orderDate(value: string): string {
  const [day] = String(value ?? '').split('T')
  const parts = (day ?? '').split('-')
  if (parts.length !== 3) return ''
  const [year, month, dayOfMonth] = parts
  return `${dayOfMonth}.${month}.${year}`
}
