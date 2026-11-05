/**
 * Разрешает картинки с бэкенда в Content-Security-Policy.
 *
 * ЧТО БЫЛО СЛОМАНО
 *   `img-src 'self' data: blob: https://tile.openstreetmap.org` в routeRules
 *   (apps/host/nuxt.config.ts) писался тогда, когда все картинки лежали
 *   рядом с фронтом. Бэкенд отдаёт их со своего адреса — в деве это
 *   http://localhost:8020/media/..., то есть другой origin. В результате
 *   собственная политика сайта блокировала КАЖДУЮ фотографию товара и
 *   категории: 32 нарушения CSP и 0 загруженных картинок на главной.
 *   Снаружи это выглядит не как политика безопасности, а как «на сайте
 *   пропали все фото» — с чего и начались жалобы.
 *
 * ПОЧЕМУ ЗАГОЛОВОК СТАВИТСЯ ЗДЕСЬ, А НЕ В routeRules
 *   routeRules вычисляются при СБОРКЕ, а `upstreamBase` — это
 *   runtimeConfig, то есть переменная окружения на СТАРТЕ. Вписав origin в
 *   nuxt.config, мы бы зашили адрес того окружения, где собирали образ:
 *   один и тот же контейнер, запущенный с другим NUXT_UPSTREAM_BASE, снова
 *   молча остался бы без картинок, и найти это было бы нечем — в консоли
 *   браузера пользователя, а не в логах.
 *
 *   Поэтому origin читается на каждый ответ, из того же значения, которым
 *   пользуется `upstream()`. Разъехаться они не могут по построению.
 *
 * ГРАНИЦЫ
 *   Слой подключается только при заданном NUXT_UPSTREAM_BASE, так что на
 *   моках политика остаётся прежней, узкой. Расширяется ровно `img-src` и
 *   ровно одним origin — не `*`, не `default-src`.
 */

/** «http://localhost:8020/api/v1» → «http://localhost:8020». */
function originOf(base: string): string | null {
  try {
    return new URL(base).origin
  }
  catch {
    // Пустая или относительная база — расширять нечего: картинки тогда
    // приходят со своего же origin и уже разрешены.
    return null
  }
}

export default defineNitroPlugin((nitro) => {
  /*
   * `beforeResponse`, а не `render:response`: заголовки из routeRules Nitro
   * ставит прямо в ответ H3, а не в объект, который отдаёт хук рендера, —
   * правка там просто терялась (проверено, заголовок не менялся).
   */
  nitro.hooks.hook('beforeResponse', (event) => {
    const origin = originOf(useRuntimeConfig(event).upstreamBase)
    if (!origin) return

    const current = getResponseHeader(event, 'content-security-policy')
    if (typeof current !== 'string' || !current) return

    // Дописываем в существующую директиву, а не добавляем вторую: при двух
    // img-src браузер применяет первую, и расширение молча не сработает.
    const widened = current.replace(
      /(^|;\s*)img-src([^;]*)/i,
      (match, prefix, sources) => (sources.includes(origin) ? match : `${prefix}img-src${sources} ${origin}`),
    )
    if (widened !== current) setResponseHeader(event, 'content-security-policy', widened)
  })
})
