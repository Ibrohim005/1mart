/**
 * Выход. Настоящий бэкенд снимет httpOnly-cookie с токенами; в моках просто ок.
 * TODO: Connect to backend endpoint POST /merchant/auth/logout
 */
export default defineEventHandler(() => ok({ ok: true }))
