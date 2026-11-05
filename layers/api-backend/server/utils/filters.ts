import type { Filter } from '#shared/types/catalog'

/**
 * Фильтры сайдбара каталога: бэкенд `GET /shop/catalog-filters/?type=`.
 *
 * Эндпоинт существует именно потому, что набор фильтров зависит от типа
 * каталога: `brand` и `country_of_origin` осмысленны только для товаров, а
 * какие атрибуты вариантов заведены — решает админка. Поэтому он для
 * каждой «фишки» отдаёт `available`, и это не декорация: на животных и
 * `brand`, и `country_of_origin`, и `gender` приходят с `available: false`.
 * Рисовать их всё равно — значит показать фильтр, который не сузит выдачу
 * ни при каком выборе.
 *
 * Чего у бэкенда НЕТ и что поэтому не строим: счётчиков «сколько товаров
 * под каждым значением». Агрегатов по выдаче он не считает, а число рядом
 * со значением фильтра покупатель читает как факт.
 */
interface UpstreamChip {
  label?: string
  available?: boolean
  choices?: string[]
}

interface UpstreamFilters {
  attributes?: Array<{
    key: string
    label: string
    input_type: string
    choices: string[]
    /** Перевод значений; отсутствует у числовых и у старого бэкенда. */
    choice_labels?: Record<string, string>
  }>
  deal_conditions?: Array<{ key: string, label: string }>
  brand?: UpstreamChip
  country_of_origin?: UpstreamChip
  gender?: UpstreamChip
  price?: { label?: string, min?: number | null, max?: number | null }
}

/**
 * Палитра для фильтра по цвету. Бэкенд отдаёт название значения строкой
 * («Qizil»), кода цвета у него нет вовсе — а компонент рисует кружок.
 * Незнакомое название остаётся обычным чекбоксом: показать серый кружок
 * вместо настоящего цвета хуже, чем не показать кружок.
 */
const SWATCHES: Record<string, string> = {
  qizil: '#E5322D',
  'ko\'k': '#2D6BE5',
  yashil: '#3BA55D',
  sariq: '#E5C22D',
  oq: '#F1F2F4',
  qora: '#1F2026',
  kulrang: '#9AA3AE',
  jigarrang: '#8B5A2B',
}

/**
 * Подписи фильтров, которые витрина знает сама.
 *
 * Бэкенд отдаёт `label` не по `accept-language`, а как заведено в админке:
 * у цены приходило английское «Price», у условий подписи не было вовсе и
 * стояла узбекская заглушка. На русской странице сайдбар получался на трёх
 * языках сразу. Свои фильтры подписываем сами; значения внутри них —
 * по-прежнему с бэкенда, перевести чужой справочник витрина не может.
 */
const FILTER_TITLES: Record<string, { price: string, gender: string, conditions: string }> = {
  ru: { price: 'Цена', gender: 'Пол', conditions: 'Условия' },
  uz: { price: 'Narx', gender: 'Jinsi', conditions: 'Shartlar' },
  // Иначе английский сайдбар откатывался на `?? FILTER_TITLES.uz` и печатал
  // «Narx»/«Shartlar» рядом с переведёнными названиями атрибутов.
  en: { price: 'Price', gender: 'Sex', conditions: 'Terms' },
}

function title(key: 'price' | 'gender' | 'conditions', locale: string): string {
  return (FILTER_TITLES[locale] ?? FILTER_TITLES.uz!)[key]
}

/**
 * `labels` — перевод значений из реестра. Значение фильтра остаётся сырым
 * (по нему бэкенд сопоставляет варианты, и оно же уходит в URL), переводится
 * только подпись: иначе на русской странице сайдбар предлагал «Окрас: Oq /
 * Qora / Qizil». Swatch ищем по сырому значению — палитра собрана по нему.
 */
function values(choices: string[], withSwatch: boolean, labels: Record<string, string> = {}) {
  return choices.map(choice => ({
    value: choice,
    title: labels[choice] || choice,
    ...(withSwatch && SWATCHES[choice.toLowerCase()] ? { swatch: SWATCHES[choice.toLowerCase()]! } : {}),
  }))
}

/**
 * Фильтры каталога. `categoryId` — та категория, которую открыл покупатель.
 *
 * Без неё `/shop/catalog-filters/?type=animal` отдаёт реестр ЦЕЛИКОМ, для всех
 * видов сразу: 41 блок, среди них восемь отдельных «Пол» (`gender_cat`,
 * `gender_dog`, `gender_sheep`, ...), семь отдельных «Живой вес» и шесть
 * «Цвет», плюс овечий курдюк, собачий размер, голубиные лётные качества и
 * конная дисциплина — всё на одной странице, какую категорию ни открой.
 *
 * Раньше это лечилось белым списком из трёх ключей (`pedigree`, `age_group`,
 * `animal_color`) с пометкой «временная мера до появления параметра
 * категории». Параметр появился: бэкенд резолвит схему по категории и её
 * предкам (apps/shop/category_variant_attributes.py), и страница собак
 * получает ровно восемь своих атрибутов — размер, тип шерсти, родословную.
 * Белый список снят, видовые фильтры вернулись туда, где они уместны.
 *
 * Категорию передаём, только если её тип совпадает с вкладкой: id животного
 * с `?type=product` бэкенд отвечает 400, а не молча игнорирует.
 */
export async function catalogFilters(
  event: NitroEvent,
  kind: 'animal' | 'product',
  locale: string,
  categoryId?: string,
): Promise<Filter[]> {
  let source: UpstreamFilters
  try {
    source = await upstream<UpstreamFilters>(event, '/shop/catalog-filters/', {
      query: { type: kind, ...(categoryId ? { category: categoryId } : {}) },
    })
  }
  catch {
    // Сайдбар — не причина ронять страницу каталога: товары в ответе уже
    // есть, и список без фильтров полезнее, чем 500 вместо списка.
    return []
  }

  const filters: Filter[] = []

  if (source.price && (source.price.min != null || source.price.max != null)) {
    filters.push({
      code: 'price',
      title: title('price', locale),
      type: 'range',
      // В СУМАХ — тем же числом, что покупатель видит в цене товара и вводит
      // в поле «Дан/Гача». Раньше здесь было ×100 («считаем в тийинах»), но
      // цену фильтра человек набирает руками в сумах, а не в тийинах: поле
      // требовало 450000000 вместо 4500000, а поиск ещё раз делил на 100 —
      // введённые 5 000 000 сум превращались в 50 000, и фильтр по цене не
      // находил ничего. Бэкенд фильтрует по обычным суммам (min_price/
      // max_price — DecimalField в сумах), так что и здесь суммы.
      min: Math.round(source.price.min ?? 0),
      max: Math.round(source.price.max ?? 0),
    })
  }

  for (const attribute of source.attributes ?? []) {
    // range-атрибуты (вес) бэкенд отдаёт без границ — ползунок построить
    // не из чего, а пустой диапазон выглядит как сломанный фильтр.
    if (attribute.input_type !== 'choice' || !attribute.choices?.length) continue
    filters.push({
      code: attribute.key,
      title: attribute.label,
      type: attribute.key === 'color' ? 'color' : 'checkbox',
      values: values(attribute.choices, attribute.key === 'color', attribute.choice_labels),
    })
  }

  // Видовой «Пол» из реестра (`gender_dog`: «Кобель/Сука») и общий
  // `ShopProduct.gender` (male/female) — две разные колонки с одной и той же
  // подписью «Jinsi». На странице собак сайдбар показывал их обе подряд.
  // Видовой точнее, поэтому общий уступает — ровно так же, как в кабинете
  // прячется общее поле пола, когда у категории есть своё (hasVariantGender).
  const hasSpecificGender = (source.attributes ?? []).some(a => a.key.startsWith('gender_'))
  if (!hasSpecificGender && source.gender?.available && source.gender.choices?.length) {
    filters.push({
      code: 'gender',
      title: title('gender', locale),
      type: 'buttons',
      values: values(source.gender.choices, false),
    })
  }

  // Условия сделки — набор булевых пометок продавца (торг, срочно,
  // привит, есть документы). Каждая самостоятельна, поэтому один
  // чекбоксовый блок, а не переключатель.
  const conditions = source.deal_conditions ?? []
  if (conditions.length) {
    filters.push({
      code: 'deal_conditions',
      title: title('conditions', locale),
      type: 'checkbox',
      values: conditions.map(condition => ({ value: condition.key, title: condition.label })),
    })
  }

  return filters
}
