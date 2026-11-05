/**
 * Сохранение профиля — `PATCH /users/my-profile/` (MyProfileView,
 * `http_method_names = ["get", "patch", ...]`).
 *
 * Телефон и аватар сюда не входят: телефон бэкенд отдаёт read-only (смена
 * номера — отдельный сценарий с OTP, не эта форма), а аватар — свой
 * эндпоинт `PATCH /avatar/upload/` (see `user/avatar.post.ts`) — на
 * `ThumbnailImageField` бэкенд молча игнорирует запись через этот сериализатор.
 */
interface UpdateProfileBody {
  fullName?: string
  birthDate?: string
  gender?: 'male' | 'female'
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const body = await readBody<UpdateProfileBody>(event)

  const payload: Record<string, unknown> = {}
  if (body.fullName !== undefined) payload.full_name = body.fullName
  // Пустая строка — «дату убрали»; бэкенд у DateField(null=True) принимает null
  if (body.birthDate !== undefined) payload.birth_date = body.birthDate || null
  if (body.gender !== undefined) payload.gender = body.gender

  await upstream(event, '/users/my-profile/', {
    method: 'PATCH',
    auth: true,
    body: payload,
  })

  return ok({ success: true })
})
