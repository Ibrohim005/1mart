import { categories } from '../../../mocks/data'
import { localizeCategories } from '../../../mocks/category-i18n'
import { mockLocale } from '../../../mocks/facets'

import { visibleCategories } from '../../utils/org-input'

/** Дерево категорий; сотруднику — только открытые его отделу */
export default defineEventHandler(event => ok(localizeCategories(visibleCategories(event, categories), mockLocale(getHeader(event, 'accept-language')))))
