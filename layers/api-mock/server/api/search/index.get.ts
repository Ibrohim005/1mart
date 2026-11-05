import { localizeCategories } from '../../../mocks/category-i18n'
import { brandTitleOf, categories, productCards, rootOfCategory, searchTextOf, subcategoryTextOf } from '../../../mocks/data'
import { CATEGORY_FACETS, COLORS, COUNTRIES, FILTER_TITLES, MATERIALS, compareSizes, memoryLabel, mockLocale } from '../../../mocks/facets'
import type { FacetCode, MockLocale } from '../../../mocks/facets'
import { fromLatinLayout, hasWordPrefix, matches, normalize, suggest } from '../../utils/fuzzy'
import type { Filter, FilterValue, ProductCard, ProductFacets, SearchResult } from '#shared/types/catalog'

type Card = ProductCard

/** Фасеты с одним значением у товара и со списком значений (память, размер) */
const SINGLE_FACETS = ['brand', 'color', 'country', 'material'] as const
const LIST_FACETS = ['memory', 'size'] as const

export default defineEventHandler((event) => {
  const query = getQuery(event) as Record<string, string>
  const { q = '', page = '1', perPage = '6', sort = 'popular' } = query
  const locale = mockLocale(getHeader(event, 'accept-language'))

  /**
   * Ищем по названию, бренду, разделу и синонимам раздела: «телефон»
   * находит смартфоны, «духи» — парфюмерию, «iphone» — по латинскому бренду.
   * И по слагу: в адресе слаги латиницей, и запрос иногда набирают так же.
   *
   * Строгое вхождение — первым шагом, оно точнее. Если оно не дало ничего,
   * пробуем забытую раскладку, а потом прощаем опечатки.
   */
  const needle = normalize(q)
  /** ?exact=1 — искать ровно как набрано: по ссылке «искать так, как я написал» */
  const exact = String(query.exact ?? '') === '1'
  let filtered: Card[]
  /** Запрос, по которому реально собрана выдача, если он отличается от введённого */
  let correctedTo: string | null = null

  const strict = (value: string) => productCards.filter(p =>
    hasWordPrefix(searchTextOf(p), value) || p.slug.toLowerCase().includes(value),
  )
  const fuzzy = (value: string) => productCards.filter(p => matches(value, searchTextOf(p)) || matches(value, p.slug))

  if (!needle) {
    filtered = [...productCards]
  }
  else {
    filtered = strict(needle)

    // Несколько слов («iphone 256») строгим вхождением фразы не находятся —
    // пословное сравнение без опечаток идёт раньше исправления раскладки
    if (!filtered.length && needle.includes(' '))
      filtered = productCards.filter(p => needle.split(' ').every(part => hasWordPrefix(searchTextOf(p), part)))

    if (!filtered.length && !exact) {
      const relayout = normalize(fromLatinLayout(needle))
      const byLayout = relayout === needle ? [] : strict(relayout)
      if (byLayout.length) {
        filtered = byLayout
        correctedTo = relayout
      }
    }

    if (!filtered.length && !exact)
      filtered = fuzzy(needle)
  }

  /*
   * Вид подборки — тот же, что у полок главной. Нужен, чтобы «Смотреть все»
   * открывало именно ту подборку, а не общий поиск.
   */
  const kind = String(query.kind ?? '')
  if (kind === 'discounts' || kind === 'wow') {
    filtered = filtered.filter(p => p.discountPercent !== null)
    if (kind === 'wow') filtered = filtered.slice().reverse()
  }
  else if (kind === 'new') {
    filtered = filtered.filter(p => p.badges?.some(badge => badge.kind === 'new'))
  }

  /**
   * Категория сужает выдачу. Слаг может быть и корневым («Электроника»), и
   * подкатегорией («Смартфоны») — каталог в шапке ведёт на обе.
   */
  const categorySlug = String(query.categorySlug ?? '')
  const inCategory = (p: Card) => !categorySlug || categorySlug === 'vse' || !rootOfCategory(categorySlug)
    || p.facets?.categorySlug === categorySlug || p.facets?.subcategorySlug === categorySlug
  filtered = filtered.filter(inCategory)

  /**
   * Подкатегории из диалога выбора: ?category=slug1,slug2.
   * Сравниваем с подкатегорией товара и с корневой категорией.
   */
  const picked = String(query.category ?? '').split(',').filter(Boolean)
  if (picked.length) {
    filtered = filtered.filter(p =>
      picked.includes(p.facets?.subcategorySlug ?? '') || picked.includes(p.facets?.categorySlug ?? ''),
    )
  }

  /**
   * Значения фильтров приходят списком через запятую.
   * «all» означает «не сужать» — так отмечен первый вариант в списке.
   */
  const selectedOf = (code: string) => String(query[code] ?? '').split(',').filter(Boolean).filter(v => v !== 'all')
  for (const code of SINGLE_FACETS) {
    const wanted = selectedOf(code)
    if (!wanted.length) continue
    filtered = filtered.filter(p => wanted.includes(String(p.facets?.[code] ?? '')))
  }
  for (const code of LIST_FACETS) {
    const wanted = selectedOf(code)
    if (!wanted.length) continue
    filtered = filtered.filter(p => (p.facets?.[code] ?? []).some(value => wanted.includes(value)))
  }

  // Диапазон цены приходит из сайдбара как price_from / price_to (в сумах)
  const priceFrom = Number(query.price_from)
  const priceTo = Number(query.price_to)
  if (Number.isFinite(priceFrom) && priceFrom > 0)
    filtered = filtered.filter(p => p.price.amount >= priceFrom * 100)
  if (Number.isFinite(priceTo) && priceTo > 0)
    filtered = filtered.filter(p => p.price.amount <= priceTo * 100)

  // Сортировка выдачи — те же варианты, что в выпадающем списке
  const sorters: Record<string, (a: Card, b: Card) => number> = {
    popular: (a, b) => b.ordersCount - a.ordersCount,
    priceAsc: (a, b) => a.price.amount - b.price.amount,
    priceDesc: (a, b) => b.price.amount - a.price.amount,
    rating: (a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount,
    // «Сначала новые» в моке — по убыванию его собственного автоинкремента
    new: (a, b) => Number(b.id) - Number(a.id),
  }
  // «Популярные» без явной сортировки оставляют порядок каталога вперемешку
  // по разделам — иначе первой страницей всегда шли бы одни продукты
  if (sort !== 'popular' || needle || categorySlug)
    filtered = filtered.sort(sorters[sort] ?? sorters.popular!)

  // По запросу «Популярные» сначала идут товары, где запрос есть в самом
  // названии, потом — в названии их подкатегории: на «телефон» — смартфоны,
  // а не чехлы «для телефона»
  if (needle && sort === 'popular') {
    const term = correctedTo ?? needle
    const rank = (p: Card) => (hasWordPrefix(p.title, term) ? 2 : 0) + (hasWordPrefix(subcategoryTextOf(p), term) ? 1 : 0)
    filtered = filtered.sort((a, b) => rank(b) - rank(a))
  }

  const pageNum = Number(page)
  const size = Number(perPage)
  const start = (pageNum - 1) * size

  /**
   * По какой выборке строим фильтры: по тому, что нашлось по запросу и
   * категории, до применения фасетов. Иначе после выбора одного бренда
   * остальные исчезали бы, а на запрос «телефон» предлагались бы бренды
   * платьев, по которым в этой выдаче ноль.
   */
  const forFilters = (() => {
    let base = productCards
    if (needle) {
      base = base.filter(p => hasWordPrefix(searchTextOf(p), needle)
        || p.slug.toLowerCase().includes(needle)
        || matches(needle, searchTextOf(p)))
    }
    base = base.filter(inCategory)
    if (picked.length) {
      base = base.filter(p =>
        picked.includes(p.facets?.subcategorySlug ?? '') || picked.includes(p.facets?.categorySlug ?? ''))
    }
    return base.length ? base : productCards
  })()

  const result: SearchResult = {
    items: filtered.slice(start, start + size),
    total: filtered.length,
    page: pageNum,
    perPage: size,
    categories: localizeCategories(categories, locale),
    filters: filtersFor(forFilters, locale, facetsOfCategory(categorySlug, picked)),
    correctedTo,
    // Подсказку считаем только когда показать нечего — иначе она мешает
    suggestion: needle && !filtered.length ? suggest(needle, productCards.map(p => searchTextOf(p))) : null,
  }

  return ok(result)
})

/**
 * Набор фасетов раздела. Подкатегория берёт набор своего корня; выбранные в
 * диалоге подкатегории из разных разделов объединяют их наборы. Без
 * категории — `null`, то есть «всё, что есть в выдаче».
 */
function facetsOfCategory(categorySlug: string, picked: string[]): Set<FacetCode> | null {
  const roots = [categorySlug, ...picked]
    .filter(slug => slug && slug !== 'vse')
    .map(slug => rootOfCategory(slug))
    .filter((root): root is string => Boolean(root && CATEGORY_FACETS[root]))
  if (!roots.length) return null
  return new Set(roots.flatMap(root => CATEGORY_FACETS[root]!))
}

/** Значения фасета в выборке со счётчиками, частые — первыми */
function countValues(items: Card[], pick: (facets: ProductFacets) => string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const item of items) {
    if (!item.facets) continue
    for (const value of pick(item.facets)) {
      if (value) counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }
  return counts
}

/**
 * Фильтры собираются из самой выдачи: бренды, цвета, память, размеры,
 * материалы и страны — только те, что есть у найденных товаров. Фильтр с
 * одним значением не показываем: сузить им нечего.
 * TODO: Connect to backend endpoint GET /catalog/filters
 */
function filtersFor(items: Card[], locale: MockLocale, allowed: Set<FacetCode> | null): Filter[] {
  const fits = (code: FacetCode) => !allowed || allowed.has(code)
  const all: FilterValue = { value: 'all', title: FILTER_TITLES.all![locale] }
  const prices = items.map(item => item.price.amount / 100)
  const filters: Filter[] = []
  const minPrice = Math.floor(Math.min(...prices))
  const maxPrice = Math.ceil(Math.max(...prices))
  // Одна цена на всю выборку — диапазоном сузить нечего
  if (maxPrice > minPrice) {
    filters.push({
      code: 'price',
      title: FILTER_TITLES.price![locale],
      type: 'range',
      min: minPrice,
      max: maxPrice,
      resettable: true,
    })
  }

  const byCount = (counts: Map<string, number>) => [...counts.entries()].sort((a, b) => b[1] - a[1])

  // Бренд: подпись — как пишется сам бренд
  const brandTitles = new Map<string, string>()
  for (const item of items) {
    const code = item.facets?.brand
    if (code && !brandTitles.has(code)) brandTitles.set(code, brandTitleOf(item.id))
  }
  const brands = byCount(countValues(items, f => [f.brand]))
  if (fits('brand') && brands.length > 1) {
    filters.push({
      code: 'brand',
      title: FILTER_TITLES.brand![locale],
      type: 'checkbox',
      resettable: true,
      values: [all, ...brands.map(([value, count]) => ({ value, title: brandTitles.get(value) ?? value, count }))],
    })
  }

  const colors = byCount(countValues(items, f => [f.color]))
  if (fits('color') && colors.length > 1) {
    filters.push({
      code: 'color',
      title: FILTER_TITLES.color![locale],
      type: 'color',
      resettable: true,
      values: colors.map(([value, count]) => ({
        value,
        title: COLORS[value]?.[locale] ?? value,
        swatch: COLORS[value]?.swatch,
        count,
      })),
    })
  }

  const memory = [...countValues(items, f => f.memory ?? []).entries()]
    .sort((a, b) => memoryBytes(a[0]) - memoryBytes(b[0]))
  if (fits('memory') && memory.length > 1) {
    filters.push({
      code: 'memory',
      title: FILTER_TITLES.memory![locale],
      type: 'buttons',
      resettable: true,
      values: memory.map(([value, count]) => ({ value, title: memoryLabel(value, locale), count })),
    })
  }

  const sizes = [...countValues(items, f => f.size ?? []).entries()].sort((a, b) => compareSizes(a[0], b[0]))
  if (fits('size') && sizes.length > 1) {
    filters.push({
      code: 'size',
      title: FILTER_TITLES.size![locale],
      type: 'buttons',
      resettable: true,
      values: sizes.map(([value, count]) => ({ value, title: value, count })),
    })
  }

  const materials = byCount(countValues(items, f => (f.material ? [f.material] : [])))
  if (fits('material') && materials.length > 1) {
    filters.push({
      code: 'material',
      title: FILTER_TITLES.material![locale],
      type: 'checkbox',
      resettable: true,
      values: [all, ...materials.map(([value, count]) => ({ value, title: MATERIALS[value]?.[locale] ?? value, count }))],
    })
  }

  const countries = byCount(countValues(items, f => [f.country]))
  if (fits('country') && countries.length > 1) {
    filters.push({
      code: 'country',
      title: FILTER_TITLES.country![locale],
      type: 'checkbox',
      resettable: true,
      values: [all, ...countries.map(([value, count]) => ({ value, title: COUNTRIES[value]?.[locale] ?? value, count }))],
    })
  }

  return filters
}

/** `128gb` → 128, `1tb` → 1024: для сортировки по объёму */
function memoryBytes(code: string): number {
  const match = /^(\d+)(gb|tb)$/.exec(code)
  if (!match) return 0
  return Number(match[1]) * (match[2] === 'tb' ? 1024 : 1)
}
