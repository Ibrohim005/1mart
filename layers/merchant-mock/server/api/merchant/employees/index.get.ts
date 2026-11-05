import { employees } from '../../../lib/db'

/**
 * Сотрудники продавца и их роли доступа.
 * TODO: Connect to backend endpoint GET /merchant/employees
 */
export default defineEventHandler(() => ok(employees))
