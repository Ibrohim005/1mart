import type { Category } from '#shared/types/catalog'

interface UpstreamCategory {
  id: string
  name: string
  slug?: string | null
  slug_uz?: string | null
  image?: string | null
  children?: UpstreamCategory[]
}

/**
 * Дерево категорий. Бэкенд держит животных и товары в РАЗНЫХ таблицах
 * (CategoryAnimal / CategoryProduct — у ShopProduct это XOR), а фронту нужен
 * один список с пометкой group, по которой диалог выбора разводит вкладки.
 */
function toCategory(node: UpstreamCategory, group: Category['group'], parentId: string | null): Category {
  return {
    id: node.id,
    slug: node.slug || node.slug_uz || node.id,
    title: node.name,
    parentId,
    group,
    ...(node.image ? { image: node.image } : {}),
    children: (node.children ?? []).map(child => toCategory(child, group, node.id)),
  }
}

export default defineEventHandler(async (event) => {
  // Оба дерева параллельно: один медленный запрос не должен задерживать
  // второй — это первый экран главной страницы.
  const [animals, goods] = await Promise.all([
    upstream<unknown>(event, '/market/category-animal/', { query: { limit: 500 } }),
    upstream<unknown>(event, '/market/product-category/', { query: { limit: 500 } }),
  ])

  // limit обязателен: эти вьюхи пагинированы по 10, и без него в меню
  // попадали бы только первые десять корневых категорий.
  return ok<Category[]>([
    ...items<UpstreamCategory>(animals).map(node => toCategory(node, 'animals', null)),
    ...items<UpstreamCategory>(goods).map(node => toCategory(node, 'goods', null)),
  ])
})
