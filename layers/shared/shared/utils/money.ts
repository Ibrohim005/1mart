import type { Money } from '#shared/types/catalog'

/** 1 сум = 100 тийин. Внутри всегда целые тийины, на экран — сумы. */
export const TIYIN_IN_SUM = 100

export function toSum(money: Money): number {
  return Math.round(money.amount / TIYIN_IN_SUM)
}

export function money(amount: number): Money {
  return { amount: Math.round(amount * TIYIN_IN_SUM), currency: 'UZS' }
}

/**
 * Написание валюты по умолчанию. На других языках оно другое — «so'm», «сўм», —
 * поэтому подпись передаётся аргументом, а не зашита в форматирование.
 * В компонентах берите её из словаря через `useMoney()`.
 */
export const CURRENCY_LABEL = 'сум'

/**
 * Разряды разделяются неразрывным пробелом. Группировка намеренно не зависит от
 * локали и не использует Intl: ICU в Node и в браузере дают для uz-UZ разные
 * разделители, из-за чего SSR и клиент расходились при гидратации.
 */
const GROUP_SEPARATOR = '\u00A0'

export function groupDigits(value: number): string {
  const sign = value < 0 ? '-' : ''
  return sign + Math.abs(Math.round(value)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR)
}

/** Только число с разрядами: когда подпись валюты рисуется отдельным элементом */
export function formatAmount(value: Money): string {
  return groupDigits(toSum(value))
}

/**
 * Сумма с подписью валюты. Подпись приходит снаружи: она зависит от языка,
 * а утилита о языке ничего не знает. Раньше здесь была зашита «сум», и на
 * узбекской версии цены оставались русскими; хуже того, вызывающий код
 * вырезал её строкой `.replace(' сум', '')` — на другом языке это молча
 * переставало работать.
 */
export function formatMoney(value: Money, currency: string = CURRENCY_LABEL): string {
  // Второй аргумент раньше был кодом локали и не использовался. Код, который
  // не переписали, молча печатал «1 861 990 ru» — ловим это сразу.
  if (import.meta.dev && /^[a-z]{2}(-[A-Za-z]+)?$/.test(currency)) {
    throw new Error(`formatMoney: вторым аргументом нужна подпись валюты, а пришёл код локали «${currency}». Используйте useMoney().`)
  }

  return `${formatAmount(value)} ${currency}`
}

export function discountPercent(price: Money, fullPrice: Money | null): number | null {
  if (!fullPrice || fullPrice.amount <= price.amount) return null
  return Math.round((1 - price.amount / fullPrice.amount) * 100)
}
