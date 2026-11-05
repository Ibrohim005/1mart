import { tiyin } from '../../lib/money'

/**
 * Расчёт заказа — `POST /shop/checkout/calculate/` (CheckoutCalculateAPIView).
 * Ничего не пишет и ничего не резервирует: считает ту же сумму, что потом
 * посчитает checkout, тем же кодом.
 *
 * Считается только ОТМЕЧЕННОЕ в корзине. Если не отмечено ничего, бэкенд
 * отвечает 400 «Savatda tanlangan mahsulot yo'q» — пробрасываем как есть:
 * `useApiData` кладёт такую ошибку в `error` и оставляет расчёт пустым, а
 * подменять её нулями значило бы показать «к оплате 0» вместо причины.
 */
interface UpstreamQuote {
  goods_total: string
  discount_amount: string
  promo_error: string | null
  delivery_total: string
  total: string
  delivery_pricing_enabled: boolean
  /*
   * Продавцы, которым доставку посчитать НЕ удалось. Бэкенд отдаёт их
   * отдельно и прямо предупреждает: отказанная группа даёт в `delivery_total`
   * ноль, и её нельзя молча доставить бесплатно (services/delivery.py,
   * `delivery_total`). Это поле здесь не читали — наверх уходил только ноль,
   * а `OrderSummary` рисует ноль как «бесплатно»: покупатель видел
   * «Доставка — бесплатно» там, где продавец отказался везти вовсе.
   */
  blocked_sellers?: Array<{
    seller_id: string
    seller_title: string
    error: string
    restricted_products: string[]
  }>
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const body = await readBody<{
    promoCode?: string | null
    useBalance?: boolean
    addressId?: string | number | null
  }>(event)

  const promoCode = String(body?.promoCode ?? '').trim()
  const useBalance = Boolean(body?.useBalance)

  /*
   * Адрес решает цену доставки: тариф продавца задаётся по области и району
   * (`SellerDeliveryTariff`), и без адреса бэкенд честно отвечает
   * NO_DESTINATION и нулём. Пока `/user/addresses` был моком, его id («a1»)
   * бэкенду ничего не говорили — теперь это настоящие UserLocation.
   *
   * UUID проверяем здесь: `location_id` — PrimaryKeyRelatedField, и мусор
   * вместо него превратил бы весь расчёт в 400. Чужой адрес подставить
   * нельзя и так — бэкенд сужает queryset до адресов вызывающего.
   */
  const addressId = String(body?.addressId ?? '')
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(addressId)

  const [quote, wallet] = await Promise.all([
    upstream<UpstreamQuote>(event, '/shop/checkout/calculate/', {
      method: 'POST',
      auth: true,
      body: {
        ...(promoCode ? { promo_code: promoCode } : {}),
        ...(isUuid ? { location_id: addressId } : {}),
      },
    }),
    // Остаток кошелька этот эндпоинт не возвращает, а галочка «списать с
    // баланса» стоит прямо над суммой. Без второго запроса она показывала бы
    // ноль у покупателя, у которого на счету деньги есть.
    upstream<{ balance?: string }>(event, '/payment/wallet/', { auth: true })
      .catch(() => ({ balance: '0' })),
  ])

  const payable = tiyin(quote.total)
  const balanceAvailable = tiyin(wallet.balance)

  return ok({
    goods: tiyin(quote.goods_total),
    // Промокод применён только если бэкенд не вернул причину отказа.
    promoCode: quote.promo_error ? null : (promoCode || null),
    // Бэкенд отдаёт готовую СУММУ скидки; процента у него нет вовсе —
    // промокод может быть и фиксированной суммой, и с потолком.
    promoPercent: 0,
    promoAmount: tiyin(quote.discount_amount),
    balanceAvailable,
    // Сколько спишется, считаем здесь: бэкенд применяет `use_balance` только
    // внутри самого checkout и предпросмотра не даёт. Формула повторяет его
    // дословно — `CheckoutAPIView._withdraw_balance_portion`:
    // `portion = min(wallet.balance, total)`, остаток к оплате — разница.
    // Разойдись они, покупатель увидел бы одну сумму, а списалась бы другая.
    balanceAmount: useBalance ? Math.min(balanceAvailable, payable) : 0,
    delivery: tiyin(quote.delivery_total),
    /*
     * Доставку посчитать не удалось — это НЕ «бесплатно». Отдаём причину и
     * продавцов, чтобы итог мог сказать правду, а кнопка оплаты не обещала
     * того, чего бэкенд всё равно не пропустит.
     */
    deliveryBlocked: (quote.blocked_sellers ?? []).map(item => ({
      sellerId: item.seller_id,
      sellerTitle: item.seller_title,
      reason: item.error,
    })),
    payable: useBalance ? Math.max(0, payable - balanceAvailable) : payable,
    // Предоплаты за наличный заказ у бэкенда нет ни поля, ни расчёта:
    // наличные собирают целиком при выдаче.
    prepayPercent: 0,
    prepayAmount: 0,
  })
})
