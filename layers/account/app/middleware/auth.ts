/**
 * Кабинет доступен только вошедшему пользователю.
 * Сеанс лежит в cookie, поэтому проверка одинаково работает на сервере
 * и на клиенте. Гостя уводим на главную с меткой ?auth=1 — по ней
 * шапка открывает диалог входа (при SSR-редиректе состояние стора теряется).
 * TODO: Connect to backend endpoint GET /auth/session
 */
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  if (auth.isLoggedIn) return

  return navigateTo({ path: useLocalePath()('/'), query: { auth: '1' } }, { replace: true })
})
