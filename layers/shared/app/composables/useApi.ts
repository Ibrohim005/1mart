import type { WatchSource } from 'vue'
import type { ApiError, ApiResponse } from '#shared/types/api'

/**
 * Единая точка входа во все запросы к бэкенду.
 *
 * Сейчас `apiBase` = '/api' и запросы уходят в mock-роуты внутри Nuxt.
 * Когда бэкенд будет готов, достаточно выставить NUXT_PUBLIC_API_BASE —
 * ни один вызывающий код менять не придётся.
 *
 * Перехватчики: ко всем запросам добавляются идентификатор устройства
 * и язык интерфейса, ответы разворачиваются из конверта { payload, errors },
 * ошибки приводятся к единому виду.
 */
type RequestBody = Record<string, unknown> | BodyInit | null
type QueryInput = Record<string, unknown> | (() => Record<string, unknown>)

/**
 * Идентификатор установки: гостевую корзину бэкенд связывает именно с ним.
 *
 * Живёт в cookie, а не в localStorage: страницы корзины и оформления рисуются
 * на сервере, и без cookie сервер не знал бы, чью корзину показывать —
 * SSR отдавал бы чужое содержимое, а на гидратации оно бы подменялось.
 */
function installId() {
  const cookie = useCookie<string | null>('paylov_install_id', {
    default: () => null,
    sameSite: 'lax',
    secure: !import.meta.dev,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })

  /*
   * Значение держим в общем состоянии приложения, а не только в cookie.
   *
   * `useCookie` отдаёт каждому вызову свою ссылку, и записанное одним
   * компонентом не видно другому в том же рендере. На первом заходе каждый
   * компонент видел пустую cookie и заводил свой идентификатор: корзина
   * товара уходила в один ящик, а список корзины читался из другого —
   * добавленный товар просто не появлялся.
   */
  const id = useState<string>('zoo-install-id', () => cookie.value ?? '')

  // Минтим и на сервере: useCookie пишет через Set-Cookie у ответа. Если
  // заводить id только в браузере, первый SSR-запрос уходит с пустым
  // x-install-id — бэкенд создаёт для него отдельную гостевую корзину, а
  // клиент затем заводит свой id и вторую, и гостевая корзина терялась при
  // обновлении страницы.
  if (!id.value) {
    id.value = crypto.randomUUID()
    cookie.value = id.value
  }

  return id.value
}

export function useApi() {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()
  const base = config.public.apiBase
  const { locale } = useI18n()
  // Cookie читаем один раз при создании: внутри запроса контекста Nuxt уже нет
  const device = installId()

  /**
   * На сервере ходим через `useRequestFetch()`: он пробрасывает cookie
   * входящего запроса дальше, в наши же /api-роуты. Обычный `$fetch` этого
   * не делает, и защищённые страницы при SSR рисовались бы как для гостя —
   * токен сеанса лежит в `httpOnly` cookie (`zoo_at`), достать его иначе
   * неоткуда. В браузере cookie отправляется сама.
   */
  const fetcher = import.meta.server ? useRequestFetch() : $fetch

  async function request<T>(path: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const res = await fetcher<ApiResponse<T>>(`${base}${path}`, {
      ...options,
      // Перехватчик запроса: общие заголовки для всех вызовов
      headers: {
        'accept': 'application/json',
        'x-install-id': device,
        'accept-language': locale.value,
        ...(options?.headers as Record<string, string> | undefined),
      },
      // Перехватчик ошибки: приводим к одному виду и не глотаем контекст
      onResponseError({ response }) {
        // Кабинет продавца слушает это событие и ведёт на вход; витрине оно не мешает
        if (response.status === 401 && import.meta.client) {
          (nuxtApp.callHook as unknown as (name: string) => Promise<unknown>)('api:unauthorized')
        }
        const errors = (response._data as ApiResponse<never> | undefined)?.errors
        if (errors?.length) {
          throw createError({
            statusCode: response.status,
            statusMessage: errors[0]!.message,
            data: errors,
          })
        }
      },
    })

    if (res.errors?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: res.errors[0]!.message,
        data: res.errors as ApiError[],
      })
    }

    return res.payload as T
  }

  return {
    get: <T>(path: string, query?: Record<string, unknown>) =>
      request<T>(path, { method: 'GET', query }),
    post: <T>(path: string, body?: RequestBody) =>
      request<T>(path, { method: 'POST', body }),
    put: <T>(path: string, body?: RequestBody) =>
      request<T>(path, { method: 'PUT', body }),
    patch: <T>(path: string, body?: RequestBody) =>
      request<T>(path, { method: 'PATCH', body }),
    delete: <T>(path: string, body?: RequestBody) =>
      request<T>(path, { method: 'DELETE', body }),
  }
}

/**
 * SSR-safe обёртка для данных, нужных при первом рендере
 * (важно для SEO: контент должен приходить в HTML, а не догружаться на клиенте).
 *
 * `query` можно передать функцией — тогда при refresh() берутся свежие значения,
 * иначе сортировка и фильтры перезапрашивались бы со старыми параметрами.
 */
export async function useApiData<T>(
  key: string,
  path: string,
  opts: {
    query?: QueryInput
    lazy?: boolean
    server?: boolean
    /** POST нужен расчётам: сумма заказа считается на сервере по телу запроса */
    method?: 'GET' | 'POST'
    body?: Record<string, unknown> | (() => Record<string, unknown>)
    /** Источники, при изменении которых запрос повторяется */
    watch?: (WatchSource | object)[]
  } = {},
) {
  const api = useApi()

  const resolveQuery = () =>
    typeof opts.query === 'function' ? opts.query() : opts.query
  const resolveBody = () =>
    typeof opts.body === 'function' ? opts.body() : opts.body

  return useAsyncData<T>(
    key,
    () => (opts.method === 'POST'
      ? api.post<T>(path, resolveBody())
      : api.get<T>(path, resolveQuery())),
    {
      lazy: opts.lazy,
      server: opts.server ?? true,
      watch: opts.watch,
    },
  )
}
