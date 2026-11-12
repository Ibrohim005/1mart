import { cartEntries, cartSummary, pendingOf, setQuantity } from '../../utils/cart-state'
import { mockStatus } from '../../utils/mock-status'
import { can, membership } from '../../utils/org-state'

/**
 * Изменение количества. Сотрудник с лимитом не может увеличить свою заявку
 * сверх остатка; закупщик правит заявки без этой проверки — он и решает.
 * TODO: Connect to backend endpoint PUT /cart/items
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ skuId: number, quantity: number, lineId?: string }>(event)
  const quantity = body.quantity ?? 1
  // lineId — строка чужой заявки (её правит закупщик); без него — своя строка с этим SKU
  const ref = body.lineId ?? body.skuId

  const employee = membership(event)?.employee
  if (employee?.monthlyLimit != null && !can(event, 'requests.approve')) {
    const line = cartEntries(event).find(entry => entry.lineId === ref || (entry.skuId === Number(ref) && entry.employeeId === employee.id))
    if (line && quantity > line.quantity) {
      const left = employee.monthlyLimit - employee.spentThisMonth - pendingOf(event, employee.id)
      if (line.product.price.amount * (quantity - line.quantity) > left) {
        mockStatus(event, 422)
        return fail([{ code: 'limit_exceeded', message: 'Monthly limit exceeded', details: { left: Math.max(0, left) } }])
      }
    }
  }

  setQuantity(event, ref, quantity)
  return ok(cartSummary(event))
})
