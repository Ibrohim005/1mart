/**
 * Один вызов в zoo-backend с разворачиванием ЕГО конверта.
 *
 * У бэкенда конверт другой — { success, message, errors } (см.
 * apps/common/exceptions.py), и при ошибке поле `errors` там строка, а не
 * массив объектов. Здесь это приводится к тому виду, который ждёт фронт,
 * один раз, чтобы каждый роут не разбирал чужой формат заново.
 */
export interface UpstreamOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  query?: Record<string, unknown>
  body?: unknown
  /** Пробросить токен покупателя (личные данные, корзина, заказы). */
  auth?: boolean
}

/**
 * Имя cookie с access-токеном. Ставит её только сервер и только `httpOnly`:
 * из браузера токен не читается, поэтому XSS не уносит сеанс.
 */
export const ACCESS_COOKIE = 'zoo_at'
export const REFRESH_COOKIE = 'zoo_rt'

/**
 * Токен берём из cookie, а не из заголовка: браузер шлёт её сам, а на SSR
 * её пробрасывает `useRequestFetch()`. Заголовок остаётся запасным путём —
 * для внешних клиентов, которые ходят в эти роуты напрямую.
 */
function token(event: NitroEvent): string | null {
  // Токен, обновлённый ПО ХОДУ этого же запроса (см. refreshSession):
  // cookie в request остаётся старой, свежий access живёт в context.
  const fresh = (event.context as { zooAccess?: string }).zooAccess
  if (fresh) return `Bearer ${fresh}`
  const cookie = getCookie(event, ACCESS_COOKIE)
  if (cookie) return `Bearer ${cookie}`
  return getHeader(event, 'authorization') || null
}

/**
 * Бэкенд использует `SilentJWTAuthentication`: неверный или отсутствующий
 * токен НЕ даёт 401, запрос просто выполняется от анонима. Поэтому пустую
 * корзину «не вошёл» и пустую корзину «вошёл, но пусто» по ответу не
 * различить — разделять их приходится здесь, до вызова.
 */
export function requireAuth(event: NitroEvent): string {
  const value = token(event)
  if (!value) {
    throw createError({ statusCode: 401, statusMessage: 'Kirish talab qilinadi' })
  }
  return value
}

/**
 * Для корзины: годится либо сеанс, либо идентификатор устройства — гостевую
 * корзину бэкенд теперь держит по `X-Install-Id`. Оформление заказа под это
 * НЕ подпадает и остаётся за `requireAuth`: у заказа должен быть покупатель.
 *
 * Если нет ни того, ни другого — это ошибка клиента, а не пустая корзина.
 * Отдать «пусто» значило бы молча проглатывать всё, что в неё кладут.
 */
export function hasCartOwner(event: NitroEvent): boolean {
  return Boolean(token(event) || getHeader(event, 'x-install-id'))
}

export function requireCartOwner(event: NitroEvent): void {
  if (hasCartOwner(event)) return
  throw createError({ statusCode: 400, statusMessage: 'Savat uchun kirish yoki qurilma identifikatori kerak' })
}

function base(): string {
  const value = useRuntimeConfig().upstreamBase
  if (!value) {
    // Слой не должен подключаться без адреса; если это случилось — падаем
    // громко здесь, а не отдаём пустую страницу молча.
    throw createError({ statusCode: 500, statusMessage: 'NUXT_UPSTREAM_BASE не задан' })
  }
  return String(value).replace(/\/$/, '')
}

/**
 * Ручки, что отдают ТОЛЬКО справочники: названия категорий, бренды, страны,
 * реестр атрибутов. Их ответы для `kaa` переводятся в латиницу.
 *
 * Список именно разрешительный, а не запретительный. В ответах про товары,
 * поиск и заказы лежит текст, который писал продавец: назови он товар
 * по-русски — «Корм для собак» стало бы «Korm dlya sobak». Названия из
 * справочника переведены редакцией и транслитерацию переживают, авторский
 * текст — нет, поэтому сюда попадает только первое.
 */
const DICTIONARY_PATHS = [
  // дерево для страницы категории и диалога выбора — через него приходит
  // заголовок «Иттер», и без него название оставалось кириллицей
  '/market/all-categories',
  '/market/category-animal',
  '/market/product-category',
  '/shop/catalog-filters',
  '/common/regions',
]

export async function upstream<T>(event: NitroEvent, path: string, options: UpstreamOptions = {}): Promise<T> {
  const locale = getHeader(event, 'accept-language') || 'uz'
  const headers: Record<string, string> = {
    'accept': 'application/json',
    // Бэкенд отдаёт переведённые названия по Accept-Language; пробрасываем
    // язык интерфейса, иначе каталог всегда приходил бы на узбекском.
    // `backendLanguage` правит единственное расхождение кодов: сайт зовёт
    // каракалпакский `kaa`, бэкенд — `kk`.
    'accept-language': backendLanguage(locale),
  }
  const latinize = locale.toLowerCase() === 'kaa'
    && DICTIONARY_PATHS.some(prefix => path.startsWith(prefix))
  if (options.auth) {
    const value = token(event)
    if (value) headers.authorization = value
  }
  // Ключ гостевой корзины. Фронт давно слал его в наши /api-роуты, а дальше
  // он терялся — без него бэкенд не знает, чью корзину показывать
  // невошедшему, и корзина до входа была невозможна.
  const install = getHeader(event, 'x-install-id')
  if (install) headers['x-install-id'] = install

  /*
   * Общий секрет SSR. Все запросы уходят с ОДНОГО адреса — сервера Nitro, —
   * и анонимные пер-IP лимиты бэкенда считают их одним посетителем: лимит
   * «5 отправок OTP в час» становится общим на весь сайт, и первые пять
   * регистраций запирают остальных до конца часа (проверено, ловили 429).
   *
   * С этим заголовком бэкенд для OTP и входа считает не по IP, а по номеру
   * телефона — ограничение на человека остаётся ровно тем же. Без ключа всё
   * работает как раньше, просто с общим лимитом.
   */
  const ssrKey = useRuntimeConfig().ssrThrottleKey
  if (ssrKey) headers['x-ssr-key'] = String(ssrKey)

  const send = async () => {
    const data = await $fetch<T>(`${base()}${path}`, {
      method: options.method ?? 'GET',
      query: options.query,
      body: options.body as never,
      headers,
    })
    return latinize ? latinizeDeep(data) : data
  }

  const toError = (error: unknown) => {
    const response = (error as { response?: { status?: number, _data?: unknown } }).response
    const data = response?._data as { message?: string, errors?: unknown, detail?: string } | undefined
    const message
      = data?.message
      || data?.detail
      || (typeof data?.errors === 'string' ? data.errors : null)
      || 'Bekend bilan bog\'lanishda xatolik'

    return createError({
      statusCode: response?.status ?? 502,
      // `statusMessage` rides the HTTP status line, which h3 sanitises to
      // ASCII before it crosses the SSR boundary — a Cyrillic or apostrophed
      // backend message (now localised, see apps.users.LoginView) arrived at
      // the client stripped or empty. `data` is JSON, so it survives intact;
      // callers such as auth.ts's `errorText()` already read `data.message`
      // first for exactly this reason.
      statusMessage: message,
      data: { message },
    })
  }

  try {
    return await send()
  }
  catch (error: unknown) {
    /*
     * Просроченный access-токен. Cookie сеанса живёт 30 дней, JWT внутри —
     * часы: без обновления каждое личное действие «вошедшего» падало бы до
     * повторного входа. Бэкенд сигналит об истёкшем access либо 401, либо
     * 403 с code: "token_expired" (конвенция мобильных клиентов — кабинет
     * продавца обрабатывает те же два случая). Обновляем сеанс по
     * refresh-cookie и повторяем запрос ОДИН раз; не вышло — отдаём исходную
     * ошибку, и фронт показывает вход.
     */
    if (options.auth) {
      const response = (error as { response?: { status?: number, _data?: unknown } }).response
      const code = (response?._data as { code?: string } | undefined)?.code
      const expired = response?.status === 401 || (response?.status === 403 && code === 'token_expired')
      if (expired) {
        const access = await refreshSession(event)
        if (access) {
          headers.authorization = `Bearer ${access}`
          try {
            return await send()
          }
          catch (retryError: unknown) {
            throw toError(retryError)
          }
        }
      }
    }
    throw toError(error)
  }
}

/**
 * Список из бэкенда: часть вьюх пагинированы, часть нет
 * (`pagination_class` задан по-вьюшно), поэтому один и тот же по виду вызов
 * возвращает то массив, то { count, results }. Предположение здесь уже
 * ломало кабинет: guard `Array.isArray(...) ? ... : []` превращал валидный
 * пагинированный ответ в пустой список, и товар нельзя было создать.
 */
export function items<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  const results = (payload as { results?: unknown } | null)?.results
  return Array.isArray(results) ? (results as T[]) : []
}

export function total(payload: unknown, fallback: number): number {
  const count = (payload as { count?: unknown } | null)?.count
  return typeof count === 'number' ? count : fallback
}

/**
 * В проекте две копии h3 (своя и внутри @nuxt/nitro-server), и явный
 * `import type { H3Event } from 'h3'` тянул не ту — типы событий расходились
 * на каждом вызове. Берём тип от самого defineEventHandler: он всегда из той
 * копии, которую реально использует Nitro.
 */
export type NitroEvent = Parameters<Parameters<typeof defineEventHandler>[0]>[0]
