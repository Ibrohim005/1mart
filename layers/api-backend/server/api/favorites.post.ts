interface ToggleResult {
  status: 'added' | 'removed'
  is_favorited: boolean
  product_id: string
}

/**
 * Добавление в избранное.
 *
 * Контракты расходятся: у фронта раздельные «добавить» и «убрать», у бэкенда
 * один POST /shop/favorites/toggle/ — он переключает состояние, не зная, чего
 * от него хотели. Один в один это не ложится: повторное «добавить» на уже
 * избранном товаре убрало бы его. А повторы здесь обычное дело — фронт зовёт
 * этот роут из корзины («перенести в избранное»), где товар вполне мог быть
 * добавлен раньше с карточки.
 *
 * Спасает то, что toggle возвращает РЕЗУЛЬТАТ, а не просто «ок»:
 * { status, is_favorited, product_id }. Значит можно сверить полученное
 * состояние с нужным и, если не совпало, переключить обратно — тогда
 * «добавить» становится идемпотентным, каким его и ждёт вызывающий код.
 *
 * Остаточный риск: два вызова не атомарны. Если ровно между ними тот же
 * пользователь переключит товар с другого устройства, мы вторым вызовом
 * отменим уже ЕГО действие, а не своё. Транзакционно это решается только на
 * стороне бэкенда — отдельными add/remove либо toggle с желаемым состоянием
 * в теле. До тех пор возвращаем фактическое состояние, прочитанное из
 * последнего ответа, а не то, которого добивались.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ productId?: string | number }>(event)
  const productId = String(body?.productId ?? '')

  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'productId majburiy' })
  }

  const toggle = () => upstream<ToggleResult>(event, '/shop/favorites/toggle/', {
    method: 'POST',
    auth: true,
    // У бэкенда поле называется product_id и принимает UUID товара —
    // тот же id, что уже лежит в карточке (ProductCard.id), так что
    // перевода идентификатора не требуется.
    body: { product_id: productId },
  })

  let state = await toggle()
  if (!state.is_favorited) state = await toggle()

  // Мок отдавал { count } — размер избранного. Здесь его пришлось бы
  // добирать отдельным запросом к /shop/favorites/ ради числа, которое ни
  // один вызывающий не читает (cart.ts игнорирует ответ целиком).
  // Возвращаем то, что и так знаем: чем товар стал.
  return ok({ productId, isFavorite: state.is_favorited })
})
