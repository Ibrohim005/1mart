import { addToCart, cartSummary, pendingOf } from '../../utils/cart-state'
import { mockStatus } from '../../utils/mock-status'
import { allowedCategories, can, isAllowed, membership } from '../../utils/org-state'
import { productCards } from '../../../mocks/data'

/**
 * Положить товар в корзину компании — это заявка от имени вошедшего сотрудника.
 * Сервер проверяет три вещи, интерфейс их только подсказывает:
 * - право заявлять (requests.create);
 * - категорию: сотруднику открыты только категории его отдела;
 * - месячный лимит, если руководитель его задал: оформлено + уже в корзине + новое.
 * TODO: Connect to backend endpoint POST /cart/items
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ skuId: number, quantity: number }>(event)
  const quantity = body.quantity ?? 1
  const product = productCards.find(item => item.id === Math.floor(Number(body.skuId) / 10))

  if (!can(event, 'requests.create')) {
    mockStatus(event, 403)
    return fail([{ code: 'requests_forbidden', message: 'This role cannot request goods' }])
  }
  if (product && !isAllowed(allowedCategories(event), product.facets)) {
    mockStatus(event, 403)
    return fail([{ code: 'category_forbidden', message: 'This category is not open for your department' }])
  }

  const employee = membership(event)?.employee
  if (product && employee?.monthlyLimit != null) {
    const left = employee.monthlyLimit - employee.spentThisMonth - pendingOf(event, employee.id)
    if (product.price.amount * quantity > left) {
      mockStatus(event, 422)
      return fail([{ code: 'limit_exceeded', message: 'Monthly limit exceeded', details: { left: Math.max(0, left) } }])
    }
  }

  addToCart(event, body.skuId, quantity)
  return ok(cartSummary(event))
})
