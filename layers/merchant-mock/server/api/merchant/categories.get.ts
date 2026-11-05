import { categories } from '../../lib/db'

/**
 * Категории продавца с числом товаров и ставкой комиссии.
 * TODO: Connect to backend endpoint GET /merchant/categories
 */
export default defineEventHandler(() => ok(categories))
