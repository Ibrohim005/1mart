import { mockStatus } from '../../utils/mock-status'
import { addCard, isCorporatePan, luhnValid, networkOfPan } from '../../utils/cards-state'

/**
 * Привязка корпоративной карты. Полный номер живёт только в этом запросе: в ответ
 * и в хранилище мока попадают лишь первые 6 и последние 4 цифры.
 *
 * TODO: Connect to backend endpoint POST /user/cards
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ number?: string, expires?: string }>(event).catch(() => null)
  const pan = String(body?.number ?? '').replace(/\D/g, '')
  const expires = String(body?.expires ?? '').trim()

  if (pan.length !== 16 || !networkOfPan(pan) || !luhnValid(pan)) {
    mockStatus(event, 422)
    return fail([{ code: 'card_number', message: 'Card number is invalid', field: 'number' }])
  }

  if (!isCorporatePan(pan)) {
    mockStatus(event, 422)
    return fail([{ code: 'card_not_corporate', message: 'Only corporate cards are accepted', field: 'number' }])
  }

  const match = /^(\d{2})\/(\d{2})$/.exec(expires)
  const month = Number(match?.[1])
  const year = 2000 + Number(match?.[2])
  const now = new Date()
  if (!match || month < 1 || month > 12 || year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    mockStatus(event, 422)
    return fail([{ code: 'card_expires', message: 'Card expiry is invalid', field: 'expires' }])
  }

  return ok(addCard(event, pan, expires))
})
