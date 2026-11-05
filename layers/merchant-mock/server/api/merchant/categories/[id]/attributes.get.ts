import { getCategoryAttributes } from '../../../../lib/db'

/**
 * Схема характеристик листовой категории: какие поля заполняет продавец и по
 * каким осям товар делится на варианты. Зависит от выбранной категории.
 * TODO: Connect to backend endpoint GET /merchant/categories/:id/attributes
 */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') || ''
  return ok(getCategoryAttributes(id))
})
