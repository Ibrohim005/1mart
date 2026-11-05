import { money } from '../../lib/money'

/**
 * Оформление заказа — `POST /shop/checkout/` (CheckoutAPIView).
 *
 * ТОЛЬКО НАЛИЧНЫЕ. Онлайн-оплата на площадке не работает с 2026-08-20
 * (вебхуки WLCM не приходят), и трогать её здесь нельзя. Наличные — не
 * обход этого запрета, а полноценная офлайн-ветка самого бэкенда: в
 * CheckoutAPIView она уходит в `settle_via_cash(...)` мимо
 * `create_checkout()`/WLCM («Nothing is charged online — the payment.Order
 * stays PENDING until the courier/seller actually collects the money.
 * Cannot fail synchronously (no balance to check, no gateway to call)»).
 * `CheckoutRequestSerializer` даже `return_url` для неё не требует —
 * `_NO_GATEWAY_PROVIDERS = ("wallet", "cash")`. То есть заказ создаётся
 * без единого обращения к платёжному шлюзу.
 *
 * Остальные способы (`xazna`, `click`, `payme`, `uzum`, `card`) сознательно
 * не реализованы: их ветка на бэкенде идёт в WLCM, а он мёртв.
 */
interface UpstreamCheckout {
  order_id: string
  amount: string
  discount_amount: string
  delivery_amount: string
  payment_provider: string
}

/** Сохранённый адрес бэкенда — UUID; мок `/user/addresses` отдаёт «a1». */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const body = await readBody<{
    method?: string
    addressId?: string
    promoCode?: string | null
    useBalance?: boolean
  }>(event)
  const method = String(body?.method ?? '')

  if (method !== 'cash') {
    throw createError({
      statusCode: 501,
      statusMessage: 'Onlayn to\'lov vaqtincha ishlamaydi. Naqd pulni tanlang',
    })
  }

  const promoCode = String(body?.promoCode ?? '').trim()
  const addressId = String(body?.addressId ?? '')

  const checkout = await upstream<UpstreamCheckout>(event, '/shop/checkout/', {
    method: 'POST',
    auth: true,
    body: {
      payment_provider: 'cash',
      ...(promoCode ? { promo_code: promoCode } : {}),
      // Адрес отправляем, только если это настоящий UserLocation: `/user/addresses`
      // пока обслуживает мок со своими id, и такой id бэкенд отверг бы
      // валидацией. Без адреса заказ создаётся, а доставка считается нулевой
      // (DELIVERY_PRICING_ENABLED по умолчанию выключен).
      ...(UUID.test(addressId) ? { location_id: addressId } : {}),
      // Квота уже показывала покупателю уменьшенную сумму к оплате, если
      // включён тумблер, — без этого поля заказ создавался на полную сумму,
      // а баланс не списывался вовсе.
      ...(body?.useBalance ? { use_balance: true } : {}),
    },
  })

  return ok({
    id: checkout.order_id,
    // Тот же вид номера, что и в списке заказов: `MyOrderListSerializer
    // .get_order_code` — «#» плюс первые 12 символов id. Иначе номер на
    // экране успеха и номер в «Моих заказах» были бы разными.
    number: `#${String(checkout.order_id).slice(0, 12)}`,
    // Фронт различает только «оплачен» и «ждём оплату», а второе показывает
    // экран с кнопкой «повторить», который переотправляет заказ. Для наличных
    // ждать нечего: сам бэкенд считает такой заказ НЕ ожидающим оплаты —
    // `compute_order_status()` явно выводит cash из ветки payment_pending
    // («the buyer owes nothing online») и отдаёт «processing».
    status: 'paid' as const,
    method,
    total: money(checkout.amount),
    discount: money(checkout.discount_amount),
    delivery: money(checkout.delivery_amount),
  })
})
