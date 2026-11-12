import { findProduct } from '../../../mocks/data'
import { mockStatus } from '../../utils/mock-status'
import { allowedCategories, can, isAllowed } from '../../utils/org-state'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')!
  // Сотруднику без права оформлять строка оплаты говорит про заявку закупщику
  const product = findProduct(slug, { canPay: can(event, 'requests.approve') })

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Товар не найден' })
  }

  // Товар из категории, закрытой отделу сотрудника: страница показывает «нет доступа»
  if (!isAllowed(allowedCategories(event), product.facets)) {
    mockStatus(event, 403)
    return fail([{ code: 'category_forbidden', message: 'This category is not open for your department' }])
  }

  return ok(product)
})
