import type { Permission } from '#shared/types/company'
import { PERMISSIONS } from '#shared/types/company'
import type { Category } from '#shared/types/catalog'
import { categories, productCards } from '../../mocks/data'
import type { MockEvent } from './visitor'
import { allowedCategories, isAllowed } from './org-state'

/** Только известные права: чужая строка в теле запроса не должна стать правом */
export function permissionsFrom(value: unknown): Permission[] {
  return Array.isArray(value) ? PERMISSIONS.filter(item => value.includes(item)) : []
}

/** Только существующие слаги разделов и подразделов */
export function categoriesFrom(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const known = new Set(categories.flatMap(root => [root.slug, ...(root.children ?? []).map(child => child.slug)]))
  return [...new Set(value.map(String))].filter(slug => known.has(slug))
}

/**
 * Товары, которые видит этот пользователь: сотруднику — только категории его
 * отдела (и свои дополнительные), остальным — весь каталог.
 */
export function visibleCards(event: MockEvent) {
  const allowed = allowedCategories(event)
  return allowed ? productCards.filter(card => isAllowed(allowed, card.facets)) : productCards
}

/** Дерево категорий без закрытых разделов: подраздел открыт сам или через свой раздел */
export function visibleCategories(event: MockEvent, tree: Category[]): Category[] {
  const allowed = allowedCategories(event)
  if (!allowed) return tree
  return tree
    .filter(root => root.slug !== 'vse')
    .map((root) => {
      if (allowed.includes(root.slug)) return root
      const children = (root.children ?? []).filter(child => allowed.includes(child.slug))
      return children.length ? { ...root, children } : null
    })
    .filter((root): root is Category => root !== null)
}
