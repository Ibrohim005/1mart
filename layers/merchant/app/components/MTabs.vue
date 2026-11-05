<script setup lang="ts">
/** Вкладки-переключатели. v-model — значение активной вкладки. */
defineProps<{
  tabs: { value: string, label: string, count?: number }[]
}>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="mtabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="model === tab.value"
      class="mtabs__tab"
      :class="{ 'mtabs__tab--active': model === tab.value }"
      @click="model = tab.value"
    >
      {{ tab.label }}
      <span v-if="tab.count !== undefined" class="mtabs__count">{{ tab.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.mtabs { display: inline-flex; gap: 4px; padding: 4px; border-radius: var(--m-radius); background: var(--m-surface-sunken); }
.mtabs__tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding-inline: 16px;
  border: 0;
  border-radius: var(--m-radius-sm);
  background: none;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--m-slate);
  cursor: pointer;
  transition: color var(--m-dur-fast) var(--m-ease), background var(--m-dur-fast) var(--m-ease);
}
.mtabs__tab:hover { color: var(--m-ink-soft); }
.mtabs__tab--active { background: var(--m-surface); font-weight: 600; color: var(--m-ink); box-shadow: var(--m-shadow-sm); }
.mtabs__count {
  min-width: 20px;
  padding-inline: 6px;
  border-radius: var(--m-radius-pill);
  background: var(--m-line);
  font-size: var(--text-2xs);
  font-variant-numeric: tabular-nums;
  line-height: 18px;
  text-align: center;
}
.mtabs__tab--active .mtabs__count { background: var(--m-brand-tint); color: var(--m-brand-strong); }
</style>
