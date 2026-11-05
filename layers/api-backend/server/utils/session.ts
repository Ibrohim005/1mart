import { ACCESS_COOKIE, REFRESH_COOKIE, type NitroEvent } from './upstream'

/**
 * Открыть сеанс браузера по паре токенов из бэкенда.
 *
 * Сеанс открывают три роута — вход, подтверждение регистрации и
 * восстановление пароля, — и политика cookie у них обязана совпадать.
 * Пока блок стоял только во входе, это было незаметно; с тремя копиями
 * достаточно было бы разойтись в одном флаге (`httpOnly`, `secure`), чтобы
 * один из путей открывал сеанс слабее остальных.
 *
 * `maxAge` у cookie и срок жизни самого JWT — разные вещи; ставим по сроку
 * refresh-токена, потому что access переживёт только его первую половину,
 * а перелогинивать на каждый истёкший access не нужно.
 */
export interface UpstreamTokens {
  access: string
  refresh: string
}

export function openSession(event: NitroEvent, tokens: UpstreamTokens): void {
  const shared = { httpOnly: true, sameSite: 'lax' as const, secure: !import.meta.dev, path: '/' }
  setCookie(event, ACCESS_COOKIE, tokens.access, { ...shared, maxAge: 60 * 60 * 24 * 30 })
  setCookie(event, REFRESH_COOKIE, tokens.refresh, { ...shared, maxAge: 60 * 60 * 24 * 30 })
}

/**
 * Бэкенд ждёт номер цифрами с кодом страны, фронт шлёт «+998 90 123-45-67».
 *
 * Нормализация обязана быть ОДНА на все роуты авторизации: пользователя в
 * бэкенде заводит `verify-otp` из номера, который пришёл в `send-otp`, а
 * `forgot-password/request` ищет его сравнением строк один в один
 * (`User.objects.filter(phone_number=value)`, без нормализации). Разойдись
 * тут регистрация с восстановлением хоть пробелом — номер «не найден».
 */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits.startsWith('998') ? `+${digits}` : `+998${digits}`
}

/**
 * Обновить access-токен по refresh-cookie.
 *
 * Cookie сеанса живёт 30 дней, а JWT внутри неё — часы. Без обновления
 * «вошедший» пользователь через пару часов получал 401 на каждое личное
 * действие (избранное, корзина, заказ) и бесконечные тосты «не удалось
 * сохранить» — при живом refresh-токене рядом. Зовётся из upstream() при
 * первом истёкшем access и перезаписывает обе cookie той же политикой,
 * что и вход (openSession — единственное место с флагами cookie).
 *
 * Эндпоинт живёт ВНЕ /api/v1 — /api/token/refresh/ (та же особенность
 * учтена в кабинете продавца, см. zoo-cabinet TOKEN_REFRESH_URL).
 */
export async function refreshSession(event: NitroEvent): Promise<string | null> {
  /*
   * Один HTTP-запрос может сделать НЕСКОЛЬКО личных вызовов в бэкенд
   * (favorites.post.ts зовёт toggle дважды). Cookie в request при этом не
   * меняется: setCookie пишет только в response. Второй вызов читал бы
   * старый refresh — а бэкенд ротирует refresh-токены и заносит старый в
   * чёрный список, то есть второе обновление по той же cookie невозможно.
   * Поэтому обновление на запрос одно (single-flight promise), а свежая
   * пара кладётся в event.context, откуда её читает token().
   */
  const ctx = event.context as { zooRefresh?: Promise<string | null> }
  ctx.zooRefresh ??= doRefresh(event)
  return ctx.zooRefresh
}

async function doRefresh(event: NitroEvent): Promise<string | null> {
  const refresh = getCookie(event, REFRESH_COOKIE)
  if (!refresh) return null

  const api = String(useRuntimeConfig().upstreamBase ?? '')
  if (!api) return null
  const url = api.replace(/\/api\/v1\/?$/, '/api/token/refresh/')

  try {
    const tokens = await $fetch<{ access: string, refresh?: string }>(url, {
      method: 'POST',
      body: { refresh },
    })
    if (!tokens?.access) return null
    // Без ротации бэкенд возвращает только access — refresh остаётся прежним
    openSession(event, { access: tokens.access, refresh: tokens.refresh ?? refresh })
    event.context.zooAccess = tokens.access
    return tokens.access
  }
  catch {
    // Просроченный или отозванный refresh: сеанс истёк по-настоящему,
    // пусть вызывающий отдаст исходный 401 — фронт покажет вход.
    return null
  }
}
