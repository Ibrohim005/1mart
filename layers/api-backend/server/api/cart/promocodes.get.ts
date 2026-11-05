import { money } from '../../lib/money'

/**
 * Промокоды, которые предлагает корзина — `GET /shop/promo-codes/`
 * (PromoCodeListAPIView + PromoCodeSerializer,
 * apps/shop/api_endpoints/PromoCodeApi/). Тот же источник, что и у диалога
 * на оформлении (`checkout/promocodes.get.ts`) — и это НЕ повтор по
 * невнимательности: у мока наборы были разные (в корзине — короче), а у
 * бэкенда «подборки для корзины» не существует. Список применимых кодов у
 * покупателя один, и показывать в корзине урезанный значило бы прятать
 * скидку, которой он может воспользоваться.
 *
 * Выбор вьюхи (их в файле три) разобран в `checkout/promocodes.get.ts`:
 * коротко — `PromoCodeListAPIView` уже отфильтровала просроченные и
 * исчерпанные коды, `…HistoryAPIView` их наоборот сохраняет (это экран
 * кабинета), а `…ValidateAPIView` — `POST` по одному коду.
 *
 * Вьюха пагинирована по умолчанию проекта, поэтому `items()`.
 */
interface UpstreamPromoCode {
  id: string
  code: string
  discount_type: string
  discount_value: string
  max_discount_amount: string | null
  min_order_amount: string
  starts_at: string | null
  ends_at: string | null
}

/**
 * Подпись под кодом. Отдельного «описания» у `PromoCode` нет ни в модели,
 * ни в сериализаторе — строка собирается из настоящих `discount_type` и
 * `discount_value` и ничего не добавляет от себя.
 */
function describe(promo: UpstreamPromoCode, locale: string): string {
  const percent = Number(promo.discount_value)
  if (!Number.isFinite(percent)) return ''

  if (promo.discount_type === 'percent') {
    return locale === 'ru' ? `Скидка ${percent}%` : `${percent}% chegirma`
  }

  const amount = groupDigits(toSum(money(promo.discount_value)))
  return locale === 'ru' ? `Скидка ${amount} сум` : `${amount} so'm chegirma`
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const locale = (getHeader(event, 'accept-language') || 'uz').split('-')[0]!

  const response = await upstream<unknown>(event, '/shop/promo-codes/', {
    auth: true,
    query: { limit: 100, offset: 0 },
  })

  return ok(items<UpstreamPromoCode>(response).map(promo => ({
    id: promo.id,
    code: promo.code,
    description: describe(promo, locale),
    // У кода на фиксированную сумму процента не существует — ноль, а не
    // пересчёт от корзины, которую этот эндпоинт не видит.
    percent: promo.discount_type === 'percent' ? Number(promo.discount_value) || 0 : 0,
    // Вида «бесплатная доставка» у промокодов бэкенда нет: `DiscountType`
    // знает только `percent` и `fixed`.
    freeDelivery: false,
    // Срез ISO-строки, а не `new Date(...)`: бэкенд отдаёт `ends_at` со
    // смещением `+05:00`, и локальное время процесса сдвинуло бы последний
    // день кода на сутки. Бессрочный код — пустая строка.
    until: promo.ends_at ? promo.ends_at.slice(0, 10) : '',
  })))
})
