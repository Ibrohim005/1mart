import type { MockEvent } from './visitor'
import { quoteFor } from './checkout-quote'
import type { Quote } from './checkout-quote'
import { findCard, hasFunds } from './cards-state'
import { balanceState, hasBalance } from './balance-state'
import type { DeliveryProvider, DeliveryType, PaymentMethod } from '#shared/types/order'

/**
 * Тело оформления — одно и то же у расчёта, запроса кода и создания заказа,
 * чтобы сумма, под которую выдан код, совпадала с суммой заказа.
 */
export interface CheckoutRequest {
  paymentMethod: PaymentMethod
  /** Корпоративная карта; null — оплата с баланса */
  cardId: string | null
  deliveryType: DeliveryType
  provider: DeliveryProvider | null
  pickupPointId: string | null
  addressId: string | null
  promoCode: string | null
  /** Комментарий покупателя к заказу */
  comment: string | null
}

const PROVIDERS: DeliveryProvider[] = ['spotshop', 'express24', 'maxsus', 'yandex']

export function parseCheckoutRequest(body: Record<string, unknown> | null | undefined): CheckoutRequest {
  const value = body ?? {}
  const provider = PROVIDERS.includes(value.provider as DeliveryProvider) ? value.provider as DeliveryProvider : null
  const paymentMethod: PaymentMethod = value.paymentMethod === 'card' ? 'card' : 'balance'
  return {
    paymentMethod,
    cardId: paymentMethod === 'card' && typeof value.cardId === 'string' ? value.cardId : null,
    deliveryType: value.deliveryType === 'pickupPoint' ? 'pickupPoint' : 'courier',
    provider,
    pickupPointId: typeof value.pickupPointId === 'string' ? value.pickupPointId : null,
    addressId: typeof value.addressId === 'string' ? value.addressId : null,
    promoCode: typeof value.promoCode === 'string' ? value.promoCode : null,
    comment: typeof value.comment === 'string' && value.comment.trim() ? value.comment.trim().slice(0, 500) : null,
  }
}

export type CheckoutProblem =
  | { status: 'empty' }
  | { status: 'outOfStock', items: Quote['stockIssues'] }
  | { status: 'insufficientFunds', required: number }
  | { status: 'insufficientBalance', required: number, available: number }
  | { status: 'cardRequired' }

/** Проверки перед финансовой операцией: корзина, остатки (А1), хватит ли денег на балансе или карте (А3) */
export function checkoutPrecheck(event: MockEvent, request: CheckoutRequest): { quote: Quote, problem: CheckoutProblem | null } {
  const quote = quoteFor(event, request)

  if (quote.goods <= 0) return { quote, problem: { status: 'empty' } }
  if (quote.stockIssues.length) return { quote, problem: { status: 'outOfStock', items: quote.stockIssues } }

  if (request.paymentMethod === 'balance') {
    if (hasBalance(event, quote.payable)) return { quote, problem: null }
    return { quote, problem: { status: 'insufficientBalance', required: quote.payable, available: balanceState(event).available } }
  }

  if (!findCard(event, request.cardId)) return { quote, problem: { status: 'cardRequired' } }

  // Остаток карты покупателю не показываем — его знает только банк
  if (!hasFunds(event, request.cardId, quote.payable)) {
    return { quote, problem: { status: 'insufficientFunds', required: quote.payable } }
  }

  return { quote, problem: null }
}
