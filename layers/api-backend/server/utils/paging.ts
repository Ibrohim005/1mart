/**
 * Пагинация: фронт говорит page/perPage, бэкенд понимает limit/offset
 * (LimitOffsetPagination на всём проекте, `?page` там не работает вовсе —
 * он молча игнорируется и всегда возвращается первая страница).
 */
export interface Paging {
  limit: number
  offset: number
  page: number
  perPage: number
}

const DEFAULT_PER_PAGE = 20
const MAX_PER_PAGE = 100

export function paging(query: Record<string, unknown>): Paging {
  const page = Math.max(1, positive(query.page) || 1)
  // Потолок: perPage приходит из адресной строки, и без ограничения
  // ?perPage=100000 превратился бы в запрос всего каталога.
  const perPage = Math.min(MAX_PER_PAGE, positive(query.perPage) || DEFAULT_PER_PAGE)
  return { limit: perPage, offset: (page - 1) * perPage, page, perPage }
}

function positive(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0
}
