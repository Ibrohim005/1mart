/**
 * Устойчивость поиска к опечаткам и подсказка «возможно, вы искали».
 *
 * До этого поиск был строгим `includes`: «ооооопечатка» или «чехол» с лишней
 * буквой давали ноль товаров, хотя нужный товар лежал рядом.
 *
 * Логика намеренно простая и предсказуемая, чтобы бэкенд мог повторить её
 * один в один или заменить полнотекстовым индексом, не меняя контракт:
 * ответ поиска получает поля `correctedFrom` и `suggestion`.
 *
 * TODO: Connect to backend endpoint GET /search (fuzzy на стороне бэкенда)
 */

/** Раскладка: пользователь набирает «xt[jk» вместо «чехол», не переключив язык */
const LAYOUT: Record<string, string> = {
  q: 'й', w: 'ц', e: 'у', r: 'к', t: 'е', y: 'н', u: 'г', i: 'ш', o: 'щ', p: 'з',
  '[': 'х', ']': 'ъ', a: 'ф', s: 'ы', d: 'в', f: 'а', g: 'п', h: 'р', j: 'о',
  k: 'л', l: 'д', ';': 'ж', '\'': 'э', z: 'я', x: 'ч', c: 'с', v: 'м', b: 'и',
  n: 'т', m: 'ь', ',': 'б', '.': 'ю',
}

/** Регистр, ё и лишние пробелы не должны влиять на совпадение */
export function normalize(value: string) {
  return value.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim()
}

/**
 * Запрос встречается в тексте с начала слова: «рис» находит «Рис девзира»,
 * но не «серебристый», а «телефон» — и «телефона». Строгий шаг поиска
 * сравнивает так, а не простым вхождением в середину слова.
 */
export function hasWordPrefix(text: string, value: string) {
  const haystack = normalize(text)
  let index = haystack.indexOf(value)
  while (index !== -1) {
    if (index === 0 || !/[\p{L}\p{N}]/u.test(haystack[index - 1]!)) return true
    index = haystack.indexOf(value, index + 1)
  }
  return false
}

/** Тот же запрос, набранный в латинской раскладке */
export function fromLatinLayout(value: string) {
  return value.replace(/[a-z[\];',.]/gi, char => LAYOUT[char.toLowerCase()] ?? char)
}

/**
 * Расстояние Дамерау — Левенштейна: учитывает и перестановку соседних букв
 * («чеохл» → «чехол»), самую частую опечатку при быстром наборе.
 * Считаем с ранним выходом: если вся строка уже дальше лимита, дальше не идём.
 */
export function distance(a: string, b: string, limit = Infinity) {
  if (a === b) return 0
  if (!a.length || !b.length) return Math.max(a.length, b.length)
  if (Math.abs(a.length - b.length) > limit) return limit + 1

  let prev2: number[] = []
  let prev: number[] = Array.from({ length: b.length + 1 }, (_, i) => i)

  for (let i = 1; i <= a.length; i += 1) {
    const current: number[] = [i]
    let best = i

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let value = Math.min(current[j - 1]! + 1, prev[j]! + 1, prev[j - 1]! + cost)

      // Перестановка соседних символов стоит один шаг, а не два
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        value = Math.min(value, prev2[j - 2]! + 1)

      current[j] = value
      if (value < best) best = value
    }

    if (best > limit) return limit + 1
    prev2 = prev
    prev = current
  }

  return prev[b.length]!
}

/**
 * Сколько опечаток прощаем слову. Короткие слова правим осторожно: на трёх
 * буквах даже одна замена превращает «лак» в «лук» — а это другой запрос.
 */
export function tolerance(word: string) {
  if (word.length <= 3) return 0
  if (word.length <= 5) return 1
  if (word.length <= 9) return 2
  return 3
}

/** Разбор на слова: точки и запятые из названий не должны попадать в сравнение */
function words(text: string) {
  return text.split(/[^\p{L}\p{N}]+/u).filter(Boolean)
}

/**
 * Соседние буквы переставлены местами: «чеохл» вместо «чехол».
 * Такую опечатку прощаем и коротким словам — она однозначна, в отличие от
 * замены буквы, которая превращает «лак» в «лук», то есть в другой запрос.
 */
function isSwap(a: string, b: string) {
  if (a.length !== b.length) return false

  const diff: number[] = []
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) diff.push(i)
    if (diff.length > 2) return false
  }

  if (diff.length !== 2) return false
  const [first, second] = diff as [number, number]
  return second === first + 1 && a[first] === b[second] && a[second] === b[first]
}

/**
 * Слово запроса похоже на слово товара: вхождение, общее начало или опечатка.
 * Обратное вхождение (слово товара внутри запроса) проверять нельзя:
 * «смартфоне» содержит «он», и по нему находились бы чехлы «для iPhone».
 */
function wordMatches(needle: string, word: string) {
  if (word.includes(needle)) return true
  if (isSwap(needle, word.slice(0, needle.length))) return true

  const limit = tolerance(needle)
  if (!limit) return false

  // Длинное название и короткий запрос: сравниваем с началом слова,
  // иначе «смартфо» никогда не дотянется до «смартфонами»
  const head = word.slice(0, needle.length + limit)
  return distance(needle, head, limit) <= limit
}

/**
 * Совпадает ли текст (название или слаг) с запросом.
 * Все слова запроса должны найтись — иначе «чехол iphone» выдавал бы и все чехлы, и все айфоны.
 */
export function matches(needle: string, haystack: string) {
  const text = normalize(haystack)
  if (text.includes(needle)) return true

  const parts = words(text)
  return words(needle).every(part => parts.some(word => wordMatches(part, word)))
}

/**
 * Подсказка «возможно, вы искали»: правим каждое слово запроса по словарю
 * названий. Считаем чуть свободнее, чем сам поиск (порог на единицу больше),
 * иначе подсказка появлялась бы ровно там, где выдача и так не пуста.
 *
 * Многословные запросы правим пословно: «чехол айфан» ломался на втором
 * слове, и подсказки по фразе целиком не находилось никогда.
 */
export function suggest(needle: string, corpus: string[]) {
  const query = normalize(needle)
  if (query.length < 3) return null

  const vocabulary = new Set<string>()
  for (const title of corpus) {
    for (const word of words(normalize(title))) {
      if (word.length >= 3) vocabulary.add(word)
    }
  }

  let changed = false
  const fixed = words(query).map((part) => {
    // Слово знакомо словарю (целиком или как начало) — не трогаем
    if (part.length < 3) return part
    for (const word of vocabulary) {
      if (word.startsWith(part) || part.startsWith(word)) return part
    }

    let best: string | null = null
    let bestDistance = Infinity
    const limit = tolerance(part) + 1

    for (const word of vocabulary) {
      const value = distance(part, word, limit)
      if (value < bestDistance) {
        bestDistance = value
        best = word
      }
    }

    if (best === null || bestDistance > limit) return part
    changed = true
    return best
  })

  return changed ? fixed.join(' ') : null
}
