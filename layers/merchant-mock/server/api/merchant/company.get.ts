import { company } from '../../lib/db'

/**
 * Профиль и реквизиты компании.
 * TODO: Connect to backend endpoint GET /merchant/company
 */
export default defineEventHandler(() => ok(company))
