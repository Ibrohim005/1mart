import type { PayoutRow } from '#shared/types/merchant'
import { balance, payouts } from '../../../lib/db'
import { sum, tiyin } from '../../../lib/money'

/**
 * Заявка на вывод средств. Сумма приходит в сумах; нельзя вывести больше,
 * чем доступно. Деньги списываются с доступного баланса сразу, заявка уходит
 * в обработку. Реального перевода нет — на платформе движение денег отключено,
 * это только учётная операция в кабинете.
 * TODO: Connect to backend endpoint POST /merchant/finance/payouts
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ amount?: number }>(event)
  const amount = Number(body?.amount)
  const availableSums = balance.available.amount / 100

  if (!amount || amount <= 0)
    throw createError({ statusCode: 422, statusMessage: 'Amount must be positive' })
  if (amount > availableSums)
    throw createError({ statusCode: 422, statusMessage: 'Amount exceeds available balance' })

  const payout: PayoutRow = {
    id: `pay-${Date.now().toString(36)}`,
    requestedAt: new Date().toISOString(),
    paidAt: null,
    amount: sum(amount),
    status: 'requested',
    destination: '**** 9012',
  }

  payouts.unshift(payout)
  balance.available = tiyin(balance.available.amount - amount * 100)

  return ok(payout)
})
