<script setup lang="ts">
/**
 * Переключатель разделов кабинета. Макет: Segmented Control 816×60, r11.8.
 *
 * Это набор вкладок, и объявлять его надо вкладками: раньше здесь были просто
 * кнопки без ролей — скринридер не сообщал, сколько разделов и какой открыт,
 * а стрелками между ними было не перейти.
 */
const props = defineProps<{ tabs: Array<{ value: string, label: string }>, modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const items = ref<HTMLButtonElement[]>([])

function select(value: string) {
  emit('update:modelValue', value)
}

/** Стрелки, Home и End — как этого ждут от вкладок */
function onKey(event: KeyboardEvent, index: number) {
  const last = props.tabs.length - 1
  const next = {
    ArrowRight: index === last ? 0 : index + 1,
    ArrowLeft: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  }[event.key]

  if (next === undefined) return

  event.preventDefault()
  select(props.tabs[next]!.value)
  items.value[next]?.focus()
}
</script>

<template>
  <div class="tabs" role="tablist" :style="{ '--count': tabs.length }">
    <button
      v-for="(tab, index) in tabs"
      :key="tab.value"
      ref="items"
      type="button"
      role="tab"
      class="tabs__item"
      :class="{ 'tabs__item--active': tab.value === modelValue }"
      :aria-selected="tab.value === modelValue"
      :tabindex="tab.value === modelValue ? 0 : -1"
      @click="select(tab.value)"
      @keydown="onKey($event, index)"
    >{{ $t(tab.label) }}</button>
  </div>
</template>

<style scoped>
.tabs {
  display: grid;
  grid-template-columns: repeat(var(--count), 1fr);
  height: 60px;
  padding: 1.6px;
  border-radius: 11.8px;
  background: var(--color-surface);
}

.tabs__item {
  border: 0;
  border-radius: 11.8px;
  background: none;
  color: #27383F;
  cursor: pointer;
  font: var(--type-button);
}

.tabs__item--active { background: var(--color-brand); color: var(--color-on-brand); }
</style>
