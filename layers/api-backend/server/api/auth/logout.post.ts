import { ACCESS_COOKIE, REFRESH_COOKIE } from '../../utils/upstream'

/**
 * Выход: бэкенд `POST /users/logout/` заносит refresh-токен в чёрный список.
 *
 * Cookie снимаем ДО обращения к бэкенду и независимо от его ответа. Если
 * логика была бы обратной, то при недоступном бэкенде (или уже истёкшем
 * refresh, на который logout отвечает 400) пользователь нажимал бы «выйти»
 * и оставался внутри — худший из возможных исходов для кнопки выхода.
 */
export default defineEventHandler(async (event) => {
  const refresh = getCookie(event, REFRESH_COOKIE)

  deleteCookie(event, ACCESS_COOKIE, { path: '/' })
  deleteCookie(event, REFRESH_COOKIE, { path: '/' })

  if (refresh) {
    try {
      await upstream(event, '/users/logout/', { method: 'POST', body: { refresh }, auth: true })
    }
    catch {
      // Токен уже недействителен или бэкенд недоступен. Сеанс в браузере
      // всё равно закрыт — сообщать об этом пользователю нечего.
    }
  }

  return ok({ loggedOut: true })
})
