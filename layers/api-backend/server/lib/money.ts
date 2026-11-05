import type { Money } from '#shared/types/catalog'

/**
 * Деньги: бэкенд отдаёт десятичную строку («699990.00»), фронт считает в
 * целых тийинах. Перевод здесь один на всё приложение — иначе округление
 * разъезжалось бы по компонентам, а на скидках и рассрочке это видно.
 *
 * Файл лежит в `server/lib/`, а НЕ в `server/utils/`, намеренно: Nitro
 * автоимпортирует всё из `server/utils/` каждого слоя в одно пространство
 * имён, и эти `money`/`discountPercent` перебивали одноимённые из
 * `layers/shared` («Duplicated imports "money" … ignored» в логе сборки).
 * Пары разные по входу — здесь десятичная строка, там число в сумах — и
 * совпадение поведения было случайным: первая же правка одной из них
 * разъехалась бы молча, на суммах. Импортировать только явно.
 */
export function money(value: unknown): Money {
  return { amount: tiyin(value), currency: 'UZS' }
}

/** null, если суммы нет — «нет цены» и «ноль» это разные вещи. */
export function moneyOrNull(value: unknown): Money | null {
  if (value === null || value === undefined || value === '') return null
  return money(value)
}

export function tiyin(value: unknown): number {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return 0
  // Округляем именно здесь: 0.1 + 0.2 в double даёт 30.000000000000004 тийина,
  // и без округления цена уехала бы на тийин в произвольную сторону.
  return Math.round(amount * 100)
}

/**
 * Скидка в процентах — только когда обе цены есть и старая реально больше.
 * Бэкенд разрешает discount_price выше обычной (валидации там нет), а
 * «−0%» или отрицательная скидка на карточке выглядят как поломка.
 */
export function discountPercent(price: Money, fullPrice: Money | null): number | null {
  if (!fullPrice || fullPrice.amount <= price.amount || fullPrice.amount === 0) return null
  return Math.round(((fullPrice.amount - price.amount) / fullPrice.amount) * 100)
}

/** Срок рассрочки, месяцев. Платформенное правило: беспроцентно, на всё. */
export const INSTALLMENT_MONTHS = 12

/**
 * Платёж в месяц при беспроцентной рассрочке на `INSTALLMENT_MONTHS`.
 *
 * Поле было захардкожено в `null` в двух местах (`utils/product.ts` и
 * `utils/cart.ts`), источника у бэкенда нет вовсе — и строка рассрочки на
 * карточке не показывалась никогда, хотя и вёрстка, и перевод для неё давно
 * готовы (`common.perMonth`, `card__installment`).
 *
 * Считаем здесь, рядом с остальными деньгами, по той же причине, что и
 * `discountPercent`: иначе деление разъехалось бы между гридом и корзиной, и
 * на карточке стояла бы одна сумма, в корзине другая.
 *
 * Округляем ВВЕРХ: двенадцать округлённых вниз платежей не покрывают цену —
 * «12 × 83 333» меньше миллиона, и это видно прямо на экране.
 */
export function installmentPerMonth(price: Money): Money | null {
  if (price.amount <= 0) return null
  return { amount: Math.ceil(price.amount / INSTALLMENT_MONTHS), currency: price.currency }
}
