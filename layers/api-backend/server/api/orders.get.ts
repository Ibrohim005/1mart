import type { Paged } from '#shared/types/catalog'
import type { OrderCard } from '#shared/types/order'
import { money } from '../lib/money'
import { paging } from '../utils/paging'

/**
 * «Мои заказы» — `GET /shop/orders/` (MyOrderListAPIView + MyOrderListSerializer).
 * Вьюха пагинирована по умолчанию проекта, поэтому разворачиваем `items()`,
 * а не берём ответ массивом.
 *
 * Вкладки. Бэкенд знает единственный фильтр `?status=active` («ещё не
 * доставлен и не отменён»); «истории» у него нет. Вкладку «история» фронт и
 * так рисует транзакциями, а не заказами, поэтому здесь она просто
 * отфильтровывает завершённые из уже полученной СТРАНИЦЫ — фильтр локальный,
 * и на второй странице он не заменяет серверного.
 */
interface UpstreamOrderItem {
  id: string
  product_name: string | null
  product_image: string | null
  seller_title: string | null
  quantity: number
  unit_price: string
  fulfillment_status: string
}

interface UpstreamOrder {
  id: string
  order_code: string
  status: string
  total: string
  items: UpstreamOrderItem[]
  created_at: string
}

// Подписи статусов и формат даты общие со страницей одного заказа —
// см. server/utils/orderLabels.ts (карточка и деталка не должны расходиться).

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const query = getQuery(event) as Record<string, unknown>
  const page = paging(query)
  const locale = (getHeader(event, 'accept-language') || 'uz').split('-')[0]!
  const labels = ORDER_STATUS[locale] ?? ORDER_STATUS.uz!
  const itemLabels = ITEM_STATUS[locale] ?? ITEM_STATUS.uz!

  const tab = String(query.tab ?? 'active')
  const response = await upstream<unknown>(event, '/shop/orders/', {
    auth: true,
    query: {
      limit: page.limit,
      offset: page.offset,
      ...(tab === 'active' ? { status: 'active' } : {}),
    },
  })

  const orders = items<UpstreamOrder>(response)
  // История — локальный фильтр уже полученной страницы (см. комментарий выше),
  // total должен отражать серверный подсчёт по исходному запросу, а не то,
  // сколько строк из него отфильтровалось на этой странице.
  const found = total(response, orders.length)
  const visible = tab === 'history'
    ? orders.filter(order => order.status === 'delivered' || order.status === 'cancelled')
    : orders

  const cards: OrderCard[] = visible.map(order => ({
    id: order.id,
    number: order.order_code,
    images: (order.items ?? []).map(item => item.product_image).filter((src): src is string => Boolean(src)),
    items: (order.items ?? []).map(item => ({
      id: item.id,
      title: item.product_name ?? '',
      // Картинки может не быть вовсе: товар заводят без фото.
      image: item.product_image ?? '',
      // `seller_title` бэкенд отдаёт по каждой строке (MyOrderItemSerializer),
      // и в одном заказе продавцов может быть несколько — в карточке до этого
      // стояло одно имя из файла переводов, одинаковое для всех заказов.
      seller: item.seller_title ?? '',
      quantity: item.quantity ?? 0,
      price: money(item.unit_price),
      badge: itemLabels[item.fulfillment_status] ?? '',
    })),
    total: money(order.total),
    // Машинный код для логики (see orderLabels.ts:STATUS_CODE), готовая подпись — отдельно.
    status: STATUS_CODE[order.status] ?? 'created',
    statusLabel: labels[order.status] ?? '',
    date: orderDate(order.created_at),
    // Пунктов выдачи в этом бэкенде нет — доставка всегда курьером.
    deliveryType: 'courier',
  }))

  return ok<Paged<OrderCard>>({
    items: cards,
    total: found,
    page: page.page,
    perPage: page.perPage,
  })
})
