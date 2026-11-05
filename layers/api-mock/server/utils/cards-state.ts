import type { MockEvent } from './visitor'
import { perVisitor } from './visitor'
import { companyDetails, holdBalance, releaseBalance } from './balance-state'
import { mockLocale } from '../../mocks/facets'
import type { CardNetwork, PaymentCardInfo } from '#shared/types/order'

/**
 * Корпоративные карты компании-покупателя. Второй способ оплаты рядом
 * с балансом (`balance-state`); личные карты на 1mart не принимаются.
 * `cardId: null` в заказе означает оплату с баланса.
 *
 * Карты хранят «остаток» только ради демо сценария А3 (недостаточно средств):
 * у настоящего 1mart это решает банк-эмитент при авторизации.
 * Деньги — целые тийины, как и везде.
 *
 * TODO: Connect to backend endpoints GET|POST /user/cards
 */

interface CardRecord {
  id: string
  network: CardNetwork
  /** Только первые 6 и последние 4 цифры — полный номер мок тоже не хранит */
  bin: string
  last4: string
  expires: string
  /** Демо-остаток на карте, тийины */
  funds: number
}

function seed(): CardRecord[] {
  return [
    { id: 'c1', network: 'uzcard', bin: '860049', last4: '4408', expires: '09/27', funds: 9_000_000_000 },
    { id: 'c2', network: 'humo', bin: '986012', last4: '1902', expires: '04/28', funds: 3_000_000_000 },
    // Карта почти пустая — на ней демонстрируется «недостаточно средств»
    { id: 'c3', network: 'visa', bin: '418273', last4: '0005', expires: '11/27', funds: 5_000_000 },
  ]
}

const store = perVisitor<CardRecord[]>(seed)

/** Карта выпущена на компанию, поэтому держатель — её название */
export function cardHolderName(event: MockEvent) {
  return companyDetails(event).name
}

const BALANCE_LABELS: Record<string, string> = {
  'ru': 'Баланс компании',
  'uz': 'Kompaniya balansi',
  'uz-cyrl': 'Компания баланси',
  'en': 'Company balance',
  'kaa': 'Kompaniya balansi',
}

/**
 * Демо отказа: BIN 860006 считаем личной картой. Настоящую проверку делает
 * бэкенд по данным эмитента, браузеру номер ничего не говорит.
 */
export function isCorporatePan(pan: string) {
  return !pan.startsWith('860006')
}

const NETWORK_TITLES: Record<CardNetwork, string> = {
  uzcard: 'UzCard',
  humo: 'Humo',
  visa: 'Visa',
  mastercard: 'Mastercard',
}

export function cardNetworkTitle(network: CardNetwork) {
  return NETWORK_TITLES[network]
}

export function publicCard(event: MockEvent, card: CardRecord): PaymentCardInfo {
  return {
    id: card.id,
    network: card.network,
    maskedPan: `${card.bin}••••••${card.last4}`,
    last4: card.last4,
    holder: cardHolderName(event),
    expires: card.expires,
  }
}

export function userCards(event: MockEvent) {
  return store.get(event).map(card => publicCard(event, card))
}

export function findCard(event: MockEvent, id: string | null | undefined) {
  return id ? store.get(event).find(card => card.id === id) ?? null : null
}

/** Платёжная система по первым цифрам номера */
export function networkOfPan(pan: string): CardNetwork | null {
  if (pan.startsWith('8600') || pan.startsWith('5614')) return 'uzcard'
  if (pan.startsWith('9860')) return 'humo'
  if (pan.startsWith('4')) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(pan)) return 'mastercard'
  return null
}

/** Алгоритм Луна — тот же первичный фильтр, что делает процессинг */
export function luhnValid(pan: string) {
  let total = 0
  for (let i = 0; i < pan.length; i++) {
    let digit = Number(pan[pan.length - 1 - i])
    if (i % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    total += digit
  }
  return total % 10 === 0
}

export function addCard(event: MockEvent, pan: string, expires: string) {
  const network = networkOfPan(pan)!
  const record: CardRecord = {
    id: `c${Date.now().toString(36)}`,
    network,
    bin: pan.slice(0, 6),
    last4: pan.slice(-4),
    expires,
    // У новой карты денег достаточно — демо «нет денег» живёт на Visa •0005
    funds: 9_000_000_000,
  }
  store.get(event).push(record)
  return publicCard(event, record)
}

/** «UzCard •4408» или «Баланс компании» — подпись способа оплаты для чека и заказа */
export function paymentMethodLabel(event: MockEvent, cardId: string | null | undefined) {
  const card = findCard(event, cardId)
  if (card) return `${NETWORK_TITLES[card.network]} •${card.last4}`
  return BALANCE_LABELS[mockLocale(getHeader(event, 'accept-language'))] ?? BALANCE_LABELS.ru!
}

/** Хватит ли денег на карте */
export function hasFunds(event: MockEvent, cardId: string | null | undefined, amount: number) {
  const card = findCard(event, cardId)
  return Boolean(card && card.funds >= amount)
}

/** Резерв (hold): деньги заблокированы, но ещё не списаны. Без карты — на балансе */
export function holdFunds(event: MockEvent, cardId: string | null | undefined, amount: number) {
  if (!cardId) return holdBalance(event, amount)
  const card = findCard(event, cardId)
  if (card) card.funds -= amount
}

/** Возврат резерва тем же способом оплаты — отказ продавца, отмена */
export function releaseFunds(event: MockEvent, cardId: string | null | undefined, amount: number) {
  if (!cardId) return releaseBalance(event, amount)
  const card = findCard(event, cardId)
  if (card) card.funds += amount
}
