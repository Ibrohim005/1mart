import type { Money } from '#shared/types/catalog'

/**
 * Хелперы денег для моков. Лежат в `server/lib`, а НЕ в `server/utils`:
 * Nitro сваливает все `server/utils` всех слоёв в одно пространство имён,
 * и утилита с именем `money` молча перекрыла бы чужую (урок из CLAUDE.md).
 * 1 сум = 100 тийин; внутри всегда целые тийины.
 */
export function sum(amount: number): Money {
  return { amount: Math.round(amount) * 100, currency: 'UZS' }
}

/** Прямо в тийинах — когда значение уже посчитано в тийинах. */
export function tiyin(amount: number): Money {
  return { amount: Math.round(amount), currency: 'UZS' }
}

/** Доля от суммы денег (например, комиссия): rate в процентах. */
export function percentOf(value: Money, rate: number): Money {
  return { amount: Math.round((value.amount * rate) / 100), currency: 'UZS' }
}

export function minus(a: Money, b: Money): Money {
  return { amount: a.amount - b.amount, currency: 'UZS' }
}

export function plus(a: Money, b: Money): Money {
  return { amount: a.amount + b.amount, currency: 'UZS' }
}
