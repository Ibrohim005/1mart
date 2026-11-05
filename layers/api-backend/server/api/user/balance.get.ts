import type { Money } from '#shared/types/catalog'
import { money } from '../../lib/money'

/**
 * Баланс кошелька — `GET /payment/wallet/` (WalletDetailView +
 * WalletSerializer, apps/payment/api_endpoints/Wallet/).
 *
 * Только ЧТЕНИЕ. Пополнение идёт через платёжный шлюз и здесь не трогается
 * вовсе: карточка баланса в меню кабинета и строка «списать с баланса» на
 * оформлении показывают цифру, а не двигают её.
 *
 * Деньги. Бэкенд хранит баланс `DecimalField(max_digits=14, decimal_places=2)`
 * и отдаёт его ДЕСЯТИЧНОЙ СТРОКОЙ («2500000.00»), а `Money` во фронте — это
 * целые тийины. Перевод делает только `money()` из `../../lib/money`
 * (импорт обязан быть явным: файл намеренно вне автоимпорта Nitro, иначе он
 * перебивал бы одноимённый хелпер из layers/shared, который принимает сумы).
 * Ошибка в сто раз именно здесь была бы самой дорогой на весь кабинет.
 *
 * Валюта. `WalletSerializer.get_currency` жёстко возвращает «UZS», отдельного
 * поля в модели нет — поэтому берём валюту из `money()`, а не из ответа:
 * тип `Money` другой валюты и не допускает.
 *
 * Анонимы. Вьюха закрыта `IsAuthenticated`, но `SilentJWTAuthentication`
 * молча делает запрос без токена анонимным — и `Wallet.objects.get_or_create`
 * тогда бы вовсе упал. Проверяем токен ДО вызова: «вы не вошли» и «на счету
 * ноль» — разные вещи, и показывать гостю честный ноль нельзя.
 */
interface UpstreamWallet {
  wallet_id: number
  balance: string
  currency: string
}

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const wallet = await upstream<UpstreamWallet>(event, '/payment/wallet/', { auth: true })

  return ok<Money>(money(wallet.balance))
})
