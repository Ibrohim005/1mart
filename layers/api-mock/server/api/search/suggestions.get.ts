import { searchTextOf } from '../../../mocks/data'
import { visibleCards } from '../../utils/org-input'
import { fromLatinLayout, hasWordPrefix, matches, normalize } from '../../utils/fuzzy'

/**
 * Подсказки в строке поиска. Ищут там же, где и выдача — по названию,
 * бренду и синонимам раздела, — и так же прощают опечатку и забытую
 * раскладку: иначе подсказки исчезали на первой же лишней букве.
 *
 * TODO: Connect to backend endpoint GET /search/suggestions
 */
export default defineEventHandler((event) => {
  // Сотрудник ищет только в открытых ему категориях
  const cards = visibleCards(event)
  const { q = '' } = getQuery(event) as Record<string, string>
  const needle = normalize(String(q))
  if (!needle) return ok([])

  const strict = (value: string) => cards.filter(p => hasWordPrefix(searchTextOf(p), value))

  let found = strict(needle)
  if (!found.length) {
    const relayout = normalize(fromLatinLayout(needle))
    if (relayout !== needle) found = strict(relayout)
  }
  if (!found.length) found = cards.filter(p => matches(needle, searchTextOf(p)))

  // Сначала товары, где запрос есть в самом названии, — они точнее
  found = [...found].sort((a, b) =>
    Number(hasWordPrefix(b.title, needle)) - Number(hasWordPrefix(a.title, needle)))

  return ok(found.slice(0, 8))
})
