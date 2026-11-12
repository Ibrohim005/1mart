import { mockStatus } from '../../../utils/mock-status'
import { changePassword, sessionPhone } from '../../../utils/org-state'

/**
 * Свой пароль вместо временного: при первом входе сотрудника и из настроек.
 * TODO: Connect to backend endpoint POST /auth/password/change
 */
export default defineEventHandler(async (event) => {
  const digits = sessionPhone(event)
  if (!digits) {
    mockStatus(event, 401)
    return fail([{ code: 'unauthorized', message: 'Login required' }])
  }
  const body = await readBody<{ password?: string }>(event).catch(() => null)
  const password = String(body?.password ?? '')
  if (password.length < 8 || !/\d/.test(password) || !/[a-zа-я]/i.test(password)) {
    mockStatus(event, 422)
    return fail([{ code: 'password_weak', message: 'At least 8 characters with letters and digits', field: 'password' }])
  }
  changePassword(digits, password)
  return ok({ changed: true })
})
