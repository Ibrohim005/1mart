/**
 * Строка, которую подписывает ключ ЭЦП: защищает от повторной отправки старой подписи.
 * TODO: Connect to backend endpoint GET /auth/eimzo/challenge
 */
export default defineEventHandler(() => ok({ challenge: crypto.randomUUID() }))
