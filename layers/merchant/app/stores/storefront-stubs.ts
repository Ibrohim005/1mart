import { defineStore } from 'pinia'

/**
 * Заглушки сторов витрины для бизнес-приложения.
 *
 * Дизайн-система `@zoo/shared` рассчитана на витрину: её `ProductCard`
 * обращается к `useCartStore`, а `useFavorite` — к `useAuthStore`. Кабинет
 * продавца эти компоненты не использует, но слой `@zoo/shared` всё равно
 * компилируется целиком, и без этих имён сборка падает с «Cannot find name».
 *
 * Здесь — минимальные безопасные реализации того же интерфейса. Они никогда
 * не вызываются в кабинете (корзины и избранного у продавца нет); нужны лишь
 * чтобы дизайн-система собиралась в этом приложении. Сессию продавца держит
 * отдельный стор — `useMerchantStore`.
 */

export const useCartStore = defineStore('cart-stub', () => {
  function ensureDetail() {}
  function quantityOf(_skuId: string | number): number { return 0 }
  async function addItem(_skuId: string | number, _qty = 1) {}
  async function setQuantity(_skuId: string | number, _qty: number) {}
  return { ensureDetail, quantityOf, addItem, setQuantity }
})

export const useAuthStore = defineStore('auth-stub', () => {
  const isLoggedIn = computed(() => false)
  function requireAuth(): boolean { return false }
  function sessionExpired() {}
  return { isLoggedIn, requireAuth, sessionExpired }
})
