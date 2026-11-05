import type { SearchResult } from '#shared/types/catalog'
import type { UpstreamProduct } from '../../utils/product'
import { productCard } from '../../utils/product'
import { paging } from '../../utils/paging'

/**
 * Каталог и поиск — один роут, как и в моке: страница категории это тот же
 * список с прижатой категорией.
 *
 * Сортировка уходит в `?sort=` — у этого эндпоинта НЕ работает `?ordering=`:
 * `OrderingFilter` там не подключён ни глобально, ни во вьюхе, и параметр
 * молча игнорируется.
 *
 * Здесь НЕТ `recommended`, и это главное в таблице. На бэкенде он не только
 * сортирует, но и выбрасывает товары без остатка (`_apply_sorting`) — а на
 * странице категории это как раз сортировка по умолчанию: SortBar при выборе
 * «Рекомендуем» УБИРАЕТ `?sort` из адреса, поэтому «ничего не выбрано» и
 * «выбрано Рекомендуем» — один и тот же URL, и страница подставляет
 * `popular`. В итоге категория молча отдавала пустую выдачу вместо своих
 * товаров: в демо-каталоге так пропали все четыре.
 *
 * Отбрасывать распроданное уместно на витринной полке «Рекомендуем»
 * (`shelf.get.ts`), где смысл именно в «что можно купить сейчас», и неуместно
 * в списке категории, который покупатель открыл, чтобы увидеть её состав.
 * Поэтому `popular` едет в `most_liked` — тот же сигнал популярности
 * (избранное), но только порядок, без потери строк.
 */
const SORT: Record<string, string> = {
  popular: 'most_liked',
  priceAsc: 'price_asc',
  priceDesc: 'price_desc',
  rating: 'rating',
  new: 'newest',
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as Record<string, unknown>
  const page = paging(query)
  const locale = (getHeader(event, 'accept-language') || 'uz').split('-')[0]!

  const sort = String(query.sort ?? 'popular')
  const upstreamQuery: Record<string, unknown> = {
    limit: page.limit,
    offset: page.offset,
    sort: SORT[sort] ?? SORT.popular,
  }

  if (query.q) upstreamQuery.search = query.q

  /*
   * Справочник категорий едет в КАЖДОМ ответе поиска, потому что страница
   * категории берёт из него и свой заголовок, и подкатегории для сайдбара
   * (`categories.find(c => c.slug === slug)`). Пока его не было, страница
   * падала с 500 на каждой категории — товары приходили, а рисовать их
   * было некому. Так же устроен и мок, так что это его контракт, а не наш
   * выбор.
   *
   * Вкладка «Животные/Товары» решает, какой набор фильтров спрашивать:
   * у бэкенда они разные по типу каталога, а не по конкретной категории.
   */
  const tab = query.tab === 'goods' ? 'product' : 'animal'

  // Категорию резолвим ДО фильтров: сайдбар теперь строится под неё, а не под
  // весь тип каталога (см. catalogFilters). Раньше оба запроса уходили
  // параллельно, и фильтрам просто нечего было передать.
  const category = query.categorySlug && query.categorySlug !== ALL_SLUG
    ? await categoryBySlug(event, String(query.categorySlug))
    : null

  const [categories, filters] = await Promise.all([
    categoryList(event),
    // Тип категории должен совпадать со вкладкой: id животного с
    // `?type=product` бэкенд отвечает 400. Несовпадение бывает при переключении
    // вкладки на странице категории — тогда это просто тип-уровневый сайдбар.
    catalogFilters(event, tab, locale, category?.kind === tab ? category.id : undefined),
  ])

  // Бэкенд фильтрует по UUID категории, а в URL у нас slug — переводим.
  // Неизвестный slug отдаём пустой выдачей, а не всем каталогом: показать
  // 1400 товаров под заголовком несуществующей категории хуже, чем показать
  // «ничего не найдено».
  // «Все» — сводная страница каталога, своей категории у неё нет:
  // фильтровать по ней нечего, набор товаров задаёт только вкладка.
  if (query.categorySlug && query.categorySlug !== ALL_SLUG) {
    if (!category) {
      return ok<SearchResult>({
        items: [],
        total: 0,
        page: page.page,
        perPage: page.perPage,
        filters,
        categories,
      })
    }
    upstreamQuery[category.kind === 'animal' ? 'category_animal' : 'category_product'] = category.id
  }

  // Цена фильтра — в сумах (то же число, что покупатель видит и вводит), и
  // бэкенд фильтрует по сумам, поэтому передаём как есть. Раньше здесь делили
  // на 100, считая ввод тийинами, — из-за чего набранные 5 000 000 сум
  // превращались в 50 000 и фильтр по цене не находил ничего (см. filters.ts).
  if (query.price_from) upstreamQuery.min_price = Number(query.price_from)
  if (query.price_to) upstreamQuery.max_price = Number(query.price_to)
  if (query.brand) upstreamQuery.brand = query.brand
  if (query.country) upstreamQuery.country_of_origin = query.country
  if (query.color) upstreamQuery.color = query.color

  /*
   * Остальные фишки сайдбара (animal_color, age_group, девять
   * species-специфичных gender_*, size, material, ...) — тот же ключ, каким
   * их назвал реестр VariantAttributeDefinition (`attribute.key` в
   * filters.ts), и тот же ключ ShopProductFilter теперь принимает как есть
   * (см. её docstring). Раньше этот код был белым списком из шести полей —
   * остальные 31 из 32 фишек сайдбара меняли адрес и не меняли выдачу.
   * Бэкенд сам сверяет имя параметра с реестром, так что тут достаточно не
   * задваивать уже обработанные выше/ниже и не протаскивать служебные.
   */
  const PASSTHROUGH_SKIP = new Set([
    'q', 'sort', 'page', 'perPage', 'limit', 'offset', 'categorySlug', 'tab', 'group',
    'price_from', 'price_to', 'brand', 'country', 'color',
  ])
  for (const [key, value] of Object.entries(query)) {
    if (PASSTHROUGH_SKIP.has(key) || value == null || value === '') continue
    upstreamQuery[key] = value
  }

  const response = await upstream<unknown>(event, '/shop/products/', { query: upstreamQuery })
  const products = items<UpstreamProduct>(response)
  const found = total(response, products.length)

  return ok<SearchResult>({
    items: products.map(product => productCard(product, locale)),
    total: found,
    page: page.page,
    perPage: page.perPage,
    filters,
    categories,
    // Исправление раскладки и «возможно, вы искали» — целиком выдумка
    // мока: у бэкенда нет ни того, ни другого, а подсказать не то слово
    // хуже, чем не подсказывать.
    correctedTo: null,
    suggestion: null,
  })
})
