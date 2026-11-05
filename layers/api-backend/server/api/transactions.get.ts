import { money } from '../lib/money'

/**
 * История транзакций кошелька — `GET /payment/wallet/transactions/`
 * (WalletTransactionListView + WalletTransactionSerializer,
 * apps/payment/api_endpoints/Wallet/). Вкладка «История» в «Моих заказах».
 *
 * Только ЧТЕНИЕ: это лента уже совершённых движений, она ничего не двигает.
 *
 * Вьюха — `ListAPIView` без своего `pagination_class`, то есть работает
 * проектный `LimitOffsetPagination` и ответ приходит в конверте
 * `{ count, results }`. Разворачиваем через `items()`, а не берём массивом.
 */
interface UpstreamTransaction {
  id: string
  type: string
  type_display: string | null
  amount: string
  description: string
  created_at: string
  order_code: string | null
  payment_method: string | null
  card_mask: string | null
  // Комиссия платёжного заказа. Карточке транзакции она не нужна — описана
  // здесь только чтобы контракт сериализатора был виден целиком. Числами,
  // а не строкой: оба поля читаются через `SerializerMethodField`, и DRF
  // отдаёт Decimal как число, а не как десятичную строку (проверено).
  commission_percent: number | null
  commission_amount: number | null
}

/**
 * Знак суммы. В базе `amount` ВСЕГДА положительный — и `Wallet.deposit`, и
 * `Wallet.withdraw` отказываются писать отрицательное число, — а направление
 * несёт только `type`. Поэтому минус рисуем по типу, а не по самой сумме:
 * читать знак из `amount` значило бы, что расход печатается как приход.
 */
function isIncome(type: string): boolean {
  return type === 'deposit' || type === 'refund'
}

/**
 * Подписи типов. Бэкенд отдаёт `type_display` из
 * `WalletTransaction.TypeChoices`, и метки там обёрнуты в `gettext_lazy` —
 * но русского перевода для них НЕТ: в `locale/ru/LC_MESSAGES/django.po`
 * этих строк не заведено, и `Accept-Language: ru` всё равно возвращает
 * узбекские «Kirim»/«Chiqim» (проверено запросом к локальному бэкенду).
 * Поэтому подписи живут здесь — так же, как статусы заказа в
 * `orders.get.ts`, и ровно по той же причине.
 */
const TYPE_LABEL: Record<string, Record<string, string>> = {
  ru: {
    deposit: 'Пополнение баланса',
    withdrawal: 'Списание с баланса',
    refund: 'Возврат',
  },
  uz: {
    deposit: 'Hisobni to\'ldirish',
    withdrawal: 'Balansdan yechildi',
    refund: 'Qaytarish',
  },
}

/**
 * «27.01.2024 • 18:58».
 *
 * Разбираем ISO-строку буквально, а НЕ через `new Date(...).getHours()`.
 * Бэкенд живёт в `Asia/Tashkent` (USE_TZ=True) и отдаёт время уже со своим
 * смещением «+05:00»; процесс Nitro запускают где угодно, и приведение к
 * локальному времени сервера сдвинуло бы час, который покупатель видел в
 * момент операции. У даты заказа (`orders.get.ts`) цена такой ошибки —
 * сутки на границе, здесь она видна сразу, на каждой строке.
 */
function stamp(value: string): string {
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value ?? '')
  if (!parts) return ''
  const [, year, month, day, hour, minute] = parts
  return `${day}.${month}.${year} • ${hour}:${minute}`
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const locale = (getHeader(event, 'accept-language') || 'uz').split('-')[0]!
  const labels = TYPE_LABEL[locale] ?? TYPE_LABEL.uz!

  // Экран истории рисует всё, что пришло: пагинации в нём нет. Берём одной
  // страницей с потолком в сотню — тем же приёмом, что и «Избранное».
  // Хвост длинной истории не покажется, но это лучше, чем тянуть её всю.
  const response = await upstream<unknown>(event, '/payment/wallet/transactions/', {
    auth: true,
    query: { limit: 100, offset: 0 },
  })

  return ok(items<UpstreamTransaction>(response).map((transaction) => {
    const income = isIncome(transaction.type)

    return {
      // Договор карточки (`TransactionCard.vue`) держит id числом, а у
      // бэкенда это UUID из `BaseModel`. Отдаём UUID как есть: он тут
      // работает только ключом списка, а `Number(uuid)` дал бы NaN на
      // каждой строке. Чинить это должен сам тип, а не адаптер.
      id: transaction.id,
      // Подпись — название типа операции. Неизвестный код (в модели их
      // три, но список могут расширить) печатаем тем, что прислал бэкенд,
      // а не пустотой. Поле `description` намеренно НЕ берём: туда пишут
      // служебный текст вида «Shop order <uuid>»
      // (apps/shop/services/checkout.py), и он утёк бы на экран.
      title: labels[transaction.type] ?? transaction.type_display ?? '',
      // Номер связанного заказа магазина; у пополнения его нет вовсе.
      // Карточка сама переключается на «Номер заказ: …», когда он есть.
      orderNumber: transaction.order_code ?? '',
      // Сумма здесь — уже ГОТОВАЯ СТРОКА в сумах, а не `Money`: карточка
      // печатает её как есть и дописывает «сум» отдельным элементом.
      // Всё равно гоняем через `money()`: тогда правило округления у этой
      // строки то же самое, что у любой цены в проекте, и «96118.00»
      // превращается в 9611800 тийин, а уже из них — в «96 118».
      amount: `${income ? '+' : '-'}${groupDigits(toSum(money(transaction.amount)))}`,
      positive: income,
      date: stamp(transaction.created_at),
      // «9860 08** **** 6548» либо название провайдера. Маска есть только
      // у оплат СОХРАНЁННОЙ картой (`Order.user_card`); разовая карта,
      // наличные и редирект в шлюз её не оставляют. Печатаем ровно ту
      // строку, которую бэкенд уже замаскировал сам, — восстанавливать
      // или дополнять номер здесь нечем и незачем.
      //
      // Провайдер приходит из `get_payment_provider_display()` и всегда
      // по-английски: метки `Order.ProviderChoices` — обычные строки, без
      // `gettext`, переводить их нечему. «Wallet» вместо «Через баланс» —
      // это то, что реально лежит в записи.
      //
      // Если операция не привязана к платёжному заказу (бонус, возврат,
      // ручное начисление), нет ни того, ни другого — строка остаётся
      // пустой, и карточка просто не печатает способ.
      method: transaction.card_mask ?? transaction.payment_method ?? '',
    }
  }))
})
