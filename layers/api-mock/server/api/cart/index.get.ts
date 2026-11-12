import type { MockEvent } from '../../utils/visitor'
import type { Cart, CartItem } from '#shared/types/cart'
import { cartEntries, isSelected } from '../../utils/cart-state'
import { can, membership, requesterOf } from '../../utils/org-state'
import type { productCards } from '../../../mocks/data'
import { findProduct, publicSellerFor } from '../../../mocks/data'

/** Выбранный вариант товара: его состав, цена и остаток */
function skuFor(product: typeof productCards[0], skuId: number) {
  const detail = findProduct(product.slug)
  return detail?.skus.find(item => item.id === skuId) ?? detail?.skus[0] ?? null
}

type Entry = ReturnType<typeof cartEntries>[0]

function toItem(event: MockEvent, entry: Entry): CartItem {
  const sku = skuFor(entry.product, entry.skuId)
  const member = membership(event)
  const author = member?.state.employees.find(item => item.id === entry.employeeId)

  return {
    // Ключ строки «сотрудник|sku»: корзина у компании общая, и закупщик правит
    // чужую заявку по нему, а не по skuId. У бэкенда это UUID строки.
    id: entry.lineId,
    productId: entry.product.id,
    skuId: entry.skuId,
    product: entry.product,
    // Состав варианта берём у самого варианта: раньше в каждой строке
    // стоял состав первого варианта, даже когда выбран другой
    skuOptions: (sku?.options ?? []).map(option => ({ title: option.title, value: option.value })),
    quantity: entry.quantity,
    // Цена варианта, а не товара: у 256 ГБ она своя
    price: sku?.price ?? entry.product.price,
    fullPrice: sku?.fullPrice ?? entry.product.fullPrice,
    maxQuantity: sku?.available ?? 10,
    selected: isSelected(event, entry.lineId),
    seller: publicSellerFor(entry.product.id),
    // В «своей» компании руководитель один — подпись автора там лишняя
    requestedBy: member?.state.shared && author ? requesterOf(member.state, author) : null,
  }
}

/**
 * Корзина компании. Закупщик (requests.approve) видит все заявки, сгруппированные
 * по людям: имя, роль, отдел. Сотрудник видит только свои позиции и оформить
 * заказ не может — `canCheckout: false`.
 */
export default defineEventHandler((event) => {
  const items = cartEntries(event).map(entry => toItem(event, entry))
  const approver = can(event, 'requests.approve')

  // В группах только выбранное, как у бэкенда: иначе снятый товар виден дважды
  const chosen = items.filter(item => item.selected)
  const byRequester = new Map<string, CartItem[]>()
  for (const item of chosen) {
    const key = item.requestedBy ? String(item.requestedBy.employeeId) : 'none'
    byRequester.set(key, [...(byRequester.get(key) ?? []), item])
  }

  const groups = approver && chosen.some(item => item.requestedBy)
    ? [...byRequester.entries()].map(([key, list]) => {
        const author = list[0]!.requestedBy
        return {
          id: `requester-${key}`,
          kicker: [author?.roleTitle, author?.departmentTitle].filter(Boolean).join(' · '),
          title: author?.fullName ?? '',
          items: list,
        }
      })
    // Всё везёт spotshop: забирает у продавцов и доставляет своими курьерами
    : [{ id: 'spotshop', kicker: 'Доставка spotshop', title: 'Доставим завтра', items: chosen }].filter(group => group.items.length)

  const subtotal = chosen.reduce((acc, item) => acc + (item.fullPrice?.amount ?? item.price.amount) * item.quantity, 0)
  const total = chosen.reduce((acc, item) => acc + item.price.amount * item.quantity, 0)

  const cart: Cart = {
    groups,
    items,
    subtotal: { amount: subtotal, currency: 'UZS' },
    discount: { amount: subtotal - total, currency: 'UZS' },
    deliveryPrice: { amount: 0, currency: 'UZS' },
    total: { amount: total, currency: 'UZS' },
    // Единицы, а не строки: рядом стоит сумма за единицы, и подписи расходились
    selectedCount: chosen.reduce((sum, item) => sum + item.quantity, 0),
    canCheckout: approver,
  }

  return ok(cart)
})
