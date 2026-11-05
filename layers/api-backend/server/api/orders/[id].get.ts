import type { OrderDetail } from '#shared/types/order'
import { money } from '../../lib/money'

/**
 * Один заказ покупателя — `GET /shop/orders/<id>/` (MyOrderDetailAPIView +
 * MyOrderDetailSerializer: карточка списка плюс получатель, адрес, способ
 * оплаты и контакт продавца).
 *
 * Раньше страницы одного заказа за этим роутом не было вовсе: она искала
 * заказ в списке `/orders` (который по умолчанию отдаёт только активные и
 * только первую страницу — доставленный или ожидающий оплаты заказ 404-ил
 * на собственной странице), а блок «Детали доставки» был захардкоженной
 * заглушкой с чужим именем, чужим телефоном и датой из 2024 года.
 */
interface UpstreamOrderItem {
  id: string
  product_name: string | null
  product_image: string | null
  seller_title: string | null
  seller_owner_name: string | null
  seller_phone: string | null
  quantity: number
  unit_price: string
  fulfillment_status: string
}

interface UpstreamOrderDetail {
  id: string
  order_code: string
  status: string
  total: string
  items: UpstreamOrderItem[]
  created_at: string
  estimated_delivery_date: string | null
  recipient_name: string | null
  recipient_phone: string | null
  region_name: string | null
  district_name: string | null
  address: string | null
  apartment: string | null
  entrance: string | null
  floor: string | null
  payment_method: string | null
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const id = String(getRouterParam(event, 'id') ?? '')
  const locale = (getHeader(event, 'accept-language') || 'uz').split('-')[0]!
  const labels = ORDER_STATUS[locale] ?? ORDER_STATUS.uz!
  const itemLabels = ITEM_STATUS[locale] ?? ITEM_STATUS.uz!

  // Чужой или несуществующий id бэкенд сам отдаёт 404 (queryset сужен до
  // заказов вызывающего) — пробрасываем как есть, фронт покажет свой 404.
  const order = await upstream<UpstreamOrderDetail>(event, `/shop/orders/${id}/`, { auth: true })

  // Адрес одной строкой: регион/район, затем адрес, затем кв/подъезд/этаж —
  // только то, что реально заполнено, без «null» в тексте. Подписи частей
  // локализованы тем же способом, что и статусы выше.
  const PART = locale === 'ru'
    ? { entrance: 'подъезд', floor: 'этаж', flat: 'кв.' }
    : { entrance: 'podyezd', floor: 'qavat', flat: 'kv.' }
  const place = [order.district_name, order.region_name].filter(Boolean).join(', ')
  const extras = [
    order.entrance && `${PART.entrance} ${order.entrance}`,
    order.floor && `${PART.floor} ${order.floor}`,
    order.apartment && `${PART.flat} ${order.apartment}`,
  ].filter(Boolean).join(', ')
  const address = [order.address, place, extras].filter(Boolean).join(' · ')

  const first = (order.items ?? [])[0]

  return ok<OrderDetail>({
    id: order.id,
    number: order.order_code,
    images: (order.items ?? []).map(item => item.product_image).filter((src): src is string => Boolean(src)),
    items: (order.items ?? []).map(item => ({
      id: item.id,
      title: item.product_name ?? '',
      image: item.product_image ?? '',
      seller: item.seller_title ?? '',
      quantity: item.quantity ?? 0,
      price: money(item.unit_price),
      badge: itemLabels[item.fulfillment_status] ?? '',
    })),
    total: money(order.total),
    status: STATUS_CODE[order.status] ?? 'created',
    statusLabel: labels[order.status] ?? '',
    date: orderDate(order.created_at),
    deliveryType: 'courier',
    expectedAt: order.estimated_delivery_date ? orderDate(order.estimated_delivery_date) : undefined,
    // Плоские поля (не `delivery: {...}`) — `OrderDetail` расширяет `OrderCard`
    // без вложенности, см. #shared/types/order.
    address,
    recipient: order.recipient_name ?? '',
    recipientPhone: order.recipient_phone ?? '',
    paymentLabel: order.payment_method ?? '',
    // Отдельной строки доставки бэкенд не считает — она уже внутри total.
    deliveryPrice: money(0),
    // «Курьер или продавец» — в модели доставки платформы это продавец
    // первой строки заказа; отдельной сущности курьера у бэкенда нет.
    courier: {
      name: first?.seller_owner_name || first?.seller_title || '',
      phone: first?.seller_phone ?? '',
    },
    /*
     * Бэкенд пока не отдаёт разрешённые действия — `/cancel` и `/repeat`
     * реализованы только в слое моков (layers/api-mock), реального прокси
     * к zoo-backend для них нет. Показать кнопку значило бы соврать: тап
     * выглядел бы успешным (мок отвечает 200), а настоящий заказ бы не
     * менялся. Поэтому здесь включён только «review» — он не пишет ничего,
     * просто ведёт на статическую страницу отзывов.
     */
    actions: STATUS_CODE[order.status] === 'delivered' ? ['review'] : [],
  })
})
