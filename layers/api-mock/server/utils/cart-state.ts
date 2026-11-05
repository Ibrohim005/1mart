import { productCards } from '../../mocks/data'
import type { Id } from '#shared/types/catalog'
import type { MockEvent } from './visitor'
import { perVisitor } from './visitor'

/**
 * Номер SKU в моке выводится из номера карточки — та же формула, что в
 * mocks/data.ts. Это собственный счётчик мока: у настоящего бэкенда SKU
 * приходит отдельным UUID и вычислять его неоткуда.
 */
const skuOf = (productId: Id) => Number(productId) * 10 + 1

/**
 * Состояние мок-корзины. Один источник правды для /cart, /cart/summary
 * и всех изменений — иначе счётчик в шапке и содержимое корзины расходятся.
 *
 * Состояние своё у каждого посетителя: раньше корзина была одна на весь
 * процесс, и двое, открывших демо одновременно, мешали друг другу.
 */
interface CartState {
  quantities: Map<number, number>
  /** Снятые галочки: по умолчанию выбрано всё, что лежит в корзине */
  unselected: Set<number>
}

/** Стартовое наполнение — две позиции, как на макете корзины */
function seed(): CartState {
  const quantities = new Map<number, number>()
  for (const product of productCards.slice(0, 2))
    quantities.set(skuOf(product.id), 1)

  return { quantities, unselected: new Set<number>() }
}

const carts = perVisitor<CartState>(seed)

export function cartState(event: MockEvent) {
  return carts.get(event)
}

export function cartEntries(event: MockEvent) {
  return [...cartState(event).quantities.entries()]
    .filter(([, quantity]) => quantity > 0)
    .map(([skuId, quantity]) => ({
      skuId,
      quantity,
      // Идентификатор варианта — `id товара * 10 + номер варианта`.
      // Раньше искали только первый вариант через `skuOf(item.id) === skuId`
      // (которая всегда считает вариант 1), и всё остальное молча пропадало
      // из корзины: человек клал «256 ГБ», а строка не появлялась.
      product: productCards.find(item => item.id === Math.floor(skuId / 10)),
    }))
    .filter((entry): entry is { skuId: number, quantity: number, product: typeof productCards[0] } =>
      Boolean(entry.product))
}

export function addToCart(event: MockEvent, skuId: number, quantity = 1) {
  const state = cartState(event)
  state.quantities.set(skuId, (state.quantities.get(skuId) ?? 0) + quantity)
}

export function setQuantity(event: MockEvent, skuId: number, quantity: number) {
  if (quantity <= 0) removeFromCart(event, skuId)
  else cartState(event).quantities.set(skuId, quantity)
}

export function removeFromCart(event: MockEvent, skuId: number) {
  const state = cartState(event)
  state.quantities.delete(skuId)
  state.unselected.delete(skuId)
}

export function setSelected(event: MockEvent, skuIds: number[], selected: boolean) {
  const { unselected } = cartState(event)
  for (const skuId of skuIds) {
    if (selected) unselected.delete(skuId)
    else unselected.add(skuId)
  }
}

export function isSelected(event: MockEvent, skuId: number) {
  return !cartState(event).unselected.has(skuId)
}

/** Счётчик в шапке — сумма штук по выбранным и невыбранным позициям */
export function cartSummary(event: MockEvent) {
  const entries = cartEntries(event)
  const count = entries.reduce((acc, entry) => acc + entry.quantity, 0)
  const total = entries
    .filter(entry => isSelected(event, entry.skuId))
    .reduce((acc, entry) => acc + entry.product.price.amount * entry.quantity, 0)

  return { count, total: { amount: total, currency: 'UZS' as const } }
}

export function resetCart(event: MockEvent) {
  carts.drop(event)
}
