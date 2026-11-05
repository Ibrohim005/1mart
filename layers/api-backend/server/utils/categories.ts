/**
 * Категория по slug → её UUID и тип (животное/товар).
 *
 * Каталог бэкенда фильтруется по `category_animal` / `category_product`,
 * то есть по UUID; slug он не принимает. Фронт же адресует категории
 * slug'ом — он в URL. Без этого перевода страница категории показывала бы
 * весь каталог под её заголовком, молча и убедительно.
 *
 * Животные и товары лежат в разных таблицах, поэтому вместе со связкой
 * нужен и тип: он решает, в какой из двух параметров подставить id.
 */
import type { Category } from '#shared/types/catalog'

export interface CategoryRef {
  id: string
  kind: 'animal' | 'product'
}

interface UpstreamNode {
  id: string
  name?: string
  slug?: string | null
  /**
   * Слаг на всех языках. `slug` — на текущем, им рисуются ссылки; `slugs`
   * нужен, чтобы УЗНАТЬ категорию по пути, отрисованному в другом языке.
   * Необязательное: старый бэкенд его не отдаёт.
   */
  slugs?: string[] | null
  image?: string | null
  children?: UpstreamNode[]
}

interface AllCategories {
  animal_categories?: UpstreamNode[]
  product_categories?: UpstreamNode[]
}

/**
 * Справочник меняется редко, а страница категории дёргает его на каждый
 * запрос. Держим разобранную карту в памяти процесса на несколько минут —
 * иначе к каждому открытию каталога добавляется лишний круг до бэкенда.
 */
const TTL_MS = 5 * 60 * 1000
/**
 * Ключ — язык, и это не оптимизация, а условие правильности: slug у бэкенда
 * переведён (`koshki`/`mushuklar`, `sobaki`/`itlar`). С одной общей картой её
 * наполнял тот, кто пришёл первым, и следующие пять минут второй язык не
 * находил НИ ОДНОЙ категории. Заметить это вдвойне тяжело: на ненайденный
 * slug поиск отвечает пустой выдачей с кодом 200 — неотличимо от «в
 * категории пусто».
 */
const cache = new Map<string, { at: number, map: Map<string, CategoryRef> }>()

function walk(nodes: UpstreamNode[] | undefined, kind: CategoryRef['kind'], into: Map<string, CategoryRef>) {
  for (const node of nodes ?? []) {
    // Индексируем слаг на ВСЕХ языках, а не только на текущем. Переключение
    // языка сохраняет путь (`/uz/category/itlar` → `/ru/category/itlar`), и
    // карта, собранная по одному языку, отвечала «Такой страницы нет» на
    // категорию, которая очевидно существует. `slug` оставлен для бэкенда,
    // который ещё не отдаёт `slugs`.
    for (const slug of node.slugs?.length ? node.slugs : [node.slug]) {
      if (slug) into.set(slug, { id: node.id, kind })
    }
    walk(node.children, kind, into)
  }
}

export async function categoryBySlug(event: NitroEvent, slug: string): Promise<CategoryRef | null> {
  // Тот же заголовок, что уходит в бэкенд (см. `upstream`): иначе ключ кэша
  // и язык ответа разъедутся.
  const locale = (getHeader(event, 'accept-language') || 'uz').split('-')[0]!
  const hit = cache.get(locale)
  if (hit && Date.now() - hit.at <= TTL_MS) return hit.map.get(slug) ?? null

  // Одним запросом вместо двух: /all-categories/ отдаёт оба дерева и
  // кэшируется на самом бэкенде.
  const all = await upstream<AllCategories>(event, '/market/all-categories/')
  const map = new Map<string, CategoryRef>()
  walk(all.animal_categories, 'animal', map)
  walk(all.product_categories, 'product', map)
  cache.set(locale, { at: Date.now(), map })
  return map.get(slug) ?? null
}

/** Для тестов и ручной инвалидации после правок справочника в админке. */
export function forgetCategories() {
  cache.clear()
}

/**
 * Полный справочник в виде, который ждёт фронт.
 *
 * Нужен не только меню: страница категории берёт из выдачи поиска её
 * собственный заголовок (`categories.find(c => c.slug === slug)`) и список
 * подкатегорий для сайдбара. Без него страница падала с «Cannot read
 * properties of undefined (reading 'find')» — 500 на каждой категории,
 * при том что товары в ответе были.
 */
function node(source: UpstreamNode, group: Category['group'], parentId: string | null): Category {
  return {
    id: source.id,
    slug: source.slug || source.id,
    ...(source.slugs?.length ? { slugs: source.slugs } : {}),
    title: source.name ?? '',
    parentId,
    group,
    ...(source.image ? { image: source.image } : {}),
    children: (source.children ?? []).map(child => node(child, group, source.id)),
  }
}

/**
 * Сводная категория «Все» — наша, её в справочнике бэкенда нет.
 *
 * Без неё со страницы каталога пропадал переключатель «Животные /
 * Зоотовары»: он рисуется только там, где категория не задаёт группу сама
 * (`showGroupTabs` в category/[slug].vue), а у каждой категории из
 * справочника группа есть. Заодно оживает ссылка «Товары» из подвала,
 * которая ведёт на `/category/vse?group=goods`.
 */
export const ALL_SLUG = 'vse'

const ALL_TITLES: Record<string, string> = { ru: 'Все', uz: 'Hammasi' }

function allCategory(locale: string): Category {
  return {
    id: ALL_SLUG,
    slug: ALL_SLUG,
    title: ALL_TITLES[locale] ?? ALL_TITLES.uz!,
    parentId: null,
    // Группы намеренно нет — по её отсутствию страница и понимает,
    // что здесь нужны вкладки.
    children: [],
  }
}

export async function categoryList(event: NitroEvent): Promise<Category[]> {
  const locale = (getHeader(event, 'accept-language') || 'uz').split('-')[0]!
  const all = await upstream<AllCategories>(event, '/market/all-categories/')
  return [
    allCategory(locale),
    ...(all.animal_categories ?? []).map(item => node(item, 'animals', null)),
    ...(all.product_categories ?? []).map(item => node(item, 'goods', null)),
  ]
}

/**
 * Путь от корня до категории — «Хлебные крошки» на карточке товара.
 *
 * Бэкенд в карточке отдаёт только id категории и её имя; предков он не
 * прикладывает и отдельного эндпоинта за ними нет. Но всё дерево мы и так
 * умеем забирать одним запросом, поэтому цепочка собирается здесь.
 *
 * Это не косметика: тот же массив уходит в разметку BreadcrumbList для
 * поисковика (`layers/pdp/.../[slug].vue`). Пустой — и у страницы товара нет
 * ни крошек на экране, ни места в структуре сайта для Google.
 */
export async function categoryPath(event: NitroEvent, id: string | null | undefined): Promise<Category[]> {
  if (!id) return []

  const path: Category[] = []
  const walk = (nodes: Category[], trail: Category[]): boolean => {
    for (const item of nodes) {
      const next = [...trail, item]
      if (item.id === id) {
        path.push(...next)
        return true
      }
      if (walk(item.children ?? [], next)) return true
    }
    return false
  }

  try {
    walk(await categoryList(event), [])
  }
  catch {
    // Справочник не ответил — крошек просто не будет. Ронять из-за них
    // карточку товара нельзя: она и без них полностью полезна.
    return []
  }
  // Вместе с самой категорией: последним звеном страница печатает название
  // товара, а не категорию, — так же устроен и мок.
  return path
}
