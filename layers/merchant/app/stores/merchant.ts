import { defineStore } from 'pinia'
import type { MerchantUser } from '#shared/types/merchant'

/**
 * Текст ошибки из ответа сервера (как в auth-сторе витрины): русский текст
 * бэкенда лежит в теле (`message`), а не в ASCII-строке статуса.
 */
function errorText(error: unknown, fallback: string): string {
  const failed = error as { data?: { message?: string }, statusMessage?: string }
  return failed.data?.message || failed.statusMessage || fallback
}

/**
 * Сессия кабинета продавца. Для отрисовки держим имя/магазин/роль в cookie,
 * читаемой из JS (как `paylov_auth` на витрине). Настоящую пару токенов ставит
 * сервер отдельными httpOnly-cookie — здесь их нет намеренно, иначе кабинет
 * не знал бы, кого рисовать в шапке. Cookie читается и на сервере, поэтому
 * защищённые страницы рисуются при SSR без «прыжка» на гидратации.
 */
export const useMerchantStore = defineStore('merchant', () => {
  const cookie = useCookie<MerchantUser | null>('paylov_biz', {
    default: () => null,
    sameSite: 'lax',
    secure: !import.meta.dev,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  // Клиент API создаётся в setup стора: useApi() тянет язык через useI18n(),
  // а тот жив только при инстансе компонента. Middleware поднимает стор без
  // компонента — там клиента нет, но сеть оттуда и не нужна (проверяем cookie).
  const api = getCurrentInstance() ? useApi() : null
  function client() {
    if (!api) throw new Error('API-клиент недоступен вне компонента')
    return api
  }

  const user = computed(() => cookie.value)
  const isLoggedIn = computed(() => cookie.value !== null)
  const company = computed(() => cookie.value?.company ?? null)

  async function signIn(phone: string, password: string): Promise<string | null> {
    try {
      const signed = await client().post<MerchantUser>('/merchant/auth/login', { phone, password })
      cookie.value = signed
      return null
    }
    catch (error) {
      return errorText(error, 'Ошибка входа')
    }
  }

  async function logout() {
    try {
      await client().post('/merchant/auth/logout')
    }
    catch {
      // Сеанс закрываем всё равно — кнопка «выйти» не должна зависеть от сети.
    }
    cookie.value = null
  }

  /** Сеанс истёк на сервере: выходить запросом уже незачем */
  function sessionExpired() {
    cookie.value = null
  }

  /** Новое название магазина сразу видно в шапке */
  function renameShop(shopName: string) {
    if (cookie.value) cookie.value = { ...cookie.value, company: { ...cookie.value.company, shopName } }
  }

  return { user, isLoggedIn, company, signIn, logout, sessionExpired, renameShop }
})
