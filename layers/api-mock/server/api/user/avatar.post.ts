import { MOCK_AVATAR_URL, profileState } from '../../utils/profile-state'

/**
 * Мок не хранит файлы — принимает загрузку как есть и просто помнит,
 * что аватар «есть», отдавая одну и ту же заглушку в GET /user/profile.
 * TODO: Connect to backend endpoint POST /user/avatar
 */
export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'avatar' && part.filename)
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'Fayl yuborilmadi' })
  }

  profileState(event).hasAvatar = true

  return ok({ avatar: MOCK_AVATAR_URL })
})
