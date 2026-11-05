/**
 * Кабинет доступен только вошедшему продавцу. Сеанс лежит в cookie, поэтому
 * проверка одинаково работает на сервере и в браузере. Гостя уводим на вход
 * и запоминаем, куда он шёл (`?next=`), чтобы вернуть после входа.
 * TODO: Connect to backend endpoint GET /merchant/auth/session
 */
export default defineNuxtRouteMiddleware((to) => {
  const merchant = useMerchantStore()
  if (merchant.isLoggedIn) return

  const localePath = useLocalePath()
  return navigateTo(
    { path: localePath('/login'), query: { next: to.fullPath } },
    { replace: true },
  )
})
