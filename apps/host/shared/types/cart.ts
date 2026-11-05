import type { Id, Money, ProductCard, Seller } from './catalog'

export interface CartItem {
  id: Id
  productId: Id
  /**
   * Ключ строки для всех изменений корзины. У мока это число, у zoo-backend —
   * UUID варианта, поэтому число здесь означало бы `Number(uuid)` → NaN.
   */
  skuId: Id
  product: ProductCard
  /** Опции выбранного SKU, чтобы показать «Вкус: курица, 2 кг» */
  skuOptions: Array<{ title: string, value: string }>
  quantity: number
  /** Максимум, который можно заказать (остаток склада) */
  maxQuantity: number
  price: Money
  fullPrice: Money | null
  selected: boolean
  seller: Seller
}

/** Группа доставки в корзине: «Доставка 1mart», «Доставка продавца» */
export interface CartGroup {
  id: string
  /** Мелкая надпись над заголовком */
  kicker: string
  /** «Доставим завтра», «Привезёт продавец до 26 августа» */
  title: string
  items: CartItem[]
}

export interface Cart {
  /** Товары, сгруппированные по способу доставки */
  groups: CartGroup[]
  items: CartItem[]
  /** Сумма выбранных позиций без скидок */
  subtotal: Money
  discount: Money
  deliveryPrice: Money
  total: Money
  selectedCount: number
}

export interface CartSummary {
  count: number
  total: Money
}
