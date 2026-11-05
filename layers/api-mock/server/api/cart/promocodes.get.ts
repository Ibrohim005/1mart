import { cartPromoCodes } from '../../utils/checkout-quote'

/**
 * Промокоды, которые предлагает корзина. Лежали массивом в самой странице.
 *
 * TODO: Connect to backend endpoint GET /cart/promocodes
 */
export default defineEventHandler(() => ok(cartPromoCodes()))
