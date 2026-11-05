import type { OrderCard, OrderStatus } from '#shared/types/order'

/**
 * Дорожка заказа и подписи к ней — один источник на список, экран
 * подтверждения и страницу заказа.
 *
 * Поток 1mart (ТЗ UC-FL-10): «Ожидает подтверждения продавца» (деньги в
 * резерве) → «Подтверждён» (списаны, «В обработке») → «Передан в доставку»
 * → «Доставлен». У самовывоза перед последним шагом есть «Готов к выдаче».
 * Отменённый покупателем или продавцом заказ дорожки не имеет.
 */

export type OrderStepKey = 'awaiting' | 'confirmed' | 'handedToDelivery' | 'readyForPickup' | 'finished'

const STEP_ICONS: Record<OrderStepKey, string> = {
  awaiting: 'tick-circle',
  confirmed: 'shopping-cart',
  handedToDelivery: 'map',
  readyForPickup: 'map',
  finished: 'flag',
}

/** Статус → шаг дорожки. Старые статусы бэкенда тоже раскладываются по шагам */
const STEP_OF: Record<OrderStatus, OrderStepKey | null> = {
  created: 'awaiting',
  paid: 'awaiting',
  awaitingSeller: 'awaiting',
  processing: 'confirmed',
  confirmed: 'confirmed',
  onTheWay: 'handedToDelivery',
  handedToDelivery: 'handedToDelivery',
  readyForPickup: 'readyForPickup',
  delivered: 'finished',
  returnRequested: 'finished',
  canceled: null,
  rejectedBySeller: null,
}

/** Заказ ещё меняется сам — страницу стоит опрашивать */
export const LIVE_STATUSES: OrderStatus[] = ['awaitingSeller', 'confirmed', 'handedToDelivery', 'readyForPickup', 'created', 'paid', 'processing', 'onTheWay']

export function useOrderProgress(order: MaybeRefOrGetter<OrderCard | undefined>) {
  const { t } = useI18n()

  const current = computed(() => toValue(order))
  const isPickup = computed(() => current.value?.deliveryType === 'pickupPoint')
  const canceled = computed(() => current.value?.status === 'canceled' || current.value?.status === 'rejectedBySeller')

  const keys = computed<OrderStepKey[]>(() => (isPickup.value
    ? ['awaiting', 'confirmed', 'handedToDelivery', 'readyForPickup', 'finished']
    : ['awaiting', 'confirmed', 'handedToDelivery', 'finished']))

  const currentStep = computed(() => {
    const status = current.value?.status
    const key = status ? STEP_OF[status] : null
    return key ? keys.value.indexOf(key) : -1
  })

  function stepLabel(key: OrderStepKey) {
    if (key === 'finished') return t(isPickup.value ? 'pay.steps.received' : 'pay.steps.delivered')
    return t(`pay.steps.${key}`)
  }

  /** Когда заказ прошёл шаг — из истории статусов */
  function passedAt(key: OrderStepKey) {
    const events = current.value?.history ?? []
    return events.find(item => STEP_OF[item.status] === key)?.at
  }

  const steps = computed(() => keys.value.map((key, index) => ({
    key,
    icon: STEP_ICONS[key],
    label: stepLabel(key),
    done: !canceled.value && index <= currentStep.value,
    at: passedAt(key),
  })))

  const title = computed(() => {
    const status = current.value?.status
    return status ? t(`pay.orderState.${status}.title`) : ''
  })

  const statusDate = computed(() => {
    const value = current.value
    if (!value) return ''
    const event = [...(value.history ?? [])].reverse().find(item => item.status === value.status)
    return event?.at ?? value.date
  })

  const text = computed(() => {
    const value = current.value
    if (!value) return ''
    if (value.status === 'canceled' && value.canceledReason) return value.canceledReason

    if ((value.status === 'handedToDelivery' || value.status === 'onTheWay') && !value.expectedAt) {
      return t('pay.orderState.handedToDelivery.textNoDate')
    }

    return t(`pay.orderState.${value.status}.text`, { date: value.expectedAt ?? '', at: statusDate.value })
  })

  return { steps, currentStep, title, text, canceled, isPickup, statusDate }
}

/** Вид плашки статуса: цвет и значок. Считается по статусу, не по тексту */
export function orderStatusKind(status: OrderStatus) {
  if (status === 'canceled' || status === 'rejectedBySeller') return 'canceled' as const
  if (status === 'delivered') return 'done' as const
  if (status === 'returnRequested') return 'return' as const
  if (status === 'awaitingSeller' || status === 'created' || status === 'paid') return 'waiting' as const
  return 'progress' as const
}

export function orderStatusIcon(status: OrderStatus) {
  if (status === 'canceled' || status === 'rejectedBySeller') return 'close'
  if (status === 'onTheWay' || status === 'handedToDelivery') return 'truck'
  if (status === 'readyForPickup') return 'location'
  if (status === 'returnRequested') return 'rotate-left'
  if (status === 'awaitingSeller' || status === 'created' || status === 'paid') return 'card'
  if (status === 'processing') return 'shopping-cart'
  return 'tick-circle-fill'
}
