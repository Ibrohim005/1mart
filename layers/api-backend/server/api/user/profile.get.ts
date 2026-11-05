/**
 * Профиль покупателя — `GET /users/my-profile/` (MyProfileView +
 * MyUserProfileSerializer). Оформление заказа берёт отсюда имя и телефон
 * получателя; страница «Настройки» — весь профиль целиком.
 *
 * Это единственный эндпоинт «про себя»: `/users/profile/<uuid>/` отдаёт
 * ПУБЛИЧНЫЙ профиль по id и своего адреса «me» не имеет.
 *
 * Имя у бэкенда одно поле `full_name` и оно вполне может быть пустым
 * (регистрация идёт по номеру телефона) — тогда честно отдаём пустую
 * строку: карточка получателя просто останется незаполненной, и это
 * ровно то, что есть в базе.
 */
interface UpstreamProfile {
  full_name: string | null
  phone_number: string | null
  birth_date: string | null
  gender: 'male' | 'female' | '' | null
  avatar: { original?: string, thumb?: string, small?: string, medium?: string } | null
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const profile = await upstream<UpstreamProfile>(event, '/users/my-profile/', { auth: true })

  return ok({
    name: profile.full_name ?? '',
    phone: profile.phone_number ?? '',
    birthDate: profile.birth_date ?? '',
    gender: profile.gender || '',
    // `medium` — тот же размер, что и всюду в шапке/карточках; аватара
    // может не быть вовсе, тогда честно отдаём пустую строку.
    avatar: profile.avatar?.medium ?? profile.avatar?.original ?? '',
  })
})
