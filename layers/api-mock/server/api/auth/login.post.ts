import { mockStatus } from '../../utils/mock-status'
import { checkPassword, mustChangePassword, nameOf } from '../../utils/org-state'

/**
 * Вход по телефону и паролю — так входят сотрудники, которых завёл руководитель.
 *
 * Номер из справочника компаний проверяется по-настоящему: свой пароль, блокировка,
 * временный пароль (тогда `mustChangePassword: true`, и фронт просит задать свой).
 * Любой другой номер входит по-старому, любым паролем от 4 символов, кроме «0000» —
 * чтобы фронт умел показывать ошибку неверных данных.
 *
 * TODO: Connect to backend endpoint POST /auth/login
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string, password?: string }>(event)
  const digits = String(body?.phone ?? '').replace(/\D/g, '').replace(/^998/, '')
  const password = String(body?.password ?? '')

  if (digits.length !== 9) {
    throw createError({ statusCode: 422, statusMessage: 'Phone is incomplete' })
  }

  const known = checkPassword(digits, password)
  if (known === 'blocked') {
    mockStatus(event, 403)
    return fail([{ code: 'employee_blocked', message: 'Access is blocked by the head of the company' }])
  }
  if (known === 'wrong' || (known === 'unknown' && (password.length < 4 || password === '0000'))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  return ok({
    phone: `+998 ${digits}`,
    name: nameOf(digits) ?? 'Отакулов Ферузбек',
    mustChangePassword: mustChangePassword(digits),
  })
})
