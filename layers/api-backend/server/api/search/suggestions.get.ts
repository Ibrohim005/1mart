import type { ProductCard } from '#shared/types/catalog'
import type { UpstreamProduct } from '../../utils/product'
import { productCard } from '../../utils/product'

/**
 * Подсказки в строке поиска.
 *
 * Отдельного эндпоинта подсказок у бэкенда нет, поэтому берём начало обычной
 * выдачи каталога: сериализатор там тот же, что у списка товаров, а мок и так
 * отдавал полные карточки (первые восемь) — форма совпадает без натяжек.
 *
 * Что при этом теряется: мок прощал опечатку и забытую раскладку (fuzzy +
 * перекладка латиницы на кириллицу), а у бэкенда `search` — это обычный
 * icontains по name и description на трёх языках, без нечёткого сравнения.
 * Проверено на бою: `?search=echki` находит 2 товара, `?search=ечки` — ноль.
 * То есть подсказки станут строже, чем были на моках.
 *
 * Роут всё равно переводим: восемь строгих подсказок ведут на существующие
 * товары, а восемь снисходительных вели на выдуманные — карточка по такой
 * подсказке просто не открывалась бы. Вернуть терпимость к опечаткам можно
 * только на бэкенде (trigram-индекс), обвязкой здесь это не лечится.
 */
const SUGGESTION_LIMIT = 8

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as Record<string, unknown>
  const q = String(query.q ?? '').trim()
  const locale = (getHeader(event, 'accept-language') || 'uz').split('-')[0]!

  // Пустой запрос до бэкенда не доводим: там он вернул бы первую страницу
  // всего каталога, то есть «подсказки» на пустом поле ввода.
  if (!q) return ok<ProductCard[]>([])

  const response = await upstream<unknown>(event, '/shop/products/', {
    query: { search: q, limit: SUGGESTION_LIMIT, offset: 0 },
  })

  return ok<ProductCard[]>(
    items<UpstreamProduct>(response).map(product => productCard(product, locale)),
  )
})
