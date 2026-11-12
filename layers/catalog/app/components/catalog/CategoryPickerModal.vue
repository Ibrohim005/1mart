<script setup lang="ts">
/**
 * Диалог выбора категории: два уровня, поиск и вкладки по группам.
 * Первый экран — корневые разделы с превью и счётчиком выбранного,
 * второй — подкатегории с чекбоксами. «Применить» пишет выбор в адрес.
 * TODO: Connect to backend endpoint GET /categories/root?depth=2
 */
import type { Category, Id } from '#shared/types/catalog'

const props = defineProps<{
  modelValue: boolean
  categories: Category[]
  /** Уже выбранные подкатегории (слаги) */
  selected?: string[]
}>()

const emit = defineEmits<{ 'update:modelValue': [boolean], apply: [string[]] }>()
// Блокировка фона, ловушка фокуса, Esc и возврат фокуса — общие для всех диалогов
const panel = ref<HTMLElement | null>(null)
useDialog(toRef(props, 'modelValue'), { panel, onClose: close })


// Вкладки по группам разделов. Сейчас все разделы 1mart — товары,
// поэтому вкладка одна и полоса вкладок скрыта; группы появятся — появятся и вкладки.
const TABS = [
  { value: 'all', label: 'catalog.all' },
] as const

const tab = ref<string>('all')
const search = ref('')
const openedId = ref<Id | null>(null)
const chosen = ref<string[]>([])

// Открывая диалог, показываем то, что уже выбрано на странице
watch(() => props.modelValue, (open) => {
  if (!open) return
  chosen.value = [...(props.selected ?? [])]
  openedId.value = null
  search.value = ''
  tab.value = 'all'
})

const opened = computed(() => props.categories.find(item => item.id === openedId.value) ?? null)

const roots = computed(() => {
  const needle = search.value.trim().toLowerCase()
  return props.categories
    .filter(item => item.children?.length)
    .filter(item => tab.value === 'all' || item.group === tab.value)
    .filter(item => !needle
      || item.title.toLowerCase().includes(needle)
      || item.children!.some(child => child.title.toLowerCase().includes(needle)))
})

const children = computed(() => {
  const needle = search.value.trim().toLowerCase()
  return (opened.value?.children ?? [])
    .filter(child => !needle || child.title.toLowerCase().includes(needle))
})

/** Сколько подкатегорий выбрано внутри раздела — бейдж в строке и на вкладке */
function countIn(category: Category) {
  return (category.children ?? []).filter(child => chosen.value.includes(child.slug)).length
}

function countInTab(value: string) {
  return props.categories
    .filter(item => value === 'all' || item.group === value)
    .reduce((acc, item) => acc + countIn(item), 0)
}

function toggle(slug: string) {
  const index = chosen.value.indexOf(slug)
  if (index === -1) chosen.value.push(slug)
  else chosen.value.splice(index, 1)
}

function clear() {
  chosen.value = []
}

function close() {
  emit('update:modelValue', false)
}

function apply() {
  emit('apply', [...chosen.value])
  close()
}

</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="picker-overlay" @click.self="close">
      <div ref="panel" class="picker" role="dialog" aria-modal="true" :aria-label="$t('catalog.pickCategory')" tabindex="-1">
        <header class="picker__head">
          <button
            v-if="opened"
            type="button"
            class="picker__back"
            :aria-label="$t('common.back')"
            @click="openedId = null"
          >
            <UiIcon name="alt-arrow-right" color="currentColor" :size="20" class="picker__back-icon" />
          </button>

          <h2 class="picker__title">{{ opened ? opened.title : $t('catalog.pickCategory') }}</h2>

          <button type="button" class="picker__clear" @click="clear">{{ $t('common.clear') }}</button>

          <UiCloseButton @click="close" />
        </header>

        <label class="picker__search">
          <UiIcon name="search-normal" :size="20" />
          <input v-model="search" type="search" :placeholder="$t('breadcrumbs.search')" :aria-label="$t('ui.catalog.categoryPickerModal.poiskKategorii')">
        </label>

        <div v-if="!opened && TABS.length > 1" class="picker__tabs" role="tablist">
          <button
            v-for="item in TABS"
            :key="item.value"
            type="button"
            role="tab"
            class="picker__tab"
            :class="{ 'picker__tab--active': tab === item.value }"
            :aria-selected="tab === item.value"
            @click="tab = item.value"
          >
            {{ $t(item.label) }}
            <span v-if="countInTab(item.value)" class="picker__tab-badge">{{ countInTab(item.value) }}</span>
          </button>
        </div>

        <!-- Первый уровень: разделы -->
        <ul v-if="!opened" class="picker__list">
          <li v-for="category in roots" :key="category.id">
            <button type="button" class="picker__row" :class="{ 'picker__row--marked': countIn(category) }" @click="openedId = category.id">
              <img v-if="category.image" :src="category.image" width="40" height="40" alt="" class="picker__thumb">
              <span class="picker__row-title">{{ category.title }}</span>
              <span v-if="countIn(category)" class="picker__row-badge">{{ countIn(category) }}</span>
              <UiIcon name="alt-arrow-right" color="currentColor" :size="18" class="picker__row-chevron" />
            </button>
          </li>

          <li v-if="!roots.length" class="picker__empty">{{ $t('common.notFound') }}</li>
        </ul>

        <!-- Второй уровень: подкатегории с чекбоксами -->
        <ul v-else class="picker__list">
          <li v-for="child in children" :key="child.id">
            <label class="picker__row picker__row--check">
              <span class="picker__row-title">{{ child.title }}</span>
              <input
                type="checkbox"
                class="picker__checkbox"
                :checked="chosen.includes(child.slug)"
                @change="toggle(child.slug)"
              >
            </label>
          </li>

          <li v-if="!children.length" class="picker__empty">{{ $t('common.notFound') }}</li>
        </ul>

        <button type="button" class="picker__apply" @click="apply">{{ $t('common.apply') }}</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.picker-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--overlay-z);
  display: grid;
  place-items: center;
  padding: 40px 20px;
  background: var(--overlay-bg);
}

.picker {
  display: flex;
  flex-direction: column;
  width: 560px;
  /*
   * Предел задаём от окна, а не в процентах: внутри центрирующего грида
   * процент считается от области, которая сама растёт под содержимое,
   * и диалог вырастал выше экрана — кнопка «Применить» уезжала за край
   * и до неё нельзя было дотянуться, фон при этом заблокирован.
   */
  max-height: calc(100dvh - 80px);
  padding: 22px;
  border-radius: var(--dialog-radius);
  background: var(--color-surface);
}

.picker__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.picker__back {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-text);
  cursor: pointer;
}

.picker__back-icon { transform: rotate(180deg); }

.picker__title {
  flex: 1;
  margin: 0;
  font: var(--type-dialog-title);
  color: var(--color-text);
}

.picker__clear {
  height: 36px;
  padding-inline: 16px;
  border: 0;
  border-radius: 12px;
  background: #F2F4F7;
  color: var(--color-text);
  cursor: pointer;
  font: var(--type-button-sm);
}


.picker__search {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  margin-top: 18px;
  padding-inline: 16px;
  border-radius: 14px;
  background: var(--color-field);
}

.picker__search input {
  flex: 1;
  border: 0;
  background: none;
  font: var(--type-input);
  color: var(--input-color);
}

.picker__search input:focus { outline: none; }

.picker__tabs {
  display: flex;
  gap: 4px;
  margin-top: 14px;
  padding: 4px;
  border-radius: 16px;
  background: var(--color-field);
}

.picker__tab {
  position: relative;
  flex: 1;
  height: 42px;
  border: 0;
  border-radius: 13px;
  background: none;
  font-weight: 500;
  font-size: var(--text-md);
  color: var(--color-text);
  cursor: pointer;
}

.picker__tab--active {
  background: var(--color-brand);
  font-weight: 600;
  color: var(--color-on-brand);
}

.picker__tab-badge,
.picker__row-badge {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding-inline: 5px;
  border-radius: 10px;
  background: var(--color-brand);
  font-weight: 600;
  font-size: var(--text-2xs);
  color: var(--color-on-brand);
}

.picker__tab-badge {
  position: absolute;
  top: -6px;
  right: 6px;
}

.picker__tab--active .picker__tab-badge {
  background: var(--color-surface);
  color: var(--color-brand-text);
}

.picker__list {
  flex: 1;
  /* Без этого флекс-элемент не сжимается ниже содержимого и не прокручивается */
  min-height: 0;
  margin: 14px 0 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.picker__row {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 62px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: none;
  text-align: left;
  cursor: pointer;
}

.picker__row:hover { background: #F7F9FC; }

.picker__row--marked {
  border-color: var(--color-brand);
  background: var(--color-brand-tint);
}

.picker__row--check { justify-content: space-between; }

.picker__thumb {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
}

.picker__row-title {
  flex: 1;
  font-weight: 500;
  font-size: var(--text-base);
  line-height: 20px;
  color: var(--color-text);
}

.picker__row-chevron { color: #B6BCC6; }

.picker__checkbox {
  width: 26px;
  height: 26px;
  accent-color: var(--color-brand);
  cursor: pointer;
}

.picker__empty {
  padding: 28px 12px;
  color: var(--color-text-muted);
  text-align: center;
}

.picker__apply {
  margin-top: 16px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.picker__apply:hover { background: #097A24; }
.picker__apply:active { background: #06621D; }
</style>
