/**
 * Начало входа через OneID. В бою бэкенд отдаёт адрес авторизации
 * sso.egov.uz с client_id и redirect_uri площадки; OneID возвращает
 * человека на /register?oneid=…. Мок ведёт на ту же страницу сразу.
 * TODO: Connect to backend endpoint GET /auth/oneid/start
 */
export default defineEventHandler(() => ok({ url: '/register?oneid=demo-oneid-code' }))
