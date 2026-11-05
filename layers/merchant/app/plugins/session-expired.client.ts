/**
 * Сеанс истёк: API ответил 401. Раньше страницы показывали «пока пусто»,
 * а продавец думал, что данные пропали. Теперь ведём на вход и возвращаем обратно.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const hook = nuxtApp.hook as unknown as (name: string, fn: () => void) => void

  hook('api:unauthorized', () => {
    nuxtApp.runWithContext(() => {
      const route = useRouter().currentRoute.value
      if (route.path.endsWith('/login')) return

      useMerchantStore().sessionExpired()
      navigateTo({
        path: useNuxtApp().$localePath('/login'),
        query: { next: route.fullPath, expired: '1' },
      }, { replace: true })
    })
  })
})
