import { money } from '../../lib/money'

/**
 * Промокоды покупателя на оформлении — `GET /shop/promo-codes/`
 * (PromoCodeListAPIView + PromoCodeSerializer,
 * apps/shop/api_endpoints/PromoCodeApi/).
 *
 * Почему именно эта вьюха. В `PromoCodeApi/views.py` их три:
 *   • `PromoCodeListAPIView` (`/shop/promo-codes/`) — коды, которые этот
 *     покупатель МОЖЕТ ПРИМЕНИТЬ ПРЯМО СЕЙЧАС: вьюха сама отсекает
 *     неактивные, не начавшиеся, просроченные, выбранные по общему лимиту
 *     и уже исчерпанные этим покупателем. Ровно то, что нужно диалогу
 *     выбора — в нём каждый код нажимаем;
 *   • `PromoCodeHistoryAPIView` (`/shop/promo-codes/history/`) — тот же
 *     список, но НЕ фильтрованный, со статусами «used»/«expired». Это экран
 *     «Мои промокоды» в кабинете, не выбор на оформлении: показывать в
 *     диалоге просроченный код значило бы предлагать нажать на то, что
 *     checkout следом отвергнет;
 *   • `PromoCodeValidateAPIView` — `POST`, проверка одного кода против суммы
 *     корзины, списка не даёт вовсе.
 *
 * Сумму скидки этот список НЕ считает: её отдаёт расчёт заказа
 * (`checkout/quote.post.ts` → `POST /shop/checkout/calculate/`), и только он
 * знает про потолок, минимальную сумму и привязку к товару/продавцу.
 *
 * Вьюха — `ListAPIView` с проектным `LimitOffsetPagination`, поэтому ответ
 * приходит конвертом `{ count, results }` и разворачивается через `items()`.
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
 * Подпись под кодом. Поля «описание» у `PromoCode` НЕТ ни в модели, ни в
 * сериализаторе — эта строка собирается из настоящих `discount_type` и
 * `discount_value`, то есть ничего не выдумывает, а печатает словами ту же
 * скидку, что лежит в записи. Так же, как `orders.get.ts` печатает словами
 * код статуса.
 *
 * Потолок скидки (`max_discount_amount`) и привязку к товару/продавцу сюда
 * намеренно не тянем: точную сумму всё равно назовёт расчёт заказа, а
 * «скидка 20%, но не больше 50 000» в строке диалога на 586 px не помещается
 * и превращается в обещание, которое считает другой эндпоинт.
 */
function describe(promo: UpstreamPromoCode, locale: string): string {
  const percent = Number(promo.discount_value)
  if (!Number.isFinite(percent)) return ''

  if (promo.discount_type === 'percent') {
    return locale === 'ru' ? `Скидка ${percent}%` : `${percent}% chegirma`
  }

  // Фиксированная скидка — сумма в сумах. Через `money()`, чтобы округление
  // было тем же, что у любой другой цены в проекте.
  const amount = groupDigits(toSum(money(promo.discount_value)))
  return locale === 'ru' ? `Скидка ${amount} сум` : `${amount} so'm chegirma`
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const locale = (getHeader(event, 'accept-language') || 'uz').split('-')[0]!

  // Диалог промокодов рисует список целиком, страниц в нём нет.
  const response = await upstream<unknown>(event, '/shop/promo-codes/', {
    auth: true,
    query: { limit: 100, offset: 0 },
  })

  return ok(items<UpstreamPromoCode>(response).map(promo => ({
    id: promo.id,
    code: promo.code,
    description: describe(promo, locale),
    // Процент есть только у процентных кодов; у кода на фиксированную сумму
    // процента не существует в принципе — ноль, а не пересчёт «сколько бы
    // это было в процентах» от корзины, которую этот эндпоинт не видит.
    percent: promo.discount_type === 'percent' ? Number(promo.discount_value) || 0 : 0,
    // Бесплатной доставки как вида промокода у бэкенда нет вовсе:
    // `DiscountType` знает только `percent` и `fixed`, а доставку считает
    // отдельный механизм (apps/delivery). Поэтому всегда `false`.
    freeDelivery: false,
    // Дату берём срезом ISO-строки, а не через `new Date(...)`: бэкенд
    // отдаёт `ends_at` со смещением `+05:00`, и приведение к локальному
    // времени процесса Nitro сдвинуло бы последний день кода на сутки.
    // Бессрочный код (`ends_at = null`) отдаём пустой строкой — диалог
    // просто не печатает срок.
    until: promo.ends_at ? promo.ends_at.slice(0, 10) : '',
  })))
})
