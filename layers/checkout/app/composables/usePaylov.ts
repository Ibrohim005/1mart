import type { CardNetwork, DeliveryProvider, PaymentCardInfo, PaymentStatus } from '#shared/types/order'

/**
 * Общие подписи платёжного потока 1mart: оформление и кабинет показывают
 * одни и те же службы доставки, карты и статусы денег.
 * Решения принимаются по машинным кодам, а не по переведённым строкам.
 */

const NETWORK_LOGOS: Record<CardNetwork, string> = {
  uzcard: '/mock/payments/uzcard.svg',
  humo: '/mock/payments/humo.svg',
  visa: '/mock/payments/visa.svg',
  mastercard: '/mock/payments/mastercard.svg',
}

const NETWORK_TITLES: Record<CardNetwork, string> = {
  uzcard: 'UzCard',
  humo: 'Humo',
  visa: 'Visa',
  mastercard: 'Mastercard',
}

export const CARD_NETWORKS: CardNetwork[] = ['uzcard', 'humo', 'visa', 'mastercard']

/** Язык интерфейса → тег для Intl (ru, en) */
const INTL_TAGS: Record<string, string> = { ru: 'ru-RU', en: 'en-US' }

/**
 * Узбекских и каракалпакских названий месяцев в Intl браузеров часто нет —
 * Chrome печатал «M10 10». Держим свои.
 */
const MONTHS: Record<string, string[]> = {
  'uz': ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
  'uz-cyrl': ['январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентабр', 'октабр', 'ноябр', 'декабр'],
  'kaa': ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'],
}

export function use1mart() {
  const { t, locale } = useI18n()

  /** «10 октября» из ISO-даты */
  function dayLabel(iso: string) {
    const date = new Date(`${iso}T12:00:00`)
    const months = MONTHS[locale.value]
    if (months) return `${date.getDate()}-${months[date.getMonth()]}`
    return new Intl.DateTimeFormat(INTL_TAGS[locale.value] ?? 'ru-RU', { day: 'numeric', month: 'long' }).format(date)
  }

  function providerName(provider: DeliveryProvider | undefined | null) {
    return provider ? t(`pay.delivery.providers.${provider}`) : t('pay.delivery.paylovLogistics')
  }

  /** «UzCard •4408» — в списках не больше последних 4 цифр */
  function cardTitle(card: Pick<PaymentCardInfo, 'network' | 'last4'>) {
    return `${NETWORK_TITLES[card.network]} •${card.last4}`
  }

  /** «8600 49•• •••• 4408» — первые 6 и последние 4, как в ТЗ */
  function cardPan(card: Pick<PaymentCardInfo, 'maskedPan'>) {
    return card.maskedPan.replace(/(.{4})/g, '$1 ').trim()
  }

  function networkLogo(network: CardNetwork) {
    return NETWORK_LOGOS[network]
  }

  function networkTitle(network: CardNetwork) {
    return NETWORK_TITLES[network]
  }

  function paymentStatusLabel(status: PaymentStatus) {
    return t(`pay.paymentStatus.${status}`)
  }

  return { dayLabel, providerName, cardTitle, cardPan, networkLogo, networkTitle, paymentStatusLabel }
}
