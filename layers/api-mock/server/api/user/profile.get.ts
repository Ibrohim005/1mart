import { MOCK_AVATAR_URL, profileState } from '../../utils/profile-state'

/**
 * Профиль покупателя: имя, телефон, дата рождения, пол и аватар — «Настройки»
 * читают отсюда всё целиком, оформление заказа — только имя и телефон.
 * TODO: Connect to backend endpoint GET /user/profile
 */
export default defineEventHandler((event) => {
  const state = profileState(event)

  return ok({
    name: state.fullName,
    phone: '+998 90 123-45-67',
    birthDate: state.birthDate,
    gender: state.gender,
    avatar: state.hasAvatar ? MOCK_AVATAR_URL : '',
  })
})
