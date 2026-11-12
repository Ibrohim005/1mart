/**
 * Справочники фасетов: машинный код → подпись на каждом языке витрины.
 *
 * В товаре и в адресе живёт только код (`color=black`), подпись выбирается
 * по Accept-Language. Решения по коду, а не по переведённой строке — иначе
 * фильтр «Чёрный» не находил бы ничего на `/uz`.
 *
 * TODO: Connect to backend endpoint GET /catalog/filters — справочники придут оттуда.
 */

export type MockLocale = 'ru' | 'uz' | 'uz-cyrl' | 'en'

type Labels = Record<MockLocale, string>

/** Язык мока по заголовку Accept-Language; каракалпакский показываем по-узбекски */
export function mockLocale(header: string | undefined | null): MockLocale {
  const value = String(header ?? '').toLowerCase()
  if (value.startsWith('uz-cyrl')) return 'uz-cyrl'
  if (value.startsWith('uz') || value.startsWith('kaa')) return 'uz'
  if (value.startsWith('en')) return 'en'
  return 'ru'
}

export const COLORS: Record<string, Labels & { swatch: string }> = {
  black: { ru: 'Чёрный', uz: 'Qora', 'uz-cyrl': 'Қора', en: 'Black', swatch: '#1F2026' },
  white: { ru: 'Белый', uz: 'Oq', 'uz-cyrl': 'Оқ', en: 'White', swatch: '#F1F2F4' },
  grey: { ru: 'Серый', uz: 'Kulrang', 'uz-cyrl': 'Кулранг', en: 'Grey', swatch: '#9AA3AE' },
  silver: { ru: 'Серебристый', uz: 'Kumushrang', 'uz-cyrl': 'Кумушранг', en: 'Silver', swatch: '#C9CED6' },
  gold: { ru: 'Золотистый', uz: 'Oltinrang', 'uz-cyrl': 'Олтинранг', en: 'Gold', swatch: '#D4AF37' },
  red: { ru: 'Красный', uz: 'Qizil', 'uz-cyrl': 'Қизил', en: 'Red', swatch: '#E5322D' },
  pink: { ru: 'Розовый', uz: 'Pushti', 'uz-cyrl': 'Пушти', en: 'Pink', swatch: '#F2A7C3' },
  blue: { ru: 'Синий', uz: 'Ko\'k', 'uz-cyrl': 'Кўк', en: 'Blue', swatch: '#2F6FDB' },
  green: { ru: 'Зелёный', uz: 'Yashil', 'uz-cyrl': 'Яшил', en: 'Green', swatch: '#2E9E5B' },
  brown: { ru: 'Коричневый', uz: 'Jigarrang', 'uz-cyrl': 'Жигарранг', en: 'Brown', swatch: '#8B5A2B' },
  beige: { ru: 'Бежевый', uz: 'Och jigarrang', 'uz-cyrl': 'Оч жигарранг', en: 'Beige', swatch: '#E3D3B5' },
  yellow: { ru: 'Жёлтый', uz: 'Sariq', 'uz-cyrl': 'Сариқ', en: 'Yellow', swatch: '#F4C430' },
  purple: { ru: 'Фиолетовый', uz: 'Binafsha', 'uz-cyrl': 'Бинафша', en: 'Purple', swatch: '#7E57C2' },
  multi: { ru: 'Разноцветный', uz: 'Rang-barang', 'uz-cyrl': 'Ранг-баранг', en: 'Multicolour', swatch: 'conic-gradient(#E5322D, #F4C430, #2E9E5B, #2F6FDB, #E5322D)' },
}

export const COUNTRIES: Record<string, Labels> = {
  uzbekistan: { ru: 'Узбекистан', uz: 'O\'zbekiston', 'uz-cyrl': 'Ўзбекистон', en: 'Uzbekistan' },
  usa: { ru: 'США', uz: 'AQSH', 'uz-cyrl': 'АҚШ', en: 'USA' },
  china: { ru: 'Китай', uz: 'Xitoy', 'uz-cyrl': 'Хитой', en: 'China' },
  korea: { ru: 'Южная Корея', uz: 'Janubiy Koreya', 'uz-cyrl': 'Жанубий Корея', en: 'South Korea' },
  japan: { ru: 'Япония', uz: 'Yaponiya', 'uz-cyrl': 'Япония', en: 'Japan' },
  taiwan: { ru: 'Тайвань', uz: 'Tayvan', 'uz-cyrl': 'Тайван', en: 'Taiwan' },
  germany: { ru: 'Германия', uz: 'Germaniya', 'uz-cyrl': 'Германия', en: 'Germany' },
  france: { ru: 'Франция', uz: 'Fransiya', 'uz-cyrl': 'Франция', en: 'France' },
  italy: { ru: 'Италия', uz: 'Italiya', 'uz-cyrl': 'Италия', en: 'Italy' },
  switzerland: { ru: 'Швейцария', uz: 'Shveytsariya', 'uz-cyrl': 'Швейцария', en: 'Switzerland' },
  turkey: { ru: 'Турция', uz: 'Turkiya', 'uz-cyrl': 'Туркия', en: 'Turkey' },
  russia: { ru: 'Россия', uz: 'Rossiya', 'uz-cyrl': 'Россия', en: 'Russia' },
  kazakhstan: { ru: 'Казахстан', uz: 'Qozog\'iston', 'uz-cyrl': 'Қозоғистон', en: 'Kazakhstan' },
  poland: { ru: 'Польша', uz: 'Polsha', 'uz-cyrl': 'Польша', en: 'Poland' },
  canada: { ru: 'Канада', uz: 'Kanada', 'uz-cyrl': 'Канада', en: 'Canada' },
  india: { ru: 'Индия', uz: 'Hindiston', 'uz-cyrl': 'Ҳиндистон', en: 'India' },
}

export const MATERIALS: Record<string, Labels> = {
  leather: { ru: 'Кожа', uz: 'Charm', 'uz-cyrl': 'Чарм', en: 'Leather' },
  textile: { ru: 'Текстиль', uz: 'Tekstil', 'uz-cyrl': 'Текстиль', en: 'Textile' },
  cotton: { ru: 'Хлопок', uz: 'Paxta', 'uz-cyrl': 'Пахта', en: 'Cotton' },
  plastic: { ru: 'Пластик', uz: 'Plastik', 'uz-cyrl': 'Пластик', en: 'Plastic' },
  metal: { ru: 'Металл', uz: 'Metall', 'uz-cyrl': 'Металл', en: 'Metal' },
  steel: { ru: 'Нержавеющая сталь', uz: 'Zanglamaydigan po\'lat', 'uz-cyrl': 'Занглмайдиган пўлат', en: 'Stainless steel' },
  wood: { ru: 'Дерево', uz: 'Yog\'och', 'uz-cyrl': 'Ёғоч', en: 'Wood' },
  glass: { ru: 'Стекло', uz: 'Shisha', 'uz-cyrl': 'Шиша', en: 'Glass' },
  ceramic: { ru: 'Керамика', uz: 'Keramika', 'uz-cyrl': 'Керамика', en: 'Ceramic' },
  silicone: { ru: 'Силикон', uz: 'Silikon', 'uz-cyrl': 'Силикон', en: 'Silicone' },
  aluminium: { ru: 'Алюминий', uz: 'Alyuminiy', 'uz-cyrl': 'Алюминий', en: 'Aluminium' },
}

/** Заголовки фильтров сайдбара */
export const FILTER_TITLES: Record<string, Labels> = {
  price: { ru: 'Цена, сум', uz: 'Narxi, so\'m', 'uz-cyrl': 'Нархи, сўм', en: 'Price, UZS' },
  brand: { ru: 'Бренд', uz: 'Brend', 'uz-cyrl': 'Бренд', en: 'Brand' },
  color: { ru: 'Цвет', uz: 'Rang', 'uz-cyrl': 'Ранг', en: 'Colour' },
  memory: { ru: 'Встроенная память', uz: 'Ichki xotira', 'uz-cyrl': 'Ички хотира', en: 'Storage' },
  size: { ru: 'Размер', uz: 'O\'lcham', 'uz-cyrl': 'Ўлчам', en: 'Size' },
  material: { ru: 'Материал', uz: 'Material', 'uz-cyrl': 'Материал', en: 'Material' },
  country: { ru: 'Страна производства', uz: 'Ishlab chiqarilgan mamlakat', 'uz-cyrl': 'Ишлаб чиқарилган мамлакат', en: 'Country of origin' },
  all: { ru: 'Все', uz: 'Barchasi', 'uz-cyrl': 'Барчаси', en: 'All' },
}

/** Память храним кодом `128gb` / `1tb`, подпись строим из него */
export function memoryCode(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '').replace('гб', 'gb').replace('тб', 'tb')
}

export function memoryLabel(code: string, locale: MockLocale): string {
  const match = /^(\d+)(gb|tb)$/.exec(code)
  if (!match) return code
  const unit = match[2] === 'tb'
    ? (locale === 'ru' || locale === 'uz-cyrl' ? 'ТБ' : 'TB')
    : (locale === 'ru' || locale === 'uz-cyrl' ? 'ГБ' : 'GB')
  return `${match[1]} ${unit}`
}

/** Порядок размеров: буквенная сетка по росту, числовая — по возрастанию */
const LETTER_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
export function compareSizes(a: string, b: string): number {
  const ia = LETTER_SIZES.indexOf(a)
  const ib = LETTER_SIZES.indexOf(b)
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  return Number(a) - Number(b)
}

export function brandCode(brand: string): string {
  return brand.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/**
 * Какие фасеты уместны в каком корневом разделе. Фильтры собираются из
 * самой выдачи, и без этого списка в «Продуктах питания» появлялись цвет
 * и материал упаковки. Ключ — слаг корневой категории; без категории (поиск
 * по всему каталогу) показываем всё, что нашлось.
 *
 * TODO: Connect to backend endpoint GET /catalog/filters — набор придёт оттуда по категории.
 */
export type FacetCode = 'brand' | 'color' | 'memory' | 'size' | 'material' | 'country'

export const CATEGORY_FACETS: Record<string, FacetCode[]> = {
  'ofis-i-kancelyariya': ['brand', 'color', 'material', 'country'],
  'elektronika': ['brand', 'color', 'memory', 'country'],
  'bytovaya-tehnika': ['brand', 'color', 'country'],
  'odezhda': ['brand', 'color', 'size', 'material', 'country'],
  'obuv': ['brand', 'color', 'size', 'material', 'country'],
  'aksessuary': ['brand', 'color', 'material', 'country'],
  'krasota-i-uhod': ['brand', 'country'],
  'dom-i-sad': ['brand', 'color', 'material', 'country'],
  'detskie-tovary': ['brand', 'color', 'size', 'material', 'country'],
  'sport-i-otdyh': ['brand', 'color', 'material', 'country'],
  'avtotovary': ['brand', 'color', 'country'],
  'produkty-pitaniya': ['brand', 'country'],
}
