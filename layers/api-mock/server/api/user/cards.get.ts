import { userCards } from '../../utils/cards-state'

/**
 * Привязанные карты (UzCard, Humo, Visa, Mastercard). Номера приходят уже
 * замаскированными — не больше первых 6 и последних 4 цифр; держатель —
 * имя полностью и первая буква фамилии (ТЗ, безопасность).
 *
 * TODO: Connect to backend endpoint GET /user/cards
 */
export default defineEventHandler(event => ok(userCards(event)))
