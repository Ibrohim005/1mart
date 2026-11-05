<script setup lang="ts">
/** Постраничная навигация. v-model:page; показывает диапазон и стрелки. */
const props = defineProps<{
  page: number
  perPage: number
  total: number
}>()
const emit = defineEmits<{ 'update:page': [number] }>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
const from = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.perPage + 1))
const to = computed(() => Math.min(props.total, props.page * props.perPage))

function go(p: number) {
  if (p >= 1 && p <= totalPages.value && p !== props.page) emit('update:page', p)
}

/** Короткий ряд номеров вокруг текущей страницы. */
const pages = computed(() => {
  const span = 2
  const start = Math.max(1, props.page - span)
  const end = Math.min(totalPages.value, props.page + span)
  const list: number[] = []
  for (let i = start; i <= end; i++) list.push(i)
  return list
})
</script>

<template>
  <div v-if="total > perPage" class="mpag">
    <span class="mpag__info">{{ $t('m.pagination.range', { from, to, total }) }}</span>
    <div class="mpag__nav">
      <button type="button" class="mpag__btn" :aria-label="$t('m.pagination.prev')" :disabled="page <= 1" @click="go(page - 1)">
        <UiIcon name="alt-arrow-right" :size="16" class="mpag__prev" />
      </button>
      <button v-if="pages[0]! > 1" type="button" class="mpag__btn" @click="go(1)">1</button>
      <span v-if="pages[0]! > 2" class="mpag__dots">…</span>
      <button
        v-for="p in pages"
        :key="p"
        type="button"
        class="mpag__btn"
        :class="{ 'mpag__btn--active': p === page }"
        @click="go(p)"
      >{{ p }}</button>
      <span v-if="pages[pages.length - 1]! < totalPages - 1" class="mpag__dots">…</span>
      <button v-if="pages[pages.length - 1]! < totalPages" type="button" class="mpag__btn" @click="go(totalPages)">{{ totalPages }}</button>
      <button type="button" class="mpag__btn" :aria-label="$t('m.pagination.next')" :disabled="page >= totalPages" @click="go(page + 1)">
        <UiIcon name="alt-arrow-right" :size="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.mpag { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 4px 0; }
.mpag__info { font-size: var(--text-sm); color: var(--m-slate); font-variant-numeric: tabular-nums; }
.mpag__nav { display: flex; align-items: center; gap: 6px; }
.mpag__btn {
  display: grid;
  min-width: 36px;
  height: 36px;
  padding-inline: 8px;
  border: 1px solid var(--m-line);
  border-radius: var(--m-radius-sm);
  background: var(--m-surface);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--m-ink-soft);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  place-items: center;
  transition: background var(--m-dur-fast) var(--m-ease), border-color var(--m-dur-fast) var(--m-ease);
}
.mpag__btn:hover:not(:disabled) { background: var(--m-surface-sunken); border-color: var(--m-line-strong); }
.mpag__btn:disabled { opacity: 0.4; cursor: default; }
.mpag__btn--active { border-color: transparent; background: var(--m-brand-gradient); color: var(--m-on-brand); box-shadow: var(--m-shadow-brand); }
.mpag__prev { transform: rotate(180deg); }
.mpag__dots { color: var(--m-slate-soft); }
</style>
