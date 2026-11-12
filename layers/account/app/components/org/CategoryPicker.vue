<script setup lang="ts">
/**
 * Выбор категорий каталога для отдела или сотрудника. Раздел целиком или
 * отдельные подразделы: отметка раздела открывает все его подразделы,
 * в том числе будущие. Подсказка по ОКЭД отмечает подходящие одним нажатием.
 */
import type { Category } from '#shared/types/catalog'

const props = defineProps<{
  categories: Category[]
  /** Подходящие по ОКЭД компании */
  suggested?: string[]
}>()
const model = defineModel<string[]>({ required: true })

const roots = computed(() => props.categories.filter(root => root.slug !== 'vse'))
const open = ref<Set<string>>(new Set(roots.value.filter(root => model.value.some(slug => slug === root.slug || root.children?.some(child => child.slug === slug))).map(root => root.slug)))

function toggleOpen(slug: string) {
  const next = new Set(open.value)
  if (next.has(slug)) next.delete(slug)
  else next.add(slug)
  open.value = next
}

const isRootOn = (root: Category) => model.value.includes(root.slug)
const isChildOn = (root: Category, child: Category) => isRootOn(root) || model.value.includes(child.slug)
const childCount = (root: Category) => (root.children ?? []).filter(child => isChildOn(root, child)).length

function toggleRoot(root: Category) {
  const own = new Set([root.slug, ...(root.children ?? []).map(child => child.slug)])
  const rest = model.value.filter(slug => !own.has(slug))
  model.value = isRootOn(root) ? rest : [...rest, root.slug]
}

function toggleChild(root: Category, child: Category) {
  if (isRootOn(root)) {
    // Раздел был открыт целиком: снимаем один подраздел — остаются остальные
    const others = (root.children ?? []).filter(item => item.slug !== child.slug).map(item => item.slug)
    model.value = [...model.value.filter(slug => slug !== root.slug), ...others]
    return
  }
  const next = model.value.includes(child.slug) ? model.value.filter(slug => slug !== child.slug) : [...model.value, child.slug]
  // Отмечены все подразделы — это и есть весь раздел
  const all = (root.children ?? []).every(item => next.includes(item.slug))
  model.value = all ? [...next.filter(slug => !(root.children ?? []).some(item => item.slug === slug)), root.slug] : next
}

function applySuggested() {
  model.value = [...new Set([...model.value, ...(props.suggested ?? [])])]
  const next = new Set(open.value)
  for (const root of roots.value) {
    if (root.children?.some(child => props.suggested?.includes(child.slug))) next.add(root.slug)
  }
  open.value = next
}
</script>

<template>
  <div class="picker">
    <div class="picker__head">
      <p class="picker__summary">{{ $t('org.categories.selected', { count: model.length }) }}</p>
      <button v-if="suggested?.length" type="button" class="picker__suggest" @click="applySuggested">
        <UiIcon name="tick-circle" :size="18" color="currentColor" />
        {{ $t('org.categories.applySuggested') }}
      </button>
    </div>

    <ul class="picker__list">
      <li v-for="root in roots" :key="root.slug" class="picker__root">
        <div class="picker__row">
          <label class="picker__check">
            <input type="checkbox" class="visually-hidden" :checked="isRootOn(root)" @change="toggleRoot(root)">
            <span class="picker__box" :class="{ 'picker__box--on': isRootOn(root), 'picker__box--part': !isRootOn(root) && childCount(root) > 0 }" aria-hidden="true">
              <UiIcon v-if="isRootOn(root)" name="tick-square-fill" :size="22" color="currentColor" />
            </span>
            <span class="picker__title">{{ root.title }}</span>
            <span v-if="suggested?.includes(root.slug)" class="picker__badge">{{ $t('org.categories.byOked') }}</span>
          </label>
          <button
            v-if="root.children?.length"
            type="button"
            class="picker__toggle"
            :aria-expanded="open.has(root.slug)"
            :aria-label="$t('org.categories.showSub', { title: root.title })"
            @click="toggleOpen(root.slug)"
          >
            <span class="picker__count">{{ childCount(root) }} / {{ root.children.length }}</span>
            <UiIcon :name="open.has(root.slug) ? 'alt-arrow-up' : 'alt-arrow-down'" :size="18" color="currentColor" />
          </button>
        </div>
        <ul v-if="open.has(root.slug)" class="picker__children">
          <li v-for="child in root.children" :key="child.slug">
            <label class="picker__check picker__check--child">
              <input type="checkbox" class="visually-hidden" :checked="isChildOn(root, child)" @change="toggleChild(root, child)">
              <span class="picker__box" :class="{ 'picker__box--on': isChildOn(root, child) }" aria-hidden="true">
                <UiIcon v-if="isChildOn(root, child)" name="tick-square-fill" :size="22" color="currentColor" />
              </span>
              <span class="picker__title">{{ child.title }}</span>
              <span v-if="suggested?.includes(child.slug)" class="picker__badge">{{ $t('org.categories.byOked') }}</span>
            </label>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.picker { display: flex; flex-direction: column; gap: 10px; }
.picker__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.picker__summary { margin: 0; font: var(--type-label); color: var(--label-color); }
.picker__suggest { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; font: var(--type-button-sm); color: var(--color-brand-text); cursor: pointer; }
.picker__suggest:hover { color: var(--color-brand-text-hover); }

.picker__list { max-height: 340px; margin: 0; padding: 4px; overflow-y: auto; border: 1px solid var(--color-line); border-radius: 10px; list-style: none; }
.picker__root + .picker__root { border-top: 1px solid var(--color-line); }
.picker__row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.picker__check { display: flex; flex: 1; align-items: center; gap: 10px; min-height: 44px; padding: 0 10px; border-radius: 8px; cursor: pointer; }
.picker__check:hover { background: var(--color-field); }
.picker__check:has(:focus-visible) { box-shadow: var(--focus-ring); }
.picker__check--child { min-height: 38px; padding-left: 42px; }
.picker__box { display: grid; flex: none; place-items: center; width: 22px; height: 22px; border: 2px solid var(--color-line); border-radius: 5px; color: var(--color-brand); }
.picker__box--on { border: 0; }
.picker__box--part { border-color: var(--color-brand); background: linear-gradient(var(--color-brand), var(--color-brand)) center / 10px 2px no-repeat; }
.picker__title { font-size: var(--text-base); color: var(--color-text); }
.picker__badge { padding: 2px 8px; border-radius: 6px; background: var(--color-field); font-weight: 500; font-size: var(--text-xs); color: var(--color-brand-text); }
.picker__toggle { display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 10px; border: 0; border-radius: 8px; background: none; font-size: var(--text-sm); color: var(--color-text-muted); cursor: pointer; }
.picker__toggle:hover { background: var(--color-field); }
.picker__toggle:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.picker__count { font-variant-numeric: tabular-nums; }
.picker__children { margin: 0 0 6px; padding: 0; list-style: none; }
</style>
