import type { Access, Permission } from '#shared/types/company'

/**
 * Права гостя: смотреть весь каталог и собирать корзину. Оформить заказ его
 * всё равно попросят войти, поэтому корзина работает как раньше.
 */
const GUEST: Permission[] = ['catalog.all', 'requests.create', 'requests.approve']

const KEY = 'company:access'

function wrap(data: Ref<Access | null | undefined>) {
  return {
    access: computed(() => data.value ?? null),
    /** Можно ли это действие. Подсказка для интерфейса: запрещает всё равно сервер */
    can: (permission: Permission) => (data.value ? data.value.permissions.includes(permission) : GUEST.includes(permission)),
  }
}

/**
 * Кто я в компании и что мне можно: роль, права, открытые категории, лимит.
 * Грузится один раз в корне приложения (app.vue) и перезапрашивается при смене
 * пользователя; остальные компоненты читают готовое через useAccessState().
 */
export async function useAccess() {
  const auth = useAuthStore()
  const api = useApi()
  const result = useAsyncData<Access | null>(
    KEY,
    () => (auth.isLoggedIn ? api.get<Access>('/company/access').catch(() => null) : Promise.resolve(null)),
    { watch: [() => auth.user?.phone], default: () => null },
  )
  await result
  return { ...wrap(result.data), refresh: result.refresh }
}

/** То же без загрузки — для компонентов, которые рисуются внутри уже загруженного приложения */
export function useAccessState() {
  const { data } = useNuxtData<Access | null>(KEY)
  return wrap(data)
}
