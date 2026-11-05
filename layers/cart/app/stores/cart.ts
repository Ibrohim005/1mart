import { defineStore } from 'pinia'
import type { Cart, CartSummary } from '#shared/types/cart'
import type { Id } from '#shared/types/catalog'

/**
 * Корзина живёт в Pinia, а не в localStorage: у авторизованного пользователя
 * она должна совпадать между устройствами. Гостевую корзину бэкенд связывает
 * с installId (заголовок X-IID) и при логине мержит с пользовательской.
 */
export const useCartStore = defineStore('cart', () => {
  const api = useApi()

  const summary = ref<CartSummary>({ count: 0, total: { amount: 0, currency: 'UZS' } })
  const detail = ref<Cart | null>(null)
  const pending = ref(false)

  const count = computed(() => summary.value.count)

  /**
   * Сколько штук этого SKU уже в корзине — нужно карточке товара.
   * Номер SKU здесь только ключ: у мока это число, у бэкенда — UUID.
   */
  const quantities = ref<Record<Id, number>>({})
  function quantityOf(skuId: Id) {
    return quantities.value[skuId] ?? 0
  }
  function syncQuantities(cart: Cart) {
    quantities.value = Object.fromEntries(cart.items.map(item => [item.skuId, item.quantity]))
  }

  async function loadSummary() {
    summary.value = await api.get<CartSummary>('/cart/summary')
  }

  /**
   * Карточкам товара нужно знать, что уже лежит в корзине.
   * Грузим состав один раз на страницу, а не на каждую карточку.
   */
  let detailRequest: Promise<void> | null = null
  function ensureDetail() {
    if (detail.value) return Promise.resolve()
    detailRequest ??= loadDetail().finally(() => { detailRequest = null })
    return detailRequest
  }

  async function loadDetail() {
    pending.value = true
    try {
      detail.value = await api.get<Cart>('/cart')
      syncQuantities(detail.value)
    }
    finally {
      pending.value = false
    }
  }

  async function addItem(skuId: Id, quantity = 1) {
    summary.value = await api.post<CartSummary>('/cart/items', { skuId, quantity })
    await loadDetail()
  }

  async function setQuantity(skuId: Id, quantity: number) {
    summary.value = await api.put<CartSummary>('/cart/items', { skuId, quantity })
    if (detail.value) await loadDetail()
  }

  /** Галочка на позиции; тем же методом работает «Выбрать все» */
  async function setSelected(skuIds: Id[], selected: boolean) {
    await api.patch('/cart/items', { skuIds, selected })
    await Promise.all([loadDetail(), loadSummary()])
  }

  /**
   * Сердце переключает избранное и только его.
   *
   * Раньше нажатие уносило товар в избранное и одновременно удаляло строку
   * из корзины — рядом с настоящей кнопкой удаления это читалось как вторая
   * кнопка удаления. Сердце ничего не удаляет.
   */
  async function toggleFavorite(productId: Id, next: boolean) {
    if (next) await api.post('/favorites', { productId })
    else await api.delete('/favorites', { productId })
  }


  async function removeItem(skuId: Id) {
    await api.delete('/cart/items', { skuId })
    await Promise.all([loadDetail(), loadSummary()])
  }

  return {
    summary,
    detail,
    pending,
    count,
    quantityOf,
    ensureDetail,
    loadSummary,
    loadDetail,
    addItem,
    setQuantity,
    setSelected,
    removeItem,
    toggleFavorite,
  }
})
