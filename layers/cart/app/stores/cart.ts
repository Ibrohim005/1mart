import { defineStore } from 'pinia'
import type { Cart, CartSummary } from '#shared/types/cart'
import type { Id } from '#shared/types/catalog'
import type { Access } from '#shared/types/company'

/**
 * Корзина живёт в Pinia, а не в localStorage: у авторизованного пользователя
 * она должна совпадать между устройствами. Гостевую корзину бэкенд связывает
 * с installId (заголовок X-IID) и при логине мержит с пользовательской.
 */
export const useCartStore = defineStore('cart', () => {
  const api = useApi()
  const toast = useToast()
  const { t } = useI18n()
  const { money } = useMoney()
  const { data: access } = useNuxtData<Access | null>('company:access')

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
  /**
   * Корзина у компании общая: закупщик видит в ней и чужие заявки. Карточке
   * товара нужно только своё — сколько заявил я сам, иначе «+» на карточке
   * правил бы чужую строку.
   */
  function syncQuantities(cart: Cart) {
    const me = access.value?.employee.id
    const own = cart.items.filter(item => !item.requestedBy || item.requestedBy.employeeId === me)
    quantities.value = Object.fromEntries(own.map(item => [item.skuId, item.quantity]))
  }

  /**
   * Отказы сервера по правилам компании — понятным текстом, а не общей ошибкой:
   * закрытая отделу категория, превышенный лимит, роль без права заявлять.
   * Возвращает false, если отказ был и показан.
   */
  function explain(error: unknown) {
    const first = (error as { data?: Array<{ code: string, details?: { left?: number } }> }).data?.[0]
    if (first?.code === 'category_forbidden') toast.show(t('org.cart.categoryForbidden'), 'error')
    else if (first?.code === 'limit_exceeded') toast.show(t('org.cart.limitExceeded', { left: money({ amount: Number(first.details?.left ?? 0), currency: 'UZS' }) }), 'error')
    else if (first?.code === 'requests_forbidden') toast.show(t('org.cart.requestsForbidden'), 'error')
    else throw error
    return false
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

  /** Положить товар — это заявка от моего имени. false — сервер отказал, причина уже показана */
  async function addItem(skuId: Id, quantity = 1): Promise<boolean> {
    try {
      summary.value = await api.post<CartSummary>('/cart/items', { skuId, quantity })
    }
    catch (error) {
      return explain(error)
    }
    await loadDetail()
    return true
  }

  /** lineId — строка чужой заявки (правит закупщик); без него — своя строка этого SKU */
  async function setQuantity(skuId: Id, quantity: number, lineId?: Id): Promise<boolean> {
    try {
      summary.value = await api.put<CartSummary>('/cart/items', { skuId, quantity, lineId })
    }
    catch (error) {
      return explain(error)
    }
    if (detail.value) await loadDetail()
    return true
  }

  /** Галочка на позициях; тем же методом работает «Выбрать все». Ключи — строки корзины */
  async function setSelected(lineIds: Id[], selected: boolean) {
    await api.patch('/cart/items', { lineIds, selected })
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


  async function removeItem(skuId: Id, lineId?: Id) {
    await api.delete('/cart/items', { skuId, lineId })
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
