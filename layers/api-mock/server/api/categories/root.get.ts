import { categories } from '../../../mocks/data'
import { localizeCategories } from '../../../mocks/category-i18n'
import { mockLocale } from '../../../mocks/facets'

export default defineEventHandler(event => ok(localizeCategories(categories, mockLocale(getHeader(event, 'accept-language')))))
