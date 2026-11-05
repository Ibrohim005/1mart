import { profileState } from '../../utils/profile-state'

/** TODO: Connect to backend endpoint PUT /user/profile */
interface UpdateProfileBody {
  fullName?: string
  birthDate?: string
  gender?: 'male' | 'female'
}

export default defineEventHandler(async (event) => {
  const body = await readBody<UpdateProfileBody>(event)
  const state = profileState(event)

  if (body.fullName !== undefined) state.fullName = body.fullName
  if (body.birthDate !== undefined) state.birthDate = body.birthDate
  if (body.gender !== undefined) state.gender = body.gender

  return ok({ success: true })
})
