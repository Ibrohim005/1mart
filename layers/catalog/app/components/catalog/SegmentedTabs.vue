<script setup lang="ts">
/** Переключатель вкладок сайдбара. Макет: Segmented Control 345×60, r13.6. */
const props = defineProps<{ tabs: Array<{ value: string, label: string }>, modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="tabs">
    <button
      v-for="tab in props.tabs"
      :key="tab.value"
      type="button"
      class="tabs__item"
      :class="{ 'tabs__item--active': tab.value === props.modelValue }"
      @click="emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  height: 60px;
  padding: 1.9px;
  border-radius: 13.6px;
  background: var(--color-surface);
}

.tabs__item {
  border: 0;
  border-radius: 13.6px;
  background: none;
  font-weight: 700;
  font-size: var(--text-sm);
  line-height: 18.9px;
  color: #27383F;
  cursor: pointer;
}

.tabs__item--active { background: var(--color-brand); color: var(--color-on-brand); }
</style>
