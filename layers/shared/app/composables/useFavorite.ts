import type { Id, ProductCard } from '#shared/types/catalog'

/**
 * Сердце «в избранное» на карточке товара и в галерее.
 *
 * До этого оба сердца были чистой декорацией: `isFavorite = !isFavorite` на
 * локальном ref, ноль сетевых запросов — иконка заливалась, а на
 * /account/favorites ничего не появлялось и после перезагрузки всё
 * забывалось. Рабочие роуты /api/favorites существовали, но их звала только
 * корзина («перенести в избранное»).
 *
 * Гостю избранное недоступно (бэкенд отвечает 401) — вместо молчаливого
 * отказа открываем диалог входа, тем же путём, что и «Оформить» в корзине.
 */
export function useFavorite(productId: MaybeRefOrGetter<Id>, initial: MaybeRefOrGetter<boolean | undefined> = false) {
  const auth = useAuthStore()
  const api = useApi()
  const toast = useToast()
  const { t } = useI18n()

  const isFavorite = ref(Boolean(toValue(initial)))
  watch(() => Boolean(toValue(initial)), value => (isFavorite.value = value))

  const pending = ref(false)

  /**
   * Сам список избранного лежит в кеше `useAsyncData` под ключом `favorites`
   * — его читает /account/favorites. Сердце гасло, тост «убрано» появлялся, а
   * карточка оставалась на странице до перезагрузки: выключая флажок, никто
   * не трогал список, из которого эта карточка и взялась.
   *
   * Обратного действия тут нет намеренно. Добавляя товар в избранное со
   * страницы каталога, мы знаем только его id — целой карточки для списка
   * взять неоткуда, и дорисовывать её по кусочкам хуже, чем подтянуть список
   * при следующем заходе.
   */
  const favorites = useNuxtData<ProductCard[]>('favorites')

  async function toggle() {
    if (!auth.requireAuth()) return
    if (pending.value) return
    pending.value = true

    // Оптимистично: сердце должно откликнуться сразу, а не после круга по
    // сети. Ошибка возвращает состояние назад и говорит об этом вслух.
    const next = !isFavorite.value
    isFavorite.value = next

    // Снимок на случай отката: при ошибке карточку надо вернуть на место
    const listBefore = favorites.data.value
    if (!next && Array.isArray(listBefore)) {
      const id = toValue(productId)
      favorites.data.value = listBefore.filter(item => item.id !== id)
    }

    try {
      if (next) {
        await api.post('/favorites', { productId: toValue(productId) })
        toast.show(t('ui.shared.favorite.added'))
      }
      else {
        await api.delete('/favorites', { productId: toValue(productId) })
        toast.show(t('ui.shared.favorite.removed'))
      }
    }
    catch (error) {
      isFavorite.value = !next
      // Удаление не доехало — возвращаем карточку в список
      if (!next) favorites.data.value = listBefore
      // 401 здесь значит не «сбой сохранения», а «сеанс истёк»: сервер уже
      // попытался обновить токен (см. api-backend/upstream.ts) и не смог.
      // Фронт всё ещё считал пользователя вошедшим по cookie zoo_auth —
      // отсюда ливень ложных тостов. Гасим вход и открываем форму, а тост
      // оставляем только настоящим сбоям (сеть, 500).
      if ((error as { statusCode?: number })?.statusCode === 401) {
        auth.sessionExpired()
        return
      }
      toast.show(t('ui.shared.favorite.failed'), 'error')
    }
    finally {
      pending.value = false
    }
  }

  return { isFavorite, toggle, pending }
}
