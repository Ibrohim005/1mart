import type { Id, Money, ProductCard, Seller } from './catalog'
import type { Requester } from './company'

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
  /** null — продавец скрыт от покупателя (по умолчанию), см. Product.seller */
  seller: Seller | null
  /**
   * Кто заявил позицию. Корзина у компании общая: сотрудник кладёт товар —
   * это его заявка, закупщик видит имя и роль и решает, оформлять ли.
   * null — корзина без компании (гость) или бэкенд ещё не знает автора.
   */
  requestedBy: Requester | null
}

/** Группа корзины: у закупщика — заявки одного сотрудника, у остальных — способ доставки */
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
  /**
   * Может ли этот пользователь оформить заказ. Сотрудник без права одобрения
   * только заявляет: его позиции видит закупщик, а кнопки «Оформить» у него нет.
   */
  canCheckout: boolean
}

export interface CartSummary {
  count: number
  total: Money
}
