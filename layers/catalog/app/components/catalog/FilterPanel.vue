<script setup lang="ts">
/**
 * Сайдбар фильтров страницы категории: карточка категории, карточка
 * фильтров (группы сворачиваются, длинные списки раскрываются «Ещё N»)
 * и кнопки «Применить» / «Сбросить».
 *
 * Высота групп анимируется через grid-template-rows 0fr → 1fr: панель
 * не прыгает и не мигает, а при prefers-reduced-motion переход отключён.
 */
import type { Category, Filter } from '#shared/types/catalog'
const { t, locale } = useI18n()

const props = defineProps<{
  filters: Filter[]
  /** Текущая категория — чип под заголовком «Категория» */
  categoryTitle: string
  /** Дерево разделов для диалога выбора категории */
  categories?: Category[]
}>()

const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
/** Поле узкое, а цены длинные: «До 540 000 000» обрезалось, поэтому подсказка короткая - «До 540 млн» */
function priceHint(prefix: string, value?: number | null) {
  if (value == null) return prefix
  return `${prefix} ${shortPrice(value)}`
}

/*
 * Не Intl с notation: compact - сервер и браузер расходятся на узбекском
 * («4K» и «4 ming»), и страница ломала гидратацию.
 */
const PRICE_UNITS: Array<[number, string]> = [[1e9, 'unitB'], [1e6, 'unitM'], [1e3, 'unitK']]
function shortPrice(value: number) {
  const unit = PRICE_UNITS.find(([size]) => value >= size)
  if (!unit) return String(value)
  const scaled = Math.round((value / unit[0]) * 10) / 10
  const text = locale.value === 'en' ? String(scaled) : String(scaled).replace('.', ',')
  return t(`ui.catalog.filterPanel.${unit[1]}`, { n: text })
}

function isChecked(code: string, value: string) {
  const selected = String(route.query[code] ?? '').split(',').filter(Boolean)
  // Пока фильтр не трогали, отмечен вариант «Все» — как в макете
  if (!selected.length) return value === 'all'
  return selected.includes(value)
}

function toggleValue(code: string, value: string) {
  // «Все» — это отсутствие выбора, а не значение: иначе в адрес попадало
  // `brand=all,rolex`, и галочки стояли и на «Все», и на бренде
  const current = String(route.query[code] ?? '').split(',').filter(item => item && item !== 'all')
  const next = value === 'all'
    ? []
    : current.includes(value) ? current.filter(v => v !== value) : [...current, value]
  router.push({ query: { ...route.query, [code]: next.join(',') || undefined, page: undefined } })
}

function reset(code: string) {
  router.push({ query: { ...route.query, [code]: undefined, [`${code}_from`]: undefined, [`${code}_to`]: undefined } })
}

/**
 * Есть ли что сбрасывать у этого фильтра. Раньше «Сбросить» стояло у каждого
 * фильтра всегда, и в девяти случаях из десяти нажатие не делало ничего —
 * кнопка выглядела сломанной.
 */
function isFilterSet(code: string) {
  const value = route.query[code]
  const from = route.query[`${code}_from`]
  const to = route.query[`${code}_to`]
  return [value, from, to].some(item => item !== undefined && item !== '' && item !== 'all')
}

// «Все» открывает диалог выбора категории (два уровня, поиск, вкладки)
const isPickerOpen = ref(false)

const pickedCategories = computed(() =>
  String(route.query.category ?? '').split(',').filter(Boolean),
)

/** Названия выбранных подкатегорий — чипы под заголовком «Категория» */
const pickedTitles = computed(() => {
  const all = (props.categories ?? []).flatMap(item => item.children ?? [])
  return pickedCategories.value
    .map(slug => all.find(child => child.slug === slug)?.title)
    .filter((title): title is string => Boolean(title))
})

/**
 * Диалог показывает разделы всего каталога, а страница заперта в своей
 * категории: выбор подкатегории чужого раздела всегда давал пустую выдачу,
 * и человек видел «ничего не найдено» вместо товаров. Поэтому если выбранное
 * лежит в другом разделе — уходим на его страницу вместе с фильтром.
 */
function applyCategories(slugs: string[]) {
  const query = { ...route.query, category: slugs.join(',') || undefined, page: undefined }

  const roots = props.categories ?? []
  const rootOf = (slug: string) => roots.find(item => item.children?.some(child => child.slug === slug))
  const picked = slugs.map(rootOf).filter(Boolean)
  const currentSlug = String(route.params.slug ?? '')

  // Уводим только когда весь выбор целиком лежит в одном чужом разделе:
  // при выборе из нескольких разделов правильнее остаться и показать всё,
  // что нашлось, чем молча увести в один из них.
  const target = picked.length && picked.every(item => item!.slug === picked[0]!.slug)
    ? picked[0]!.slug
    : null

  if (target && target !== currentSlug) {
    router.push({ path: localePath(`/category/${target}`), query })
    return
  }

  router.push({ query })
}

/**
 * «Ещё N» раскрывает скрытые значения фильтра. Скрытые значения всегда
 * в разметке, просто в свёрнутой обёртке — так раскрытие анимируется
 * по высоте, а не появляется рывком.
 */
const VISIBLE_LIMIT = 5
const expanded = reactive<Record<string, boolean>>({})
function toggleMore(code: string) {
  expanded[code] = !expanded[code]
}
function headValues(filter: Filter) {
  return (filter.values ?? []).slice(0, VISIBLE_LIMIT)
}
function tailValues(filter: Filter) {
  return (filter.values ?? []).slice(VISIBLE_LIMIT)
}

/**
 * Кнопки размеров и памяти: два ряда, остальное за «Ещё N». Выбранное значение
 * не прячем, иначе человек не увидел бы, что фильтр включён.
 */
const BUTTONS_LIMIT = 8
function visibleButtons(filter: Filter) {
  const values = filter.values ?? []
  if (expanded[filter.code]) return values
  return values.filter((value, index) => index < BUTTONS_LIMIT || isChecked(filter.code, value.value))
}
function canExpandButtons(filter: Filter) {
  return (filter.values?.length ?? 0) > BUTTONS_LIMIT
}
function hiddenButtons(filter: Filter) {
  return (filter.values?.length ?? 0) - visibleButtons(filter).length
}

/** Свёрнутые группы фильтров; по умолчанию все раскрыты */
const collapsed = reactive<Record<string, boolean>>({})
function toggleGroup(code: string) {
  collapsed[code] = !collapsed[code]
}

/**
 * Единицы измерения в подписях значений. Справочники бэкенда приходят
 * как заведено в админке — «5 килограмм» на узбекской странице, «1 litr»
 * на русской. Переводим полные слова в короткую единицу текущего языка.
 */
const UNIT_PATTERNS: Array<[RegExp, string]> = [
  [/(?<!\p{L})(?:миллилитр(?:а|ов)?|millilitr|milliliters?|millilitres?)(?!\p{L})/giu, 'ml'],
  [/(?<!\p{L})(?:килограмм(?:а|ов)?|kilogramm?|kilograms?)(?!\p{L})/giu, 'kg'],
  [/(?<!\p{L})(?:грамм(?:а|ов)?|gramm?|grams?)(?!\p{L})/giu, 'g'],
  [/(?<!\p{L})(?:литр(?:а|ов)?|litr|liters?|litres?)(?!\p{L})/giu, 'l'],
]
function valueTitle(title: string) {
  return UNIT_PATTERNS.reduce((text, [pattern, unit]) => text.replace(pattern, t(`shell.catalog.units.${unit}`)), title)
}

/**
 * Группы, которые нечем сузить, не показываем: пустой список, одно
 * значение (кроме «Все») или диапазон цены из одной точки.
 */
const visibleFilters = computed(() => props.filters.filter((filter) => {
  if (filter.type === 'range') return filter.min == null || filter.max == null || filter.max > filter.min
  return (filter.values ?? []).filter(value => value.value !== 'all').length > 1
}))

/** Сброс всех фильтров: остаются запрос, сортировка и вкладка */
const KEEP_KEYS = new Set(['q', 'sort', 'group', 'kind', 'exact'])
const hasAnyFilter = computed(() =>
  Object.entries(route.query).some(([key, value]) => !KEEP_KEYS.has(key) && key !== 'page' && value),
)
function resetAll() {
  const query = Object.fromEntries(Object.entries(route.query).filter(([key]) => KEEP_KEYS.has(key)))
  router.push({ query })
}

/**
 * Диапазон цены пишем в адрес — его читает загрузка списка товаров.
 *
 * Оба поля читаем из самой формы за ОДИН push, а не через `route.query`:
 * `router.push` асинхронный, и `route.query` в пределах одного тика ещё
 * старый. Раньше, если «Дан» и «Гача» менялись в одном тике (программно,
 * вставка сразу в оба), второй push стартовал от ДОpush-состояния и затирал
 * первую границу — одна из введённых цен молча терялась. Считывание обоих
 * значений из DOM группы делает результат независимым от порядка и тайминга.
 */
function setRange(code: string, event: Event) {
  const group = (event.target as HTMLElement).closest('.filter__range')
  const inputs = group ? Array.from(group.querySelectorAll<HTMLInputElement>('input')) : []
  const from = inputs[0]?.value.trim() || undefined
  const to = inputs[1]?.value.trim() || undefined
  router.push({
    query: { ...route.query, [`${code}_from`]: from, [`${code}_to`]: to, page: undefined },
  })
}

/** «Показать» прокручивает к результатам — фильтры уже в адресе */
function scrollToResults() {
  document.querySelector('.category__results, .grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__card sidebar__card--category">
      <div class="sidebar__head">
        <h2 class="sidebar__title">{{ t('catalog.category') }}</h2>
        <button type="button" class="sidebar__reset" @click="isPickerOpen = true">
          {{ $t('catalog.all') }}
          <UiIcon name="alt-arrow-right" :size="14" />
        </button>
      </div>
      <div class="sidebar__chips">
        <span class="sidebar__chip">{{ categoryTitle }}</span>
        <span v-for="title in pickedTitles" :key="title" class="sidebar__chip sidebar__chip--picked">{{ title }}</span>
      </div>
    </div>

    <LazyCatalogCategoryPickerModal
      v-model="isPickerOpen"
      :categories="categories ?? []"
      :selected="pickedCategories"
      @apply="applyCategories"
    />

    <div v-if="visibleFilters.length" class="sidebar__card">
      <section
        v-for="(filter, index) in visibleFilters"
        :key="filter.code"
        class="filter"
        :class="{ 'filter--divided': index > 0, 'filter--collapsed': collapsed[filter.code] }"
      >
        <div class="sidebar__head">
          <button
            type="button"
            class="filter__toggle"
            :aria-expanded="!collapsed[filter.code]"
            :aria-controls="`filter-${filter.code}`"
            @click="toggleGroup(filter.code)"
          >
            <h3 class="filter__title">{{ filter.title }}</h3>
            <UiIcon name="alt-arrow-down" :size="18" class="filter__toggle-chevron" />
          </button>
          <button v-if="filter.resettable && isFilterSet(filter.code)" type="button" class="sidebar__reset" @click="reset(filter.code)">
            {{ $t('catalog.reset') }}
          </button>
        </div>

        <div :id="`filter-${filter.code}`" class="filter__collapse" :class="{ 'filter__collapse--open': !collapsed[filter.code] }">
          <div class="filter__collapse-inner" :inert="collapsed[filter.code] || undefined">
            <!-- Цена -->
            <div v-if="filter.type === 'range'" class="filter__range">
              <label class="filter__input">
                <input
                  type="number"
                  :aria-label="$t('ui.catalog.filterPanel.priceFrom')"
                  :placeholder="priceHint($t('ui.catalog.filterPanel.text2'), filter.min)"
                  :min="filter.min"
                  :max="filter.max"
                  :value="route.query[`${filter.code}_from`] ?? ''"
                  @change="setRange(filter.code, $event)"
                >
              </label>
              <span class="filter__range-dash" aria-hidden="true" />
              <label class="filter__input">
                <input
                  type="number"
                  :aria-label="$t('ui.catalog.filterPanel.priceTo')"
                  :placeholder="priceHint($t('ui.catalog.filterPanel.text'), filter.max)"
                  :min="filter.min"
                  :max="filter.max"
                  :value="route.query[`${filter.code}_to`] ?? ''"
                  @change="setRange(filter.code, $event)"
                >
              </label>
            </div>

            <!-- Кнопки-чипы: память, размер -->
            <template v-else-if="filter.type === 'buttons'">
              <div class="filter__buttons">
                <button
                  v-for="value in visibleButtons(filter)"
                  :key="value.value"
                  type="button"
                  class="filter__button"
                  :class="{ 'filter__button--active': isChecked(filter.code, value.value) }"
                  :aria-pressed="isChecked(filter.code, value.value)"
                  @click="toggleValue(filter.code, value.value)"
                >
                  {{ valueTitle(value.title) }}
                </button>
              </div>

              <button
                v-if="canExpandButtons(filter) && (expanded[filter.code] || hiddenButtons(filter))"
                type="button"
                class="filter__more"
                :aria-expanded="!!expanded[filter.code]"
                @click="toggleMore(filter.code)"
              >
                {{ expanded[filter.code]
                  ? $t('common.collapse')
                  : $t('ui.catalog.filterPanel.showMore', { count: hiddenButtons(filter) }) }}
                <UiIcon
                  name="arrow-down"
                  :size="16"
                  class="filter__chevron"
                  :class="{ 'filter__chevron--up': expanded[filter.code] }"
                />
              </button>
            </template>

            <!-- Списки с чекбоксами: первые пять видны, остальные раскрываются -->
            <template v-else>
              <div class="filter__list">
                <button
                  v-for="value in headValues(filter)"
                  :key="value.value"
                  type="button"
                  role="checkbox"
                  class="filter__row"
                  :aria-checked="isChecked(filter.code, value.value)"
                  @click="toggleValue(filter.code, value.value)"
                >
                  <span class="filter__check" :class="{ 'filter__check--on': isChecked(filter.code, value.value) }">
                    <UiIcon name="tick-square-fill" :size="20" />
                  </span>
                  <span v-if="value.swatch" class="filter__swatch" :style="{ background: value.swatch }" />
                  <span class="filter__label">{{ valueTitle(value.title) }}</span>
                  <span v-if="value.count" class="filter__count">{{ value.count }}</span>
                </button>
              </div>

              <div v-if="tailValues(filter).length" class="filter__collapse" :class="{ 'filter__collapse--open': expanded[filter.code] }">
                <div class="filter__collapse-inner" :inert="!expanded[filter.code] || undefined">
                  <div class="filter__list filter__list--tail">
                    <button
                      v-for="value in tailValues(filter)"
                      :key="value.value"
                      type="button"
                      role="checkbox"
                      class="filter__row"
                      :aria-checked="isChecked(filter.code, value.value)"
                      @click="toggleValue(filter.code, value.value)"
                    >
                      <span class="filter__check" :class="{ 'filter__check--on': isChecked(filter.code, value.value) }">
                        <UiIcon name="tick-square-fill" :size="20" />
                      </span>
                      <span v-if="value.swatch" class="filter__swatch" :style="{ background: value.swatch }" />
                      <span class="filter__label">{{ valueTitle(value.title) }}</span>
                      <span v-if="value.count" class="filter__count">{{ value.count }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                v-if="tailValues(filter).length"
                type="button"
                class="filter__more"
                :aria-expanded="!!expanded[filter.code]"
                @click="toggleMore(filter.code)"
              >
                {{ expanded[filter.code]
                  ? $t('common.collapse')
                  : $t('ui.catalog.filterPanel.showMore', { count: tailValues(filter).length }) }}
                <UiIcon
                  name="arrow-down"
                  :size="16"
                  class="filter__chevron"
                  :class="{ 'filter__chevron--up': expanded[filter.code] }"
                />
              </button>
            </template>
          </div>
        </div>
      </section>
    </div>

    <!-- Фильтры применяются сразу, кнопка только ведёт к выдаче — поэтому «Показать», а не «Применить» -->
    <div v-if="visibleFilters.length || hasAnyFilter" class="sidebar__actions">
      <button type="button" class="sidebar__submit" @click="scrollToResults">{{ $t('catalog.show') }}</button>
      <button v-if="hasAnyFilter" type="button" class="sidebar__clear" @click="resetAll">{{ $t('catalog.reset') }}</button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 345px;
}

.sidebar__card {
  padding: 16px;
  border: 1px solid var(--color-line);
  border-radius: 20px;
  background: var(--color-surface);
}

.sidebar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 24px;
}

.sidebar__title,
.filter__title {
  margin: 0;
  font-weight: 600;
  font-size: var(--text-md);
  line-height: 20px;
  color: var(--color-navy);
}

.sidebar__reset {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 5.5px;
  padding: 0;
  border: 0;
  background: none;
  font-weight: 500;
  font-size: var(--text-xs);
  line-height: 22px;
  color: var(--color-brand-text);
  cursor: pointer;
}

.sidebar__reset:hover { color: var(--color-brand-text-hover); }

.sidebar__chips { display: flex; flex-wrap: wrap; gap: 8px; }

.sidebar__chip {
  display: inline-flex;
  align-items: center;
  height: 34px;
  margin-top: 10px;
  padding-inline: 14px;
  border-radius: 10px;
  background: var(--color-navy-2);
  font-weight: 500;
  font-size: var(--text-xs);
  line-height: 15px;
  color: var(--color-surface);
}

.sidebar__chip--picked {
  background: var(--color-brand-tint);
  color: var(--color-brand-text-hover);
}

/* ---------- Группы фильтров ---------- */

.filter { padding-block: 14px; }
.filter:first-child { padding-top: 0; }
.filter:last-child { padding-bottom: 0; }
.filter--divided { border-top: 1px solid var(--color-line); }

.filter__toggle {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  cursor: pointer;
}

.filter__toggle:focus-visible { outline: none; box-shadow: var(--focus-ring); border-radius: 6px; }

.filter__toggle-chevron {
  color: var(--color-gray);
  transition: transform .25s ease;
}

.filter--collapsed .filter__toggle-chevron { transform: rotate(-90deg); }

/* Плавное раскрытие по высоте: 0fr ↔ 1fr, содержимое подрезается */
.filter__collapse {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows .28s ease, opacity .2s ease;
}

.filter__collapse--open { grid-template-rows: 1fr; opacity: 1; }

.filter__collapse-inner { min-height: 0; overflow: hidden; }

.filter__range { display: flex; align-items: center; gap: 6px; padding-top: 12px; }

.filter__range-dash { flex: 0 0 8px; height: 1.5px; background: var(--color-gray); }

.filter__input {
  display: block;
  flex: 1;
  height: 44px;
  border: 1px solid var(--color-line);
  border-radius: 12px;
  background: var(--color-page);
  transition: border-color .15s ease, background-color .15s ease;
}

.filter__input:focus-within { border-color: var(--color-brand); background: var(--color-surface); }

.filter__input input {
  width: 100%;
  height: 100%;
  padding-inline: 12px;
  border: 0;
  background: none;
  outline: none;
  font: var(--type-button-sm);
  font-weight: 500;
  color: var(--input-color);
}

.filter__input input::placeholder { font-weight: 400; color: var(--input-placeholder); }

/* Ровная сетка: одинаковые ячейки, последний ряд не растягивается */
.filter__buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; padding-top: 12px; }

.filter__button {
  min-width: 0;
  height: 36px;
  padding-inline: 4px;
  white-space: nowrap;
  border: 1px solid var(--color-line);
  border-radius: 10px;
  background: var(--color-surface);
  font-family: var(--font-ui);
  font-weight: 500;
  font-size: var(--text-xs);
  color: var(--color-navy-2);
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}

.filter__button:hover { border-color: var(--color-brand); }

.filter__button--active,
.filter__button--active:hover {
  border-color: var(--color-brand);
  background: var(--color-brand-tint);
  color: var(--color-brand-text-hover);
}

.filter__list { display: flex; flex-direction: column; gap: 2px; padding-top: 10px; }
.filter__list--tail { padding-top: 2px; }

.filter__row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding-inline: 8px;
  border: 0;
  border-radius: 10px;
  background: none;
  cursor: pointer;
  transition: background-color .15s ease;
}

.filter__row:hover { background: var(--color-page); }
.filter__row:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.filter__swatch {
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  border: 1px solid rgb(39 49 64 / 12%);
  border-radius: 50%;
}

.filter__label {
  flex: 1;
  overflow: hidden;
  font-weight: 400;
  font-size: var(--text-sm);
  text-align: left;
  color: var(--color-navy-2);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.filter__count { font-size: var(--text-xs); color: var(--color-gray); }

/* Галочка всегда в разметке и проявляется прозрачностью — без сдвигов.
   Включённая иконка сама рисует весь квадрат, поэтому подложки и рамки нет:
   иначе вырез галочки был бы цветом по такому же цвету. */
.filter__check {
  display: grid;
  flex: 0 0 20px;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--color-line);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-brand);
  transition: background-color .15s ease, border-color .15s ease;
}

.filter__check :deep(.icon) { opacity: 0; transform: scale(.6); transition: opacity .15s ease, transform .15s ease; }

.filter__row:hover .filter__check { border-color: var(--color-brand); }

.filter__check--on {
  border-width: 0;
  background: transparent;
}

.filter__check--on :deep(.icon) { opacity: 1; transform: none; }

.filter__more {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 0 8px;
  border: 0;
  background: none;
  font-weight: 500;
  font-size: var(--text-sm);
  line-height: 20px;
  color: var(--color-brand-text);
  cursor: pointer;
}

.filter__more:hover { color: var(--color-brand-text-hover); }

.filter__chevron { transition: transform .25s ease; }
.filter__chevron--up { transform: rotate(180deg); }

.sidebar__actions { display: flex; flex-direction: column; gap: 8px; }

.sidebar__submit,
.sidebar__clear {
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease, border-color .15s ease;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.sidebar__submit { border: 0; background: var(--color-brand); color: var(--color-on-brand); }
.sidebar__submit:hover { background: var(--color-brand-dark); }
.sidebar__submit:active { background: var(--color-brand-darker); }

.sidebar__clear { border: 1px solid var(--color-line); background: var(--color-surface); color: var(--color-navy-2); }
.sidebar__clear:hover { border-color: var(--color-brand); color: var(--color-brand-text); }

.sidebar__submit:focus-visible,
.sidebar__clear:focus-visible { outline: none; box-shadow: var(--focus-ring); }

@media (prefers-reduced-motion: reduce) {
  .filter__collapse,
  .filter__toggle-chevron,
  .filter__chevron,
  .filter__check,
  .filter__check :deep(.icon),
  .filter__row,
  .filter__button,
  .filter__input { transition: none; }
}
</style>
