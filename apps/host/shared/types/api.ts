/**
 * Конверт ответа API. Согласован с бэкенд-разработчиком:
 * успешный ответ -> payload заполнен, errors = null.
 */
export interface ApiResponse<T> {
  payload: T | null
  errors: ApiError[] | null
  timestamp: string
  /** trace id для сквозной диагностики между фронтом и бэком */
  trace?: string
}

export interface ApiError {
  code: string
  message: string
  field?: string
  /** Числа для текста ошибки: остаток лимита и подобное (в тийинах) */
  details?: Record<string, number | string>
}
