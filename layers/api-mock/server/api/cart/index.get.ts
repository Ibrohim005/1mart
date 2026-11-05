import type { MockEvent } from '../../utils/visitor'
import type { Cart, CartItem } from '#shared/types/cart'
import { cartEntries, isSelected } from '../../utils/cart-state'
import type { productCards } from '../../../mocks/data';
import { findProduct, sellerFor } from '../../../mocks/data'

/** Выбранный вариант товара: его состав, цена и остаток */
function skuFor(product: typeof productCards[0], skuId: number) {
  const detail = findProduct(product.slug)
  return detail?.skus.find(item => item.id === skuId) ?? detail?.skus[0] ?? null
}

type Entry = ReturnType<typeof cartEntries>[0]

function toItem(event: MockEvent, entry: Entry, index: number): CartItem {
  const sku = skuFor(entry.product, entry.skuId)

  return {
    // Номер строки — собственный автоинкремент мока: своего id у позиции
    // корзины здесь нет, а у бэкенда это отдельный UUID строки.
    id: index + 1,
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
    selected: isSelected(event, entry.skuId),
    seller: sellerFor(entry.product.id),
  }
}

export default defineEventHandler((event) => {
  const entries = cartEntries(event)
  const items = entries.map((entry, index) => toItem(event, entry, index))

  // Первая позиция едет со склада 1mart, остальные — от продавца.
  // В группах только выбранное, как у бэкенда: иначе снятый товар виден дважды.
  const selectedOnly = (list: typeof items) => list.filter(item => item.selected)
  const groups = [
    {
      id: 'paylov-market',
      kicker: 'Доставка 1mart',
      title: 'Доставим завтра',
      items: selectedOnly(items.slice(0, 1)),
    },
    {
      id: 'seller',
      kicker: 'Доставка продавца',
      title: 'Привезёт продавец в течение недели',
      items: selectedOnly(items.slice(1)),
    },
  ].filter(group => group.items.length)

  const chosen = items.filter(item => item.selected)
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
  }

  return ok(cart)
})
