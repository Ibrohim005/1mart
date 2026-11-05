import type { MockEvent } from './visitor'

/**
 * Код ответа для бизнес-ошибки в конверте `{ payload, errors }`.
 * `setResponseStatus` из авто-импорта типизирован другой копией h3 (см. visitor.ts),
 * поэтому статус ставим напрямую.
 */
export function mockStatus(event: MockEvent, code: number) {
  event.node.res.statusCode = code
}
