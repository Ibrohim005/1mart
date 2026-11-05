/**
 * Выход. Сеанс в моке держит cookie на стороне браузера, серверу закрывать
 * нечего — роут существует, чтобы вызов из стора был одинаковым в обоих
 * режимах и не приходилось ветвить код по наличию бэкенда.
 *
 * TODO: Connect to backend endpoint POST /auth/logout
 */
export default defineEventHandler(() => ok({ loggedOut: true }))
