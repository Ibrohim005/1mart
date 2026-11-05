import type { ApiError, ApiResponse } from '#shared/types/api'

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
