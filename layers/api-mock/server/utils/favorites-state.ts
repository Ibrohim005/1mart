import { productCards } from '../../mocks/data'
import type { Id } from '#shared/types/catalog'
import type { MockEvent } from './visitor'
import { perVisitor } from './visitor'

/**
 * Избранное в памяти сервера. Изначально — пять карточек из макета.
 *
 * Берём их начиная с третьей: первые две засеяны в корзину, и при пересечении
 * «в избранное» из корзины ничего не меняло — товар там уже лежал, и кнопка
 * выглядела так, будто просто удаляет строку.
 *
 * Как и корзина, состояние своё у каждого посетителя.
 */
const SEED = productCards.slice(2, 7)

/**
 * Ключи храним строками: множеству нужна только тождественность, а id товара
 * бывает и числом мока, и UUID бэкенда — Set<number> не нашёл бы в избранном
 * товар, номер которого приехал в запросе строкой.
 */
const key = (productId: Id) => String(productId)

const favorites = perVisitor<Set<string>>(() => new Set(SEED.map(product => key(product.id))))

export function favoriteItems(event: MockEvent) {
  const ids = favorites.get(event)
  return productCards.filter(product => ids.has(key(product.id)))
}

export function isFavorite(event: MockEvent, productId: Id) {
  return favorites.get(event).has(key(productId))
}

export function addFavorite(event: MockEvent, productId: Id) {
  favorites.get(event).add(key(productId))
}

export function removeFavorite(event: MockEvent, productId: Id) {
  favorites.get(event).delete(key(productId))
}

export function resetFavorites(event: MockEvent) {
  favorites.drop(event)
}
