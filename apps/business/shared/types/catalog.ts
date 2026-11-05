/**
 * Доменные типы каталога. Лежат в shared/ — доступны и в приложении, и в
 * server-роутах моков, поэтому мок и фронт физически не могут разойтись.
 * Это же — контракт для бэкенд-разработчика.
 */

/**
 * Идентификатор сущности.
 *
 * Мок раздаёт автоинкрементные числа, zoo-backend — UUID. Пока витрина
 * переводится на настоящий бэкенд по одному роуту, в приложении встречаются
 * оба, поэтому тип честно допускает оба. Когда слой моков уйдёт, здесь
 * останется string.
 */
export type Id = string | number

export interface Category {
  id: Id
  /** Слаг на текущем языке — им рисуются ссылки. */
  slug: string
  /**
   * Слаг на всех языках, для РАЗБОРА пути. Переключение языка сохраняет путь
   * (`/uz/category/smartfonlar` → `/ru/category/smartfonlar`), поэтому страница должна
   * узнавать категорию и по чужому слагу, иначе отдаёт 404 на существующую.
   */
  slugs?: string[]
  title: string
  /** null у корневых категорий */
  parentId: Id | null
  image?: string
  productsCount?: number
  /** Вкладка в диалоге выбора категории */
  group?: 'animals' | 'services' | 'goods'
  children?: Category[]
}

/** Характеристика товара: «Бренд», «Цвет», «Встроенная память» */
export interface Attribute {
  id: number
  code: string
  title: string
  value: string
  /**
   * Характеристика-подтверждение («Съёмный чехол», «Нормы IATA»), которую
   * интерфейс отмечает зелёной галочкой. Строка `value` для этого не годится: она уже
   * переведена под локаль («Да» / «Ha»), и сравнение с русским словом на
   * `/uz` не срабатывает.
   *
   * `false` — это содержательное «нет», а не отсутствие данных:
   * строка показывается, но галочки у неё быть не должно. У характеристик,
   * которые вообще не про «да/нет» (вес, бренд), поля нет.
   */
  checked?: boolean
}

/** Конкретный вариант товара, который кладут в корзину (размер/цвет/память) */
export interface Sku {
  id: Id
  /**
   * Комбинация опций, определяющая этот SKU.
   *
   * `value` — хранимое машинное значение (по нему сопоставляются SKU, его же
   * отдаёт и принимает бэкенд); `valueLabel` — то, что показываем. Второе
   * нужно потому, что значения хранятся кодом: на русской карточке чип
   * читался бы «black» под заголовком «Цвет».
   */
  options: Array<{ code: string, title: string, value: string, valueLabel?: string }>
  price: Money
  fullPrice: Money | null
  /** Остаток на складе; 0 = нет в наличии */
  available: number
  barcode?: string
}

export interface Money {
  /** В минимальных единицах (тийин), чтобы не терять точность */
  amount: number
  currency: 'UZS'
}

export interface Seller {
  id: Id
  slug: string
  title: string
  rating: number
  reviewsCount: number
  logo?: string
}

export interface ProductImage {
  id: string
  url: string
  alt?: string
}

/** Поля, по которым сужается выдача. Бэкенд отдаёт их вместе с карточкой. */
export interface ProductFacets {
  categorySlug: string
  /** Подкатегория: по ней сужает выдачу диалог выбора категории */
  subcategorySlug: string
  /** Машинный код бренда: `apple`, `samsung` */
  brand: string
  /** Машинный код страны производства: `china`, `uzbekistan` */
  country: string
  /** Машинный код цвета: `black`, `white` */
  color: string
  /** Машинный код материала: `leather`, `cotton` — где он осмыслен */
  material?: string
  /** Доступные объёмы памяти (`128gb`, `1tb`) — у смартфонов, планшетов, ноутбуков */
  memory?: string[]
  /** Доступные размеры (`M`, `42`) — у одежды и обуви */
  size?: string[]
}

/** Карточка в гриде — намеренно лёгкая, без описания и характеристик */
export interface ProductCard {
  id: Id
  slug: string
  title: string
  image: string
  price: Money
  fullPrice: Money | null
  discountPercent: number | null
  rating: number
  reviewsCount: number
  ordersCount: number
  badges: Badge[]
  /**
   * Платёж по рассрочке в месяц. 1mart Market рассрочку не предлагает —
   * мок поле не отдаёт; оставлено необязательным для совместимости с адаптером.
   */
  installmentPerMonth?: Money | null
  /** Дата доставки, как она подписана на кнопке карточки: «15 августа» */
  deliveryDate: string
  available: boolean
  /**
   * SKU, который кнопка «в корзину» кладёт прямо из грида, минуя страницу
   * товара, — самый дешёвый активный вариант, тот же, чью цену показывает
   * `price`. Необязательное: мок его не отдаёт и выводит номер из id.
   */
  defaultSkuId?: Id
  /** Дополнительные фото для перелистывания в карточке списка */
  gallery?: string[]
  /** Значения фильтров; в списке не показываются */
  facets?: ProductFacets
}

/** Виды бейджей карточки товара */
export type BadgeKind = 'cheaper' | 'new' | 'freeShipping'

export interface Badge {
  kind: BadgeKind
  label: string
}

/** Полная карточка товара (PDP) */
export interface Product extends ProductCard {
  description: string
  images: ProductImage[]
  attributes: Attribute[]
  skus: Sku[]
  seller: Seller
  categoryPath: Array<Pick<Category, 'id' | 'slug' | 'title'>>
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>
  /** Группы выбора: цвет, память, размер */
  optionGroups: OptionGroup[]
  /** «2 человека купили на этой неделе» */
  buyersThisWeek: number
  /** Подпись о доставке под выбором опций */
  deliveryNote: string
  /** У товара есть видео в галерее */
  hasVideo: boolean
  paymentOptions: PaymentOption[]
  warranty: InfoRow[]
  delivery: InfoRow[]
  /** Фотографии из отзывов покупателей */
  reviewPhotos: string[]
  reviewsPreview: ReviewPreview[]
}

export interface Review {
  id: Id
  productId: Id
  author: string
  rating: number
  text: string
  photos: string[]
  createdAt: string
  likes: number
  reply?: { author: string, text: string, createdAt: string }
}

/* --- Поиск и фильтры --- */

/**
 * Типы фильтров из макета категории:
 * range — «Цена, сум» два поля; buttons — «Память», «Размер» (кнопки-чипы);
 * checkbox — списки брендов/материалов/стран; color — список с цветными метками.
 */
export type FilterType = 'checkbox' | 'range' | 'buttons' | 'color'

export interface FilterValue {
  value: string
  title: string
  /** Цветная метка для фильтра по цвету */
  swatch?: string
  count?: number
}

export interface Filter {
  code: string
  title: string
  type: FilterType
  values?: FilterValue[]
  min?: number
  max?: number
  /** «Ещё 60» — сколько значений скрыто */
  moreCount?: number
  /** Показывать ссылку «Сбросить» у заголовка */
  resettable?: boolean
}

export type SortOption = 'popular' | 'priceAsc' | 'priceDesc' | 'rating' | 'new'

export interface SearchQuery {
  q?: string
  categorySlug?: string
  filters?: Record<string, string[] | [number, number] | boolean>
  sort?: SortOption
  page?: number
  perPage?: number
}

export interface Paged<T> {
  items: T[]
  total: number
  page: number
  perPage: number
}

export interface SearchResult extends Paged<ProductCard> {
  filters: Filter[]
  categories: Category[]
  /** Запрос исправлен автоматически (забытая раскладка) — по чему собрана выдача */
  correctedTo?: string | null
  /** «Возможно, вы искали …» — приходит, только когда выдача пуста */
  suggestion?: string | null
}

/* --- Баннеры главной --- */

export type BannerTone = 'orange' | 'violet'

export interface Banner {
  id: number
  /** Заголовок на баннере на языке запроса */
  title: string
  oldPrice: Money
  price: Money
  discountLabel: string
  /** Подпись на плашке срока: «до 15 декабря» */
  until: string
  tone: BannerTone
  /** Ссылка, куда ведёт баннер */
  link: string
  /** Готовая картинка баннера для большой карусели, 1240×345 */
  image: string | null
  /** Она же для ряда промо-баннеров, 529×214 */
  imageSmall: string | null
  /** Описание для поисковиков и скринридеров: текст в картинку впечатан */
  description: string
}

/* --- Выбор опций на карточке товара --- */

export type OptionKind = 'color' | 'chips'

export interface OptionValue {
  value: string
  label: string
  /** Превью для выбора цвета */
  image?: string
  /** Нет в наличии — вариант показывается приглушённым */
  available: boolean
}

export interface OptionGroup {
  code: string
  /** Подпись над выбором: «Цвет», «Размер» — значение дописывает интерфейс */
  title: string
  kind: OptionKind
  selected: string
  values: OptionValue[]
}

/* --- Блоки правой колонки карточки товара --- */

export interface PaymentOption {
  id: string
  /** Логотип партнёра */
  logo: string
  /** «Картой UzCard» */
  termLabel: string
  /** «22 800 UZS» */
  amountLabel: string
  /** Пояснение после суммы, может быть пустым */
  periodLabel: string
}

export interface InfoRow {
  title: string
  description: string
  /** Имя иконки из assets/icons; по умолчанию — truck / seal-check */
  icon?: string
  /** Дополнительная строка, как «Нет доставки в пункт выдачи» */
  note?: string
}

export interface ReviewPreview {
  id: number
  author: string
  date: string
  rating: number
  text: string
  /** Снимки покупателя: из них собирается лента фотографий над отзывами */
  photos?: string[]
}
