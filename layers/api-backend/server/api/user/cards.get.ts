/**
 * Привязанные карты — `GET /payment/cards/` (CardListCreateAPIView.get +
 * SavedCardSerializer, apps/payment/api_endpoints/Cards/).
 *
 * Только СПИСОК. Привязка карты (`POST /payment/cards/`, затем
 * `/cards/<id>/confirm/` и `/cards/<id>/resend-otp/`) уходит в платёжный
 * шлюз и сюда не переносится — диалог «Добавить карту» остаётся тем, чем
 * был: формой без запроса (см. AddCardModal.vue, он только эмитит `save`).
 *
 * Номер карты. Бэкенд хранит его уже замаскированным
 * (`UserCard.masked_card_number`, вид «**** **** **** 4408») и полного PAN
 * не отдаёт вовсе. Печатаем строку как есть: ни дополнять, ни перекраивать
 * её под вид макета («•••• 4408») нельзя — маску задаёт та сторона, и
 * подгонка сделала бы номер похожим на настоящий там, где его нет.
 *
 * Пагинации у вьюхи нет: это `APIView`, а не `ListAPIView`, и она отвечает
 * голым массивом. Всё равно разворачиваем через `items()` — `PAGE_SIZE`
 * в проекте задан по-вьюшно, и добавить туда пагинацию могут без нас.
 *
 * Порядок. Бэкенд сортирует по `created_at` по возрастанию, а «карта по
 * умолчанию» у него определена ровно как первая по этой же сортировке
 * (`SavedCardSerializer.get_is_default`). Диалог выбора предвыделяет первую
 * строку списка — значит порядок бэкенда уже даёт нужную карту, и
 * пересортировывать нечего. Само поле `is_default` в контракт диалога
 * (`{ id, title, subtitle }`) не входит и отбрасывается.
 */
interface UpstreamCard {
  id: string
  provider: string
  pan_mask: string
  brand: string
  expiry: string
  is_default: boolean | null
  created_at: string
}

/**
 * «до 09/27». Подписи на сервере не переводятся, поэтому обе живут здесь —
 * так же, как статусы заказа в `orders.get.ts`.
 */
const UNTIL: Record<string, (expiry: string) => string> = {
  ru: expiry => `до ${expiry}`,
  uz: expiry => `${expiry} gacha`,
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const locale = (getHeader(event, 'accept-language') || 'uz').split('-')[0]!
  const until = UNTIL[locale] ?? UNTIL.uz!

  const response = await upstream<unknown>(event, '/payment/cards/', { auth: true })

  return ok(items<UpstreamCard>(response).map(card => ({
    id: card.id,
    // Бренд («UZCARD», «HUMO») плюс маска. Оба поля бэкенд может отдать
    // пустыми — `expiry` объявлен `blank=True`, а маску пишет заглушка
    // привязки, — поэтому склеиваем только непустое, чтобы не получить
    // строку из одного пробела.
    title: [card.brand, card.pan_mask].filter(Boolean).join(' '),
    subtitle: card.expiry ? until(card.expiry) : '',
  })))
})
