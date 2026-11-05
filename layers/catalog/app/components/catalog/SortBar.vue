<script setup lang="ts">
/** Шапка выдачи: крупный заголовок, рядом тихое число товаров, справа сортировка. */
import type { SortOption } from '#shared/types/catalog'

defineProps<{
  title: string
  /** Готовая подпись вида «73 товара»; пока выдача едет — не показывается */
  count?: string
}>()

const route = useRoute()
const router = useRouter()
const isOpen = ref(false)
const root = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()

/*
 * Меню закрывается кликом мимо и по Esc. Закрытие по mouseleave убрано: между
 * кнопкой и списком зазор 6 px, и пока мышь шла к пункту, меню успевало исчезнуть.
 */
function closeOnOutside(event: MouseEvent) {
  if (!root.value?.contains(event.target as Node)) isOpen.value = false
}
onMounted(() => document.addEventListener('click', closeOnOutside))
onBeforeUnmount(() => document.removeEventListener('click', closeOnOutside))

/* По Esc фокус возвращается на кнопку, иначе он терялся вместе со скрытым пунктом */
function closeOnEscape() {
  if (!isOpen.value) return
  isOpen.value = false
  trigger.value?.focus()
}

const options: Array<{ value: SortOption, label: string }> = [
  { value: 'popular', label: 'ui.catalog.sortBar.rekomenduemye' },
  { value: 'priceAsc', label: 'ui.catalog.sortBar.snachalaDeshevye' },
  { value: 'priceDesc', label: 'ui.catalog.sortBar.snachalaDorogie' },
  { value: 'rating', label: 'ui.catalog.sortBar.reytingu' },
  { value: 'new', label: 'ui.catalog.sortBar.novinki' },
]

const current = computed(() =>
  options.find(item => item.value === route.query.sort) ?? options[0]!,
)

function choose(value: SortOption) {
  isOpen.value = false
  router.push({ query: { ...route.query, sort: value === 'popular' ? undefined : value } })
}
</script>

<template>
  <header class="sortbar">
    <!-- Число внутри h1: скринридер читает заголовок целиком, как и раньше -->
    <h1 class="sortbar__heading">
      <span class="sortbar__title" :title="title">{{ title }}</span>
      <span v-if="count" class="sortbar__count">{{ count }}</span>
    </h1>

    <div ref="root" class="sortbar__sort" @keydown.esc="closeOnEscape">
      <button
        ref="trigger"
        type="button"
        class="sortbar__button"
        aria-haspopup="true"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        <UiIcon name="sort" :size="18" class="sortbar__icon" />
        <span class="sortbar__label">{{ $t(current.label) }}</span>
        <UiIcon name="alt-arrow-down" :size="16" class="sortbar__chevron" />
      </button>

      <ul v-show="isOpen" class="sortbar__menu">
        <li v-for="option in options" :key="option.value">
          <button
            type="button"
            class="sortbar__option"
            :class="{ 'sortbar__option--active': option.value === current.value }"
            :aria-current="option.value === current.value ? 'true' : undefined"
            @click="choose(option.value)"
          >
            <span>{{ $t(option.label) }}</span>
            <UiIcon v-if="option.value === current.value" name="tick-circle-fill" :size="18" class="sortbar__check" />
          </button>
        </li>
      </ul>
    </div>
  </header>
</template>

<style scoped>
/* Высота задана явно: подпись с числом появляется позже данных, строка не прыгает */
.sortbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 44px;
  margin-bottom: 4px;
}

.sortbar__heading {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
  margin: 0;
}

.sortbar__title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font: var(--type-page-title);
  color: var(--color-text);
}

.sortbar__count {
  flex: none;
  font-family: var(--font-ui);
  font-weight: 400;
  font-size: var(--text-base);
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
}

.sortbar__sort { position: relative; flex: none; }

.sortbar__button {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 220px;
  height: 40px;
  padding-inline: 14px 12px;
  border: 1px solid var(--color-line);
  border-radius: 20px;
  background: var(--color-surface);
  font-family: var(--font-ui);
  font-weight: 500;
  font-size: var(--text-sm);
  line-height: 18px;
  white-space: nowrap;
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.sortbar__button:hover { border-color: var(--color-gray); }
.sortbar__button[aria-expanded='true'] { border-color: var(--color-text); }
.sortbar__button:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.sortbar__icon { flex: none; color: var(--color-text-muted); }
.sortbar__label { flex: 1; text-align: left; }

.sortbar__chevron {
  flex: none;
  color: var(--color-text-muted);
  transition: transform 0.15s ease;
}

.sortbar__button[aria-expanded='true'] .sortbar__chevron { transform: rotate(180deg); }

.sortbar__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 20;
  min-width: 100%;
  margin: 0;
  padding: 6px;
  list-style: none;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: 0 12px 32px -8px rgb(17 17 17 / 16%);
}

.sortbar__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 38px;
  padding: 8px 10px;
  border: 0;
  border-radius: 10px;
  background: none;
  text-align: left;
  font-family: var(--font-ui);
  font-weight: 400;
  font-size: var(--text-sm);
  line-height: 18px;
  white-space: nowrap;
  color: var(--color-text);
  cursor: pointer;
}

.sortbar__option:hover { background: var(--color-page); }
.sortbar__option:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.sortbar__option--active,
.sortbar__option--active:hover {
  background: var(--color-field);
  font-weight: 600;
}

.sortbar__check { flex: none; color: var(--color-brand-text); }

@media (prefers-reduced-motion: reduce) {
  .sortbar__button,
  .sortbar__chevron { transition: none; }
}
</style>
