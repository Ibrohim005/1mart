import { cartSummary } from '../../utils/cart-state'

/** Счётчик в шапке считается из того же состояния, что и сама корзина */
export default defineEventHandler(event => ok(cartSummary(event)))
