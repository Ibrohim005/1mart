import type { ApiError, ApiResponse } from '#shared/types/api'

/**
 * Конверт ответа — тот же, что у витрины (`{ payload, errors }`), чтобы
 * `useApi()` из @zoo/shared разворачивал ответы кабинета без изменений.
 */
export function ok<T>(payload: T): ApiResponse<T> {
  return {
    payload,
    errors: null,
    timestamp: new Date().toISOString(),
    trace: crypto.randomUUID().replace(/-/g, ''),
  }
}

export function fail(errors: ApiError[]): ApiResponse<never> {
  return {
    payload: null,
    errors,
    timestamp: new Date().toISOString(),
    trace: crypto.randomUUID().replace(/-/g, ''),
  }
}
