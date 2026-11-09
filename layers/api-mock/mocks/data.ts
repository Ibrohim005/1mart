import type { Attribute, Category, Id, OptionGroup, Product, ProductCard, ReviewPreview, Seller, Sku } from '#shared/types/catalog'
import { CATALOG_GOODS, type RawGoods } from './catalog-goods'
import { COLORS, COUNTRIES, MATERIALS, brandCode, memoryCode } from './facets'

/** 1 сум = 100 тийин */
const uzs = (sum: number) => ({ amount: sum * 100, currency: 'UZS' as const })

/**
 * Номер сущности числом. Мок нумерует свои данные автоинкрементом, и на нём
 * держится вся внутренняя арифметика: sku = id * 10 + номер варианта.
 * Это собственный счётчик мока — у настоящего бэкенда id это UUID,
 * поэтому сужение живёт только здесь.
 */
const numericId = (id: Id): number => Number(id)

/** Транслитерация в латиницу — слаги должны быть читаемыми в URL */
const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .split('')
    .map(char => TRANSLIT[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Все товары мока */
const ITEMS: RawGoods[] = CATALOG_GOODS
const itemById = new Map<number, RawGoods>(ITEMS.map(item => [item.id, item]))
const thumbOf = (id: number) => itemById.get(id)?.thumbnail ?? ''

/* ------------------------------------------------------------------ */
/* Категории                                                           */
/* ------------------------------------------------------------------ */

type TreeNode = { slug: string, title: string, keywords: string, children: Array<{ slug: string, title: string, keywords: string }>, image: string }

/**
 * Дерево категорий в духе крупных маркетплейсов. `keywords` — синонимы для
 * поиска: «телефон» находит смартфоны, «духи» — парфюмерию. Наружу их не
 * отдаём, тип Category остаётся прежним.
 * TODO: Connect to backend endpoint GET /categories/root?depth=2
 */
const TREE: TreeNode[] = [
  {
    slug: 'elektronika', title: 'Электроника', keywords: 'электроника техника гаджеты elektronika electronics', image: thumbOf(1123),
    children: [
      { slug: 'smartfony', title: 'Смартфоны', keywords: 'телефон смартфон мобильный telefon smartfon phone' },
      { slug: 'planshety', title: 'Планшеты', keywords: 'планшет planshet tablet' },
      { slug: 'noutbuki', title: 'Ноутбуки', keywords: 'ноутбук компьютер noutbuk laptop' },
      { slug: 'aksessuary-dlya-telefonov', title: 'Аксессуары для телефонов', keywords: 'зарядка чехол аксессуары телефон' },
      { slug: 'naushniki', title: 'Наушники', keywords: 'наушники quloqchin headphones' },
      { slug: 'umnye-chasy', title: 'Умные часы', keywords: 'смарт часы smart watch' },
      { slug: 'foto-i-video', title: 'Фото и видео', keywords: 'камера штатив фото видео' },
    ],
  },
  {
    slug: 'bytovaya-tehnika', title: 'Бытовая техника', keywords: 'бытовая техника maishiy texnika appliances', image: thumbOf(1066),
    children: [
      { slug: 'kuhonnaya-tehnika', title: 'Техника для кухни', keywords: 'блендер микроволновка плита кухня' },
      { slug: 'umnyy-dom', title: 'Умный дом', keywords: 'умный дом колонка smart home' },
    ],
  },
  {
    slug: 'odezhda', title: 'Одежда', keywords: 'одежда kiyim clothes', image: thumbOf(1164),
    children: [
      { slug: 'platya', title: 'Женские платья', keywords: 'платье женская одежда ko\'ylak' },
      { slug: 'kostyumy-i-yubki', title: 'Костюмы и юбки', keywords: 'костюм юбка женская одежда' },
      { slug: 'muzhskaya-odezhda', title: 'Мужская одежда', keywords: 'мужская одежда рубашка футболка' },
    ],
  },
  {
    slug: 'obuv', title: 'Обувь', keywords: 'обувь poyabzal shoes', image: thumbOf(1088),
    children: [
      { slug: 'krossovki', title: 'Кроссовки и кеды', keywords: 'кроссовки кеды krossovka sneakers' },
      { slug: 'zhenskie-tufli', title: 'Женские туфли', keywords: 'туфли каблук женская обувь' },
      { slug: 'povsednevnaya-obuv', title: 'Повседневная обувь', keywords: 'повседневная обувь' },
      { slug: 'domashnyaya-obuv', title: 'Домашняя обувь', keywords: 'тапочки домашняя обувь' },
      { slug: 'butsy', title: 'Спортивная обувь', keywords: 'бутсы спортивная обувь' },
    ],
  },
  {
    slug: 'aksessuary', title: 'Аксессуары', keywords: 'аксессуары aksessuarlar accessories', image: thumbOf(1174),
    children: [
      { slug: 'sumki', title: 'Сумки и рюкзаки', keywords: 'сумка рюкзак sumka bag' },
      { slug: 'chasy', title: 'Часы', keywords: 'часы soat watch' },
      { slug: 'ukrasheniya', title: 'Украшения', keywords: 'украшения серьги бижутерия' },
      { slug: 'ochki', title: 'Очки', keywords: 'очки солнцезащитные ko\'zoynak' },
    ],
  },
  {
    slug: 'krasota-i-uhod', title: 'Красота и уход', keywords: 'красота уход косметика go\'zallik beauty', image: thumbOf(1008),
    children: [
      { slug: 'dekorativnaya-kosmetika', title: 'Косметика', keywords: 'косметика макияж kosmetika makeup' },
      { slug: 'manikyur', title: 'Маникюр', keywords: 'маникюр лак ногти' },
      { slug: 'parfyumeriya', title: 'Парфюмерия', keywords: 'духи парфюм аромат atir perfume' },
      { slug: 'uhod-za-kozhey', title: 'Уход за кожей', keywords: 'крем лосьон уход кожа' },
      { slug: 'uhod-za-telom', title: 'Уход за телом', keywords: 'гель мыло уход тело' },
    ],
  },
  {
    slug: 'dom-i-sad', title: 'Дом и сад', keywords: 'дом сад uy bog\' home', image: thumbOf(1012),
    children: [
      { slug: 'mebel', title: 'Мебель', keywords: 'мебель mebel furniture' },
      { slug: 'dekor', title: 'Декор', keywords: 'декор интерьер' },
      { slug: 'osveschenie', title: 'Освещение', keywords: 'лампа свет светильник' },
      { slug: 'posuda', title: 'Посуда', keywords: 'посуда idish' },
      { slug: 'kuhonnye-prinadlezhnosti', title: 'Кухонные принадлежности', keywords: 'кухня принадлежности' },
      { slug: 'kastryuli-i-skovorody', title: 'Кастрюли и сковороды', keywords: 'кастрюля сковорода' },
      { slug: 'hozyaystvennye-tovary', title: 'Хозяйственные товары', keywords: 'хозтовары бытовая химия' },
    ],
  },
  {
    slug: 'detskie-tovary', title: 'Детские товары', keywords: 'детские товары дети bolalar kids', image: thumbOf(1163),
    children: [
      { slug: 'detskaya-odezhda', title: 'Детская одежда', keywords: 'детская одежда bolalar kiyimi' },
      { slug: 'igrushki-i-myachi', title: 'Игрушки и мячи', keywords: 'игрушки мяч o\'yinchoq' },
      { slug: 'dlya-shkoly', title: 'Для школы', keywords: 'школа maktab' },
    ],
  },
  {
    slug: 'sport-i-otdyh', title: 'Спорт и отдых', keywords: 'спорт отдых sport', image: thumbOf(1140),
    children: [
      { slug: 'komandnye-igry', title: 'Командные игры', keywords: 'футбол баскетбол мяч' },
      { slug: 'tennis-i-badminton', title: 'Теннис и бадминтон', keywords: 'теннис бадминтон' },
      { slug: 'golf', title: 'Гольф', keywords: 'гольф golf' },
      { slug: 'beysbol-i-kriket', title: 'Бейсбол и крикет', keywords: 'бейсбол крикет' },
      { slug: 'sportivnoe-pitanie', title: 'Спортивное питание', keywords: 'протеин спортпит' },
    ],
  },
  {
    slug: 'avtotovary', title: 'Автотовары', keywords: 'авто машина мото avto mashina', image: thumbOf(1114),
    children: [
      { slug: 'avtomobili', title: 'Автомобили', keywords: 'автомобиль машина mashina car' },
      { slug: 'mototsikly', title: 'Мотоциклы', keywords: 'мотоцикл мототехника mototsikl' },
      { slug: 'skutery', title: 'Скутеры', keywords: 'скутер мопед мототехника' },
    ],
  },
  {
    slug: 'produkty-pitaniya', title: 'Продукты питания', keywords: 'продукты еда oziq-ovqat food', image: thumbOf(1040),
    children: [
      { slug: 'frukty-i-yagody', title: 'Фрукты и ягоды', keywords: 'фрукты ягоды mevalar' },
      { slug: 'ovoschi', title: 'Овощи', keywords: 'овощи sabzavotlar' },
      { slug: 'myaso-i-ryba', title: 'Мясо и рыба', keywords: 'мясо рыба go\'sht baliq' },
      { slug: 'molochnye-produkty-i-yaytsa', title: 'Молочные продукты и яйца', keywords: 'молоко яйца сут' },
      { slug: 'napitki', title: 'Напитки', keywords: 'напитки ichimliklar' },
      { slug: 'bakaleya', title: 'Бакалея', keywords: 'бакалея крупы масло' },
    ],
  },
]

export const categories: Category[] = [
  ...TREE.map((root, rootIndex): Category => {
    const id = rootIndex + 1
    return {
      id,
      slug: root.slug,
      group: 'goods',
      title: root.title,
      parentId: null,
      image: root.image,
      children: root.children.map((child, index) => ({
        id: id * 100 + index + 1,
        slug: child.slug,
        title: child.title,
        parentId: id,
        image: ITEMS.find(item => item.subcategory === child.slug)?.thumbnail,
      })),
    }
  }),
  // Сводная «Все»: лента категорий на главной ведёт сюда последней плиткой
  { id: 99, slug: 'vse', title: 'Все', parentId: null, image: '/mock/categories/vse.png' },
]

/** Слаг категории или подкатегории → синонимы для поиска */
const KEYWORDS = new Map<string, string>(
  TREE.flatMap(root => [[root.slug, `${root.title} ${root.keywords}`] as [string, string],
    ...root.children.map(child => [child.slug, `${child.title} ${child.keywords}`] as [string, string])]),
)

/* ------------------------------------------------------------------ */
/* Карточки                                                            */
/* ------------------------------------------------------------------ */

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

/**
 * Подпись доставки на кнопке карточки: «сегодня», «завтра», «послезавтра»,
 * дальше сразу дата — «15 августа». Считается от сегодняшнего дня.
 */
function deliveryDateIn(days: number) {
  if (days === 0) return 'сегодня'
  if (days === 1) return 'завтра'
  if (days === 2) return 'послезавтра'

  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

/** Часть товаров идёт без отзывов — блок отзывов на них не показывается */
export function hasReviews(id: Id): boolean {
  return numericId(id) % 11 !== 3
}

/** Категории, где выбор цвета на карточке товара осмыслен */
const NO_COLOR_GROUP = new Set(['produkty-pitaniya'])

function makeCard(item: RawGoods): ProductCard {
  const id = item.id
  const discount = item.oldPrice ? Math.round((1 - item.price / item.oldPrice) * 100) : null
  const reviewed = hasReviews(id)

  return {
    id,
    slug: `${slugify(item.title)}-${id}`,
    title: item.title,
    image: item.images[0] ?? item.thumbnail,
    // Все снимки товара — их листают точки под фото в карточке списка
    gallery: item.images,
    price: uzs(item.price),
    fullPrice: item.oldPrice ? uzs(item.oldPrice) : null,
    discountPercent: discount,
    rating: reviewed ? item.rating : 0,
    reviewsCount: reviewed ? item.reviews : 0,
    ordersCount: item.orders,
    badges: discount
      ? [{ kind: 'cheaper', label: 'СТАЛО ДЕШЕВЛЕ' }]
      : id % 3 === 0
        ? [{ kind: 'freeShipping', label: 'БЕСПЛАТНАЯ ДОСТАВКА' }]
        : id % 4 === 0
          ? [{ kind: 'new', label: 'НОВИНКА' }]
          : [],
    deliveryDate: deliveryDateIn(item.deliveryDays),
    available: item.stock > 0,
    facets: {
      categorySlug: item.category,
      subcategorySlug: item.subcategory,
      brand: brandCode(item.brand),
      country: item.country,
      color: item.color,
      ...(item.material ? { material: item.material } : {}),
      ...(item.memory ? { memory: item.memory.map(memoryCode) } : {}),
      ...(item.sizes ? { size: item.sizes } : {}),
    },
  }
}

/**
 * Порядок выдачи по умолчанию — вперемешку по разделам: полка «Рекомендуем»
 * берёт первые карточки, и подряд шли бы двадцать смартфонов.
 */
function interleave(items: RawGoods[]): RawGoods[] {
  const buckets = new Map<string, RawGoods[]>()
  for (const item of items) {
    const list = buckets.get(item.category) ?? []
    list.push(item)
    buckets.set(item.category, list)
  }
  // Внутри раздела сначала товары со скидкой и популярные — они и попадут на
  // полки; совсем дорогие (автомобили, люксовые часы) — в конец раздела
  const premium = (item: RawGoods) => Number(item.price >= 50_000_000)
  for (const list of buckets.values())
    list.sort((a, b) => premium(a) - premium(b) || Number(Boolean(b.oldPrice)) - Number(Boolean(a.oldPrice)) || b.orders - a.orders)

  const order = TREE.map(root => root.slug)
  const result: RawGoods[] = []
  for (let round = 0; result.length < items.length; round += 1) {
    for (const slug of order) {
      const item = buckets.get(slug)?.[round]
      if (item) result.push(item)
    }
  }
  return result
}

export const productCards: ProductCard[] = interleave(ITEMS).map(makeCard)

/** Текст, по которому ищет поиск: название, бренд, раздел и синонимы раздела */
const SEARCH_TEXT = new Map<Id, string>(productCards.map((card) => {
  const item = itemById.get(numericId(card.id))!
  return [card.id, [
    item.title, item.brand, item.keywords, ...(item.memory ?? []),
    KEYWORDS.get(item.category) ?? '', KEYWORDS.get(item.subcategory) ?? '',
  ].join(' ')]
}))

export function searchTextOf(card: ProductCard): string {
  return SEARCH_TEXT.get(card.id) ?? card.title
}

/** Название и синонимы подкатегории товара — для ранжирования выдачи */
export function subcategoryTextOf(card: ProductCard): string {
  return KEYWORDS.get(card.facets?.subcategorySlug ?? '') ?? ''
}

/** Название бренда, как оно пишется: «Dolce & Gabbana» для кода `dolce-and-gabbana` */
export function brandTitleOf(id: Id): string {
  return itemById.get(numericId(id))?.brand ?? ''
}

/** Подкатегория → корневая категория (для фильтра по подкатегории) */
export function rootOfCategory(slug: string): string | null {
  for (const root of TREE) {
    if (root.slug === slug) return root.slug
    if (root.children.some(child => child.slug === slug)) return root.slug
  }
  return null
}

/* ------------------------------------------------------------------ */
/* Продавцы                                                            */
/* ------------------------------------------------------------------ */

/**
 * Продавцы — вымышленные магазины. Товар закреплён за продавцом по разделу.
 * TODO: Connect to backend endpoint GET /sellers/{slug}
 */
export const sellers: Seller[] = [
  { id: 1, slug: 'technopoint', title: 'TechnoPoint', rating: 4.9, reviewsCount: 1840, logo: '/mock/sellers/technopoint.svg' },
  { id: 2, slug: 'moda-line', title: 'Moda Line', rating: 4.7, reviewsCount: 960, logo: '/mock/sellers/moda-line.svg' },
  { id: 3, slug: 'style-avenue', title: 'Style Avenue', rating: 4.8, reviewsCount: 410, logo: '/mock/sellers/style-avenue.svg' },
  { id: 4, slug: 'beauty-box', title: 'Beauty Box', rating: 4.8, reviewsCount: 1230, logo: '/mock/sellers/beauty-box.svg' },
  { id: 5, slug: 'uy-jihozlari', title: 'Uy Jihozlari', rating: 4.6, reviewsCount: 720, logo: '/mock/sellers/uy-jihozlari.svg' },
  { id: 6, slug: 'kids-world', title: 'Kids World', rating: 4.9, reviewsCount: 380, logo: '/mock/sellers/kids-world.svg' },
  { id: 7, slug: 'sport-zone', title: 'Sport Zone', rating: 4.7, reviewsCount: 290, logo: '/mock/sellers/sport-zone.svg' },
  { id: 8, slug: 'auto-plus', title: 'Auto Plus', rating: 4.5, reviewsCount: 140, logo: '/mock/sellers/auto-plus.svg' },
  { id: 9, slug: 'fresh-bozor', title: 'Fresh Bozor', rating: 4.8, reviewsCount: 2100, logo: '/mock/sellers/fresh-bozor.svg' },
]

const SELLER_BY_CATEGORY: Record<string, number> = {
  'elektronika': 1,
  'bytovaya-tehnika': 1,
  'odezhda': 2,
  'obuv': 2,
  'aksessuary': 3,
  'krasota-i-uhod': 4,
  'dom-i-sad': 5,
  'detskie-tovary': 6,
  'sport-i-otdyh': 7,
  'avtotovary': 8,
  'produkty-pitaniya': 9,
}

export function sellerFor(id: Id): Seller {
  const category = itemById.get(numericId(id))?.category ?? ''
  const sellerId = SELLER_BY_CATEGORY[category]
  return sellers.find(seller => seller.id === sellerId) ?? sellers[numericId(id) % sellers.length]!
}

export function productsOfSeller(slug: string): ProductCard[] {
  const seller = sellers.find(item => item.slug === slug)
  return seller ? productCards.filter(card => sellerFor(card.id).id === seller.id) : []
}

/* ------------------------------------------------------------------ */
/* Карточка товара                                                     */
/* ------------------------------------------------------------------ */

function attributesFor(item: RawGoods): Attribute[] {
  const rows: Array<[string, string, boolean?]> = []
  rows.push(['Бренд', item.brand])
  if (!NO_COLOR_GROUP.has(item.category)) rows.push(['Цвет', COLORS[item.color]?.ru ?? item.color])
  if (item.material) rows.push(['Материал', MATERIALS[item.material]?.ru ?? item.material])
  if (item.memory) rows.push(['Встроенная память', item.memory.join(' / ')])
  if (item.sizes) rows.push(['Размеры', item.sizes.join(', ')])
  rows.push(...item.attributes)
  rows.push(['Страна производства', COUNTRIES[item.country]?.ru ?? item.country])

  return rows.map(([title, value, checked], index) => ({
    id: index + 1,
    code: `attr-${index + 1}`,
    title,
    value,
    ...(checked === undefined ? {} : { checked }),
  }))
}

/**
 * Группы выбора на карточке: цвет (одно значение — тот, что на фото),
 * память у электроники и размер у одежды и обуви.
 *
 * Заголовок группы — без значения: BuyBox сам дописывает «: выбранное».
 */
function optionGroupsFor(item: RawGoods): OptionGroup[] {
  const groups: OptionGroup[] = []

  if (!NO_COLOR_GROUP.has(item.category)) {
    groups.push({
      code: 'color',
      title: 'Цвет',
      kind: 'color',
      selected: item.color,
      values: [{ value: item.color, label: COLORS[item.color]?.ru ?? item.color, image: item.thumbnail, available: true }],
    })
  }

  if (item.memory?.length) {
    groups.push({
      code: 'memory',
      title: 'Встроенная память',
      kind: 'chips',
      selected: memoryCode(item.memory[0]!),
      values: item.memory.map(label => ({ value: memoryCode(label), label, available: true })),
    })
  }

  if (item.sizes?.length) {
    // У каждого четвёртого товара один размер разобран — состояние
    // «нет в наличии» должно быть достижимо и проверяемо
    const soldOut = item.id % 4 === 0 ? item.sizes.length - 2 : -1
    groups.push({
      code: 'size',
      title: 'Размер',
      kind: 'chips',
      selected: item.sizes[soldOut === 0 ? 1 : 0]!,
      values: item.sizes.map((size, index) => ({ value: size, label: size, available: index !== soldOut })),
    })
  }

  return groups
}

/** Фасовка для строки корзины у товаров без вариантов: «2 кг», «100 мл» */
function packOf(item: RawGoods): string | null {
  const row = item.attributes.find(([title]) => ['Вес', 'Объём', 'Количество'].includes(title))
  return row ? row[1] : null
}

/**
 * Варианты товара. У каждой комбинации свой SKU, своя цена и остаток.
 * Комбинации строим по группам, где больше одного значения; группы из
 * одного значения (цвет) входят в состав каждого варианта.
 *
 * sku = id * 10 + 1 + номер варианта — вариантов не больше девяти.
 * TODO: Connect to backend — состав вариантов и остатки приходят с товаром.
 */
function skusFor(item: RawGoods, card: ProductCard, groups: OptionGroup[]): Sku[] {
  const variable = groups.filter(group => group.values.length > 1)
  const fixed = groups.filter(group => group.values.length === 1)

  const fixedOptions = fixed.map(group => ({ code: group.code, title: group.title, value: group.values[0]!.label }))
  const pack = packOf(item)
  if (!variable.length && pack) fixedOptions.push({ code: 'pack', title: 'Фасовка', value: pack })

  let combos: Array<Record<string, string>> = [{}]
  for (const group of variable)
    combos = combos.flatMap(combo => group.values.map(value => ({ ...combo, [group.code]: value.value })))

  // Шаг цены за следующий объём памяти — примерно 15% от базовой цены
  const memoryStep = Math.round((item.price * 0.15) / 10_000) * 10_000 * 100

  return combos.slice(0, 9).map((combo, index) => {
    const options = [
      ...fixedOptions,
      ...variable.map(group => ({
        code: group.code,
        title: group.title,
        value: group.values.find(value => value.value === combo[group.code])!.label,
      })),
    ]

    const memoryIndex = item.memory ? Math.max(0, item.memory.findIndex(label => memoryCode(label) === combo.memory)) : 0
    const extra = memoryIndex * memoryStep
    const sizeValue = combo.size
    const sizeGroup = groups.find(group => group.code === 'size')
    const sizeAvailable = !sizeValue || sizeGroup?.values.find(value => value.value === sizeValue)?.available !== false

    return {
      id: numericId(card.id) * 10 + 1 + index,
      options,
      price: { ...card.price, amount: card.price.amount + extra },
      fullPrice: card.fullPrice ? { ...card.fullPrice, amount: card.fullPrice.amount + extra } : null,
      available: !card.available || !sizeAvailable ? 0 : Math.max(1, Math.min(item.stock, 25) - index),
    }
  })
}

/** Способы оплаты на карточке: B2B, только баланс компании и корпоративная карта */
function paymentOptionsFor(priceSum: number) {
  const label = `${priceSum.toLocaleString('ru-RU').replace(/[\s,]/g, ' ')} сум`
  return [
    { id: 'balance', logo: '', termLabel: 'С баланса компании', amountLabel: label, periodLabel: '' },
    { id: 'corporate-card', logo: '', termLabel: 'Корпоративной картой', amountLabel: label, periodLabel: '' },
  ]
}

/** Распределение оценок по звёздам — сходится со средним рейтингом и числом отзывов */
function ratingBreakdownFor(rating: number, count: number): Record<1 | 2 | 3 | 4 | 5, number> {
  if (!count) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  const fiveShare = Math.max(0.4, Math.min(0.92, (rating - 3.9) / 1.1))
  const five = Math.round(count * fiveShare)
  const four = Math.round((count - five) * 0.65)
  const three = Math.round((count - five - four) * 0.6)
  const two = Math.round((count - five - four - three) * 0.5)
  return { 5: five, 4: four, 3: three, 2: two, 1: Math.max(0, count - five - four - three - two) }
}

export function findProduct(slug: string): Product | null {
  const card = productCards.find(p => p.slug === slug)
  if (!card) return null

  const item = itemById.get(numericId(card.id))!
  const root = categories.find(category => category.slug === item.category)
  const child = root?.children?.find(category => category.slug === item.subcategory)
  const groups = optionGroupsFor(item)
  const reviews = reviewsFor(card.id)
  const warranty = item.attributes.find(([title]) => title === 'Гарантия')?.[1]

  return {
    ...card,
    description: item.description,
    images: item.images.map((url, index) => ({ id: `${card.id}-${index}`, url, alt: card.title })),
    attributes: attributesFor(item),
    skus: skusFor(item, card, groups),
    seller: sellerFor(card.id),
    categoryPath: [root, child]
      .filter((category): category is Category => Boolean(category))
      .map(category => ({ id: category.id, slug: category.slug, title: category.title })),
    ratingBreakdown: ratingBreakdownFor(card.rating, card.reviewsCount),
    optionGroups: groups,
    buyersThisWeek: 2 + (numericId(card.id) % 37),
    deliveryNote: `Доставка курьером — ${card.deliveryDate}`,
    hasVideo: false,
    paymentOptions: paymentOptionsFor(item.price),
    warranty: [
      { title: 'Возврат в течение 10 дней', description: 'Если товар не подошёл или пришёл с дефектом, оформите возврат в разделе «Мои заказы»', icon: 'return' },
      { title: warranty ? `Гарантия ${warranty.toLowerCase()}` : 'Гарантия продавца', description: 'Обратитесь к продавцу, если с товаром возникнет проблема', icon: 'seal-check' },
    ],
    delivery: [
      { title: 'Оплата при оформлении', description: 'С баланса компании или корпоративной картой', icon: 'card' },
      { title: `Доставка ${card.deliveryDate}`, description: 'Курьером Express 24, Maxsus Courier или Yandex Delivery', note: 'Бесплатно в пункт выдачи spotshop', icon: 'truck' },
    ],
    reviewPhotos: reviews.flatMap(review => review.photos ?? []),
    reviewsPreview: reviews,
  }
}

/* ------------------------------------------------------------------ */
/* Отзывы                                                              */
/* ------------------------------------------------------------------ */

/** Отзывы по разделу: у смартфона хвалят экран, у платья — посадку */
const REVIEW_TEXTS: Record<string, string[]> = {
  'elektronika': [
    'Достоинства: оригинал, всё работает быстро, экран яркий. Недостатки: зарядного блока в коробке нет. Комментарий: пришёл запечатанным, IMEI проверил — всё чисто.',
    'Достоинства: батарея держит весь день. Недостатки: корпус маркий, сразу купил чехол.',
  ],
  'bytovaya-tehnika': [
    'Достоинства: мощный, работает тихо, легко моется. Недостатки: шнур коротковат. Комментарий: пользуемся каждый день, довольны.',
    'Достоинства: всё как в описании, инструкция на русском. Недостатки: нет.',
  ],
  'odezhda': [
    'Достоинства: размер соответствует таблице, ткань приятная. Недостатки: нитки торчали, обрезала. Комментарий: после стирки не село.',
    'Достоинства: сидит отлично, цвет как на фото. Недостатки: немного мнётся.',
  ],
  'obuv': [
    'Достоинства: размер в размер, удобная колодка, не натирает. Недостатки: шнурки коротковаты. Комментарий: хожу каждый день.',
    'Достоинства: качество отличное, пришли в фирменной коробке. Недостатки: нет.',
  ],
  'aksessuary': [
    'Достоинства: выглядит дороже своей цены, аккуратная работа. Недостатки: нет. Комментарий: брала в подарок, упаковка красивая.',
    'Достоинства: как на фото, качественная фурнитура. Недостатки: доставка заняла на день больше.',
  ],
  'krasota-i-uhod': [
    'Достоинства: оригинал, проверила по коду партии. Аромат стойкий. Недостатки: нет. Комментарий: продавец положил пробник в подарок.',
    'Достоинства: хорошо ложится, не сушит. Недостатки: хотелось бы объём побольше.',
  ],
  'dom-i-sad': [
    'Достоинства: прочный, хорошо сделан, без запаха. Недостатки: нет. Комментарий: в интерьере смотрится ещё лучше, чем на фото.',
    'Достоинства: пришло хорошо упакованным, ничего не поцарапано. Недостатки: собирать пришлось самим.',
  ],
  'detskie-tovary': [
    'Достоинства: ребёнок в восторге, материал приятный. Недостатки: нет. Комментарий: размер взяли на рост — подошло идеально.',
    'Достоинства: яркий, безопасный. Недостатки: цвет чуть бледнее, чем на фото.',
  ],
  'sport-i-otdyh': [
    'Достоинства: качественный, хорошо держит форму. Недостатки: нет. Комментарий: играем всей семьёй по выходным.',
    'Достоинства: соответствует описанию, удобный. Недостатки: пахнул резиной первые дни.',
  ],
  'avtotovary': [
    'Достоинства: менеджер помог с документами и регистрацией. Недостатки: ждали поставку неделю. Комментарий: техника в идеальном состоянии.',
    'Достоинства: всё честно, пробег и комплектация как в описании. Недостатки: нет.',
  ],
  'produkty-pitaniya': [
    'Достоинства: свежие, привезли утром в день заказа. Недостатки: нет. Комментарий: заказываю каждую неделю.',
    'Достоинства: вкусно, хорошая упаковка. Недостатки: курьер опоздал на полчаса.',
  ],
}

const GENERIC_REVIEWS = [
  'Достоинства: быстрая доставка, всё целое. Недостатки: нет. Комментарий: заказ подтвердили быстро — удобно.',
  'Достоинства: цена ниже, чем в магазинах. Недостатки: нет. Комментарий: продавец на связи, на вопросы ответил сразу.',
  'Достоинства: соответствует описанию. Недостатки: курьер позвонил за 10 минут до приезда. Комментарий: в целом доволен покупкой.',
]

const AUTHORS = ['Nizom', 'Дилшод', 'Malika', 'Отабек', 'Shahzod', 'Гульнора', 'Jasur', 'Камила', 'Sardor', 'Нилуфар', 'Bekzod', 'Зарина']

function reviewDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Отзывы товара. Снимки лежат у самих отзывов: по клику на фотографию
 * открывается именно тот отзыв, к которому она относится. Фото покупателей —
 * снимки самого товара.
 */
function reviewsFor(id: Id): ReviewPreview[] {
  if (!hasReviews(id)) return []

  const n = numericId(id)
  const item = itemById.get(n)
  if (!item) return []

  const specific = REVIEW_TEXTS[item.category] ?? []
  const texts = [specific[0], GENERIC_REVIEWS[n % 3], specific[1], GENERIC_REVIEWS[(n + 1) % 3]].filter(Boolean) as string[]
  const photo = (k: number) => item.images[k % item.images.length]!
  const ratings = [5, 5, 4, item.rating >= 4.6 ? 5 : 3]

  return texts.map((text, index) => ({
    id: index + 1,
    author: AUTHORS[(n + index * 5) % AUTHORS.length]!,
    date: reviewDate(4 + index * 9 + (n % 7)),
    rating: ratings[index] ?? 5,
    text,
    // Фото у первого и третьего отзыва — лента над отзывами не пустая, но и не вся из фото
    ...(index === 0 ? { photos: [photo(0), photo(1)].filter((url, i, all) => all.indexOf(url) === i) } : {}),
    ...(index === 2 ? { photos: [photo(2)] } : {}),
    ...(index === 1 ? { reply: { text: 'Спасибо за отзыв! Рады, что заказ вам подошёл.', date: reviewDate(2 + (n % 7)) } } : {}),
  }))
}
