import type { Paged } from '#shared/types/catalog'

/**
 * Разбор ?page=&perPage= с разумными границами. `event` типизируем
 * ambient-типом Nitro (H3Event), без импорта из 'h3' — в проекте две копии
 * h3 (корневая и внутри nitro-server), и импорт давал конфликт типов.
 */
export function readPaging(event: Parameters<typeof getQuery>[0], defaults = { perPage: 10 }) {
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const perPage = Math.min(100, Math.max(1, Number(q.perPage) || defaults.perPage))
  return { page, perPage }
}

/** Нарезка массива в конверт Paged<T>. */
export function paginate<T>(items: T[], page: number, perPage: number): Paged<T> {
  const start = (page - 1) * perPage
  return {
    items: items.slice(start, start + perPage),
    page,
    perPage,
    total: items.length,
  }
}

/** Регистронезависимое вхождение подстроки — для поиска по спискам. */
export function matches(haystack: string, needle: unknown): boolean {
  const q = String(needle ?? '').trim().toLowerCase()
  if (!q) return true
  return haystack.toLowerCase().includes(q)
}
