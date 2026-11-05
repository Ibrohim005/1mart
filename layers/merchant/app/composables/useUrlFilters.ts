/**
 * Фильтры списка живут в адресе: их переживает перезагрузка, кнопка «Назад»
 * и ссылка коллеге. Значение по умолчанию в адрес не пишем, смена любого
 * фильтра возвращает на первую страницу.
 */
export function useUrlFilters<K extends string>(defaults: Record<K, string>) {
  const route = useRoute()
  const router = useRouter()

  const filters = Object.fromEntries(
    (Object.keys(defaults) as K[]).map((key) => {
      const value = computed<string>({
        get: () => {
          const raw = route.query[key]
          return typeof raw === 'string' ? raw : defaults[key]
        },
        set: (next) => {
          const query = { ...route.query, [key]: next === defaults[key] ? undefined : next }
          if (key !== 'page') delete query.page
          router.replace({ query })
        },
      })
      return [key, value]
    }),
  ) as Record<K, WritableComputedRef<string>>

  /** Меняется при смене любого фильтра: по нему список перезапрашивается */
  const signature = computed(() => (Object.keys(defaults) as K[]).map(key => filters[key].value).join('|'))

  return { filters, signature }
}

/** Поле поиска: ввод мгновенный, запрос один, когда человек остановился */
export function useDebouncedSearch(target: WritableComputedRef<string>) {
  const input = ref(target.value)
  watchDebounced(input, (value) => { target.value = value.trim() }, { debounce: 300 })
  watch(target, (value) => { if (value !== input.value.trim()) input.value = value })
  return input
}
