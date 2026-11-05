import { promoCodes } from '../../utils/checkout-quote'

/**
 * Промокоды покупателя. Лежали массивом прямо в странице оформления
 * вместе с датами окончания.
 *
 * TODO: Connect to backend endpoint GET /checkout/promocodes
 */
export default defineEventHandler(() => ok(promoCodes()))
