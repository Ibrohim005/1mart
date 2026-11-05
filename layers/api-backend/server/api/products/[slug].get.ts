import type { Attribute, OptionGroup, Product, ReviewPreview, Sku } from '#shared/types/catalog'
import type { UpstreamProduct } from '../../utils/product'
import { deliveryDateLabel, productCard, skus } from '../../utils/product'

/**
 * Собрать группы вариантов (масса/пол/масть) из готовых SKU.
 *
 * Раньше здесь стоял пустой массив: бэкенд отдавал `variants[].attributes`
 * как `{}`, и покупатель не мог выбрать вариант на карточке. Теперь атрибуты
 * приходят внутри каждого SKU (`options: [{code, title, value}]`), а значит
 * группы выводятся из них — код объединяет одноимённые опции всех SKU в один
 * выбор, как на Uzum: «Масса: 5кг / 15кг», цена меняется под выбранный.
 *
 * `available` у значения истинно, если ХОТЯ БЫ один SKU с ним есть в наличии —
 * иначе ходовой вариант гас из-за одного распроданного соседа.
 *
 * `title` пока равен коду (`weight`): человеческие подписи атрибутов бэкенд
 * отдельным справочником ещё не отдаёт (см. API-GAPS.md §2). Локализованная
 * подпись подставится здесь же, когда появится источник.
 */
const COLOR_CODES = new Set(['color', 'rang', 'tus', 'cvet', 'mast'])

function optionGroupsFromSkus(skuList: Sku[]): OptionGroup[] {
  // Значение остаётся ключом (по нему BuyBox сопоставляет SKU), подпись едет
  // рядом: значения хранятся по-узбекски, и без этого на русской карточке
  // чипы читались «Qora»/«Oq» под переведённым заголовком.
  const groups = new Map<
    string,
    { title: string, values: Map<string, { available: boolean, label: string }> }
  >()
  for (const sku of skuList) {
    for (const opt of sku.options) {
      let group = groups.get(opt.code)
      if (!group) {
        group = { title: opt.title || opt.code, values: new Map() }
        groups.set(opt.code, group)
      }
      const seen = group.values.get(opt.value)
      group.values.set(opt.value, {
        available: (seen?.available ?? false) || sku.available > 0,
        label: seen?.label || opt.valueLabel || opt.value,
      })
    }
  }

  return Array.from(groups.entries()).map(([code, group]) => {
    const values = Array.from(group.values.entries()).map(([value, meta]) => ({
      value,
      label: meta.label,
      available: meta.available,
    }))
    const selected = (values.find(value => value.available) ?? values[0])?.value ?? ''
    return {
      code,
      title: group.title,
      kind: COLOR_CODES.has(code.toLowerCase()) ? 'color' : 'chips',
      selected,
      values,
    }
  })
}

interface UpstreamDetail extends UpstreamProduct {
  description?: string | null
  breed?: string | null
  species?: string | null
  age?: string | null
  birth_date?: string | null
  weight_kg?: string | number | null
  gender?: string | null
  gender_display?: string | null
  category_animal?: string | null
  category_product?: string | null
  is_vaccinated?: boolean | null
  is_sterilized?: boolean | null
  has_document?: boolean | null
  /**
   * Ключи условий, которые осмысленны для КАТЕГОРИИ этого товара
   * (CategoryDealCondition). Необязательное: старый бэкенд его не отдаёт, и
   * тогда ветеринарные пометки показываются всем животным, как раньше.
   */
  applicable_conditions?: string[] | null
  /**
   * Только ПОДТВЕРЖДЁННЫЕ модератором бумаги и только их вид — ни файла, ни
   * вердикта, ни причины отказа. Сам скан это ветпаспорт с личными данными
   * продавца, а отклонённая бумага — решение, адресованное ему, а не
   * покупателю. Покупателю нужен один ответ: проверял ли кто-то заявление
   * «привит».
   */
  verified_documents?: Array<{ kind: string, kind_display: string }>
  brand?: string | null
  country_of_origin?: string | null
  composition?: string | null
  for_whom?: string | null
  seller_info?: { id: string, title: string, slug?: string, rating?: number, reviews_count?: number, logo?: string | null } | null
}

interface UpstreamReview {
  id: string
  rating: number | null
  comment: string | null
  pros: string | null
  cons: string | null
  images: Array<{ id: string, image: string }>
  buyer_name: string | null
  created_at: string
}

/**
 * Отзывы приезжают вместе с карточкой, а не отдельным роутом.
 *
 * Отдельного запроса за отзывами фронт не делает: страница товара берёт их
 * прямо из ответа (`product.reviewsPreview.length` — без опциональной цепочки,
 * то есть пустой массив обязателен, иначе страница падает на рендере).
 * Поэтому здесь второй вызов в бэкенд, а не новый роут
 * /api/products/<slug>/reviews — роут, который никто не вызывает, отзывов на
 * странице не покажет.
 *
 * Сколько тянем: у бэкенда список отзывов пагинирован (LimitOffset, по 10 по
 * умолчанию). Двадцать — это и есть весь блок отзывов на странице: модалка
 * «все отзывы» показывает ровно то, что лежит в reviewsPreview, догрузки у
 * неё нет. Полное число отзывов при этом честное — оно приходит отдельным
 * полем reviews_count самого товара.
 */
const REVIEWS_LIMIT = 20

/**
 * Текст отзыва у бэкенда разложен на три поля (comment / pros / cons), а у
 * фронта под отзыв одна строка. Склеиваем: в моке в `text` лежало ровно это —
 * «Достоинства: … Недостатки: … Комментарий: …», — то есть контракт такую
 * склейку и подразумевает, а выбросить pros/cons значило бы потерять половину
 * написанного покупателем. Подписи по-узбекски, как у характеристик выше;
 * сам комментарий идёт без подписи — в большинстве отзывов на бою pros и cons
 * пустые, и одинокое «Izoh:» перед текстом выглядело бы как мусор.
 *
 * `id` фронт объявил как number, а у бэкенда это UUID. Тип общий с моком и
 * менять его не в этой задаче; поле используется только ключом списка,
 * поэтому берём порядковый номер. Обрубок UUID до числа выглядел бы как
 * настоящий идентификатор отзыва, которым он не является.
 */
function reviewPreview(review: UpstreamReview, index: number): ReviewPreview {
  const text = [
    review.pros ? `Afzalliklari: ${review.pros}` : '',
    review.cons ? `Kamchiliklari: ${review.cons}` : '',
    review.comment ?? '',
  ].filter(Boolean).join(' ')

  const photos = (review.images ?? []).map(image => image.image)
  const created = new Date(review.created_at)

  return {
    id: index + 1,
    // full_name у покупателя может быть пустым — тогда лучше пусто, чем
    // подставленное «Покупатель»: компонент просто не нарисует имя.
    author: review.buyer_name ?? '',
    date: Number.isNaN(created.getTime()) ? '' : formatDate(created),
    rating: review.rating ?? 0,
    text,
    ...(photos.length ? { photos } : {}),
  }
}

/**
 * Разбивку по звёздам бэкенд не считает: агрегата нет ни в карточке товара, ни
 * отдельным эндпоинтом (тот, что есть в /market/profile/<id>/rating/, собран по
 * отзывам о ПОЛЬЗОВАТЕЛЕ на доске объявлений и к товарам магазина отношения
 * не имеет).
 *
 * Но одну страницу отзывов мы и так уже загрузили, и если она покрывает весь
 * список (count не больше лимита) — разбивка по ней точная, а не прикидочная.
 * Когда отзывов больше, чем мы забрали, возвращаем нули: гистограмма по
 * первым двадцати из ста выглядит как настоящая, но ей нельзя верить.
 */
function ratingBreakdown(reviews: UpstreamReview[], count: number): Record<1 | 2 | 3 | 4 | 5, number> {
  const buckets: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  if (reviews.length < count) return buckets

  for (const review of reviews) {
    const star = Math.round(review.rating ?? 0)
    if (star >= 1 && star <= 5) buckets[star as 1 | 2 | 3 | 4 | 5] += 1
  }
  return buckets
}

const YES_NO: Record<string, [string, string]> = {
  ru: ['Да', 'Нет'],
  uz: ['Ha', 'Yo\'q'],
  en: ['Yes', 'No'],
}

const LABELS: Record<string, Record<string, string>> = {
  ru: {
    species: 'Вид', breed: 'Порода', age: 'Возраст', birth_date: 'Дата рождения',
    weight_kg: 'Вес, кг', gender: 'Пол', is_vaccinated: 'Привит',
    is_sterilized: 'Стерилизован', has_document: 'Документы',
    brand: 'Бренд', country_of_origin: 'Страна производства',
    composition: 'Состав', for_whom: 'Для кого',
  },
  uz: {
    species: 'Turi', breed: 'Zot', age: 'Yosh', birth_date: 'Tug\'ilgan sana',
    weight_kg: 'Vazni, kg', gender: 'Jinsi', is_vaccinated: 'Emlangan',
    is_sterilized: 'Steril qilingan', has_document: 'Hujjatlari',
    brand: 'Brend', country_of_origin: 'Ishlab chiqarilgan',
    composition: 'Tarkibi', for_whom: 'Kim uchun',
  },
  // Без этого английская витрина падала на `?? LABELS.uz` и печатала
  // «Emlangan»/«Hujjatlari» рядом с переведёнными значениями.
  en: {
    species: 'Species', breed: 'Breed', age: 'Age', birth_date: 'Date of birth',
    weight_kg: 'Weight, kg', gender: 'Sex', is_vaccinated: 'Vaccinated',
    is_sterilized: 'Sterilised', has_document: 'Documents',
    brand: 'Brand', country_of_origin: 'Country of origin',
    composition: 'Composition', for_whom: 'For',
  },
}

/**
 * Характеристики — только заполненные: пустая строка в таблице выглядит как
 * потерянные данные, хотя продавец просто не указал поле.
 *
 * Булевы поля — исключение: у «привит» ЕСТЬ содержательное «нет», и скрывать
 * его нельзя. Покупатель, не увидевший строки, прочтёт это как «продавец не
 * заполнил», а не как «не привит», — а это ровно то, ради чего он смотрит.
 *
 * Сам булев ответ уезжает в `checked` рядом со строкой: по нему карточка
 * ставит зелёную галочку. Решать по `value` нельзя — там уже перевод («Да» /
 * «Ha»), и на `/uz` совпадения не будет. Именно `false`, а не отсутствие
 * поля: «не привит» — это строка без галочки, а не строка с галочкой.
 */
function attributes(product: UpstreamDetail, locale: string): Attribute[] {
  const labels = LABELS[locale] ?? LABELS.uz!
  const [yes, no] = YES_NO[locale] ?? YES_NO.uz!

  const text: Array<[string, unknown]> = [
    ['species', product.species],
    ['breed', product.breed],
    ['age', product.age],
    ['birth_date', product.birth_date],
    ['weight_kg', product.weight_kg],
    // Подпись, а не код: бэкенд хранит "male"/"female", и покупатель
    // читал на карточке буквально "male". Перевод лежит на самой модели
    // (GenderChoices), поэтому берём её, а не держим свою копию.
    ['gender', product.gender_display || product.gender],
    ['brand', product.brand],
    ['country_of_origin', product.country_of_origin],
    ['composition', product.composition],
    ['for_whom', product.for_whom],
  ]
  // Ветеринарные пометки. Мало того что они только для животных — они ещё и
  // не для всяких: у рыбы, улитки или черепахи нет ни прививок, ни
  // стерилизации, а колонки на модели есть всегда и по умолчанию false. Так на
  // карточке цихлиды печаталось «Привит: нет, Стерилизован: нет» — это не факт
  // о рыбе, а три неотфильтрованные колонки.
  //
  // Что применимо — решает категория (CategoryDealCondition на бэкенде,
  // приезжает в `applicable_conditions`). Если бэкенд поле не прислал
  // (старая версия), ведём себя как раньше: показываем всем животным.
  const isAnimal = Boolean(product.category_animal)
  const applicable = product.applicable_conditions
  const applies = (key: string) => !applicable || applicable.includes(key)
  const flags: Array<[string, boolean | null | undefined]> = isAnimal
    ? ([
        ['is_vaccinated', product.is_vaccinated, 'vaccinated'],
        ['is_sterilized', product.is_sterilized, 'sterilized'],
        ['has_document', product.has_document, 'document'],
      ] as const)
        .filter(([, , conditionKey]) => applies(conditionKey))
        .map(([code, value]) => [code, value] as [string, boolean | null | undefined])
    : []

  const rows: Array<{ code: string, value: string, title?: string, checked?: boolean }> = [
    ...text
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([code, value]) => ({ code, value: String(value) })),
    ...flags
      .filter((row): row is [string, boolean] => typeof row[1] === 'boolean')
      .map(([code, value]) => ({ code, value: value ? yes : no, checked: value })),
  ]

  // Характеристики из реестра вариантов. Раньше таблица знала только
  // фиксированный список колонок модели, поэтому всё, что продавец заполнял
  // по схеме категории — порода собаки, курдючность барана, класс корма —
  // не доезжало до покупателя вообще.
  const seen = new Set(rows.map(row => labels[row.code] ?? row.code))
  for (const row of constantVariantAttributes(product)) {
    if (seen.has(row.title)) continue
    seen.add(row.title)
    rows.push(row)
  }

  return rows.map((row, index) => ({
    id: index + 1,
    code: row.code,
    title: row.title ?? labels[row.code] ?? row.code,
    value: row.value,
    ...(row.checked === undefined ? {} : { checked: row.checked }),
  }))
}

/**
 * Атрибуты вариантов, одинаковые у ВСЕХ вариантов товара.
 *
 * Различающиеся сюда не попадают сознательно: это ровно то, из чего
 * `optionGroupsFromSkus` строит выбор в BuyBox. Если у товара три окраса,
 * «Окрас: Чёрный» в характеристиках — неправда для двух вариантов из трёх;
 * покупатель выбирает окрас чипом, а здесь остаётся то, что про товар верно
 * целиком (класс корма, курдючность, родословная).
 */
function constantVariantAttributes(
  product: UpstreamDetail,
): Array<{ code: string, title: string, value: string }> {
  const active = (product.variants ?? []).filter(variant => variant.is_active)
  if (!active.length) return []

  // Собираем по ПЕРЕВЕДЁННОЙ подписи: в таблице характеристик печатается
  // именно она, а сырое узбекское значение осталось бы «Qora» на русской
  // странице. Для постоянства это безразлично — перевод однозначен.
  const values = new Map<string, { title: string, values: Set<string> }>()
  for (const variant of active) {
    for (const { key, label, value, value_label } of variant.attributes_display ?? []) {
      const entry = values.get(key) ?? { title: label || key, values: new Set<string>() }
      entry.values.add(value_label || String(value))
      values.set(key, entry)
    }
  }

  return [...values.entries()]
    // Атрибут, заполненный не во всех вариантах, тоже непостоянный:
    // size сравнивается с количеством вариантов, а не только внутри Set.
    .filter(([key, entry]) => entry.values.size === 1
      && active.every(variant => (variant.attributes_display ?? []).some(a => a.key === key)))
    .map(([key, entry]) => ({ code: key, title: entry.title, value: [...entry.values][0]! }))
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const locale = (getHeader(event, 'accept-language') || 'uz').split('-')[0]!

  // Оба запроса параллельно: отзывы адресуются тем же slug'ом, ждать ради них
  // ответа по товару незачем. Падение отзывов гасим здесь же — блок отзывов
  // не должен уносить с собой всю карточку товара, а `.catch` до `Promise.all`
  // заодно снимает вопрос необработанного отказа, если упадёт сам товар.
  const [product, reviewsResponse] = await Promise.all([
    upstream<UpstreamDetail>(event, `/shop/products/${slug}/`),
    upstream<unknown>(event, `/shop/products/${slug}/reviews/`, {
      query: { limit: REVIEWS_LIMIT, offset: 0 },
    }).catch(() => null),
  ])

  // Крошки — только после товара: путь строится от ЕГО категории. Справочник
  // кэшируется в памяти процесса, так что лишнего похода в бэкенд тут нет.
  const crumbs = await categoryPath(event, product.category_animal ?? product.category_product)

  const card = productCard(product, locale)
  const seller = product.seller_info
  const skuList = skus(product)

  const reviews = items<UpstreamReview>(reviewsResponse)
  const previews = reviews.map(reviewPreview)

  return ok<Product>({
    ...card,
    description: product.description ?? '',
    images: (product.images ?? []).map(image => ({ id: image.id, url: image.image })),
    attributes: attributes(product, locale),
    skus: skuList,
    seller: {
      id: seller?.id ?? product.seller,
      slug: seller?.slug ?? seller?.id ?? product.seller,
      title: seller?.title ?? product.seller_title ?? '',
      rating: seller?.rating ?? 0,
      reviewsCount: seller?.reviews_count ?? 0,
      ...(seller?.logo ? { logo: seller.logo } : {}),
    },
    categoryPath: crumbs,
    ratingBreakdown: ratingBreakdown(reviews, total(reviewsResponse, reviews.length)),
    optionGroups: optionGroupsFromSkus(skuList),
    // Счётчика покупателей за неделю у бэкенда нет.
    buyersThisWeek: 0,
    deliveryNote: deliveryDateLabel(product.estimated_delivery_date, locale)
      ? (locale === 'ru' ? 'Доставка ' : 'Yetkazib berish ') + deliveryDateLabel(product.estimated_delivery_date, locale)
      : '',
    hasVideo: Boolean(product.video_url),
    paymentOptions: [],
    /*
     * Бумаги, которые модератор ПРОВЕРИЛ. Блок «гарантии» — единственное
     * место на карточке, которое говорит «за это ручается площадка», и по
     * смыслу это ровно оно: не обещание продавца, а подтверждение.
     *
     * Показываем только вид документа. Ни файла, ни вердикта, ни причины
     * отказа: скан — это ветпаспорт с личными данными продавца, а отказ
     * адресован ему, не покупателю. Непроверенных бумаг здесь нет вовсе —
     * иначе «есть справка» читалось бы как «справка подтверждена».
     */
    warranty: (product.verified_documents ?? []).map(paper => ({
      title: paper.kind_display,
      description: locale === 'ru' ? 'Проверено модератором' : 'Moderator tekshirgan',
      icon: 'seal-check',
    })),
    delivery: [],
    // Лента фотографий над отзывами — те же снимки, что у самих отзывов:
    // отдельной галереи покупательских фото бэкенд не отдаёт.
    reviewPhotos: previews.flatMap(review => review.photos ?? []),
    reviewsPreview: previews,
  })
})
