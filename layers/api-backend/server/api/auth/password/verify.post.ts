import { normalizePhone } from '../../../utils/session'

/**
 * Восстановление пароля, шаг 2 — проверка кода:
 * бэкенд `POST /users/forgot-password/verify/`.
 *
 * Шаг отдельный, потому что таким его сделал бэкенд: смену пароля он
 * принимает не по коду из SMS, а по `reset_token`, который выдаёт только
 * здесь. Заодно это чинит и сроки: код живёт 2 минуты, а `verify` продлевает
 * заявку до 5 — пока пользователь придумывает пароль, ждать должен уже
 * продлённый токен, а не исходный код.
 */
interface UpstreamVerify {
  /** UUID заявки; шаг 3 принимает только его. */
  reset_token: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ phone?: string, code?: string }>(event)
  const phone = normalizePhone(String(body?.phone ?? ''))
  const code = String(body?.code ?? '')

  if (phone.length !== 13 || !/^\d{6}$/.test(code)) {
    throw createError({ statusCode: 422, statusMessage: 'Tasdiqlash kodi to\'liq emas' })
  }

  const verified = await upstream<UpstreamVerify>(event, '/users/forgot-password/verify/', {
    method: 'POST',
    body: { phone_number: phone, code },
  })

  return ok({ resetToken: verified.reset_token })
})
