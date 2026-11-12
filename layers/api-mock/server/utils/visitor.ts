/**
 * Тип события Nitro. Берём его из авто-импорта, а не `import from 'h3'`:
 * в дереве зависимостей две копии h3, и прямой импорт даёт несовместимый тип.
 */
export type MockEvent = InstanceType<typeof H3Event>

/**
 * Кто именно сейчас ходит по моку.
 *
 * Корзина и избранное лежали в одном объекте на весь процесс: два человека,
 * открывшие демо одновременно, видели и меняли одну корзину. Идентификатор
 * приходит в `x-install-id` — фронт держит его в cookie, поэтому заголовок
 * есть и у запросов, которые Nuxt делает при серверном рендере.
 *
 * TODO: Connect to backend — на бэкенде это гостевая сессия или id покупателя.
 */
export function visitorId(event: MockEvent) {
  const header = getHeader(event, 'x-install-id')?.trim()
  if (header) return header

  // Запрос мимо нашего клиента (прямой curl, проверки) заголовка не ставит —
  // тогда берём ту же cookie, в которой фронт хранит идентификатор
  const cookie = getCookie(event, 'paylov_install_id')?.trim()
  if (cookie) return cookie

  // Первый заход и служебные запросы живут в общем гостевом ящике
  return 'anonymous'
}

/**
 * Хранилище «одно состояние на посетителя». `keyOf` меняет, на кого:
 * корзина, баланс и заказы общие у компании (scopeId из org-state).
 * Ограничиваем число ящиков: мок живёт в памяти, и бесконечно расти ему нельзя.
 */
export function perVisitor<T>(create: () => T, limit = 500, keyOf: (event: MockEvent) => string = visitorId) {
  const store = new Map<string, T>()

  return {
    get(event: MockEvent): T {
      const id = keyOf(event)
      let state = store.get(id)
      if (!state) {
        // Самый старый ящик вытесняем: Map хранит порядок вставки
        if (store.size >= limit) store.delete(store.keys().next().value!)
        state = create()
        store.set(id, state)
      }
      return state
    },
    drop(event: MockEvent) {
      store.delete(keyOf(event))
    },
  }
}
