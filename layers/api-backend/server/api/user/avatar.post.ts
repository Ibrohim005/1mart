/**
 * Загрузка аватара — `PATCH /avatar/upload/` (UploadAvatarAPIView,
 * multipart-поле `avatar`). Свой эндпоинт: `MyProfileView` держит
 * `avatar` как `ThumbnailImageField`, который всегда read-only, поэтому
 * смена фото не проходит через `PATCH /users/my-profile/` — только сюда.
 *
 * Метод на фронтовой стороне — POST, а не PATCH: так уже называл его
 * TODO-комментарий в `settings.vue`, и это просто «загрузить файл»,
 * а не частичное обновление ресурса.
 */
export default defineEventHandler(async (event) => {
  requireAuth(event)

  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'avatar' && part.filename)
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'Fayl yuborilmadi' })
  }

  const body = new FormData()
  body.append('avatar', new Blob([file.data], { type: file.type || 'application/octet-stream' }), file.filename)

  const response = await upstream<{ avatar: string }>(event, '/users/avatar/upload/', {
    method: 'PATCH',
    auth: true,
    body,
  })

  return ok({ avatar: response.avatar })
})
