import type { DocumentType } from '#shared/types/merchant'
import { documents } from '../../lib/db'

/**
 * Документы и финансовая отчётность: счета, акты, отчёты, договоры, сверки.
 * TODO: Connect to backend endpoint GET /merchant/documents
 */
export default defineEventHandler((event) => {
  const q = getQuery(event)
  const list = documents.filter((d) => {
    if (q.type && q.type !== 'all' && d.type !== (q.type as DocumentType)) return false
    return true
  })
  return ok(list)
})
