import { favoriteItems } from '../utils/favorites-state'

/** Избранное. Макет «Избранное 1» показывает заполненную сетку. */
export default defineEventHandler(event => ok(favoriteItems(event)))
