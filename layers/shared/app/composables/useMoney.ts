import type { Money } from '#shared/types/catalog'

/**
 * Деньги на экране с подписью валюты текущего языка.
 *
 * Форматирование чисел лежит в `shared/utils/money.ts` и о языке не знает —
 * подпись подставляется здесь, из словаря. Так «сум» перестаёт быть зашитой
 * в код строкой, а вырезать её из готового текста больше не нужно.
 */
export function useMoney() {
  const { t } = useI18n()
  const currency = computed(() => t('common.currency'))

  return {
    /** «1 861 990 сум» */
    money: (value: Money) => formatMoney(value, currency.value),
    /** «1 861 990» — когда подпись стоит отдельным элементом */
    amount: (value: Money) => formatAmount(value),
    /** «1 861 990 сум» из числа в тийинах */
    sum: (amount: number) => formatMoney({ amount, currency: 'UZS' }, currency.value),
    currency,
  }
}
