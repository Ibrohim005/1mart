<script setup lang="ts">
/** Многострочное поле. */
withDefaults(defineProps<{
  label?: string
  placeholder?: string
  rows?: number
  error?: string
}>(), { rows: 4 })
const model = defineModel<string>()
const id = useId()
</script>

<template>
  <label class="mta" :for="id">
    <span v-if="label" class="mta__label">{{ label }}</span>
    <textarea
      :id="id"
      v-model="model"
      :rows="rows"
      :placeholder="placeholder"
      class="mta__input"
      :class="{ 'mta__input--error': error }"
    />
    <span v-if="error" class="mta__error">{{ error }}</span>
  </label>
</template>

<style scoped>
.mta { display: flex; flex-direction: column; gap: 7px; }
.mta__label { font-size: var(--text-sm); font-weight: 500; color: var(--m-ink-soft); }
.mta__input {
  padding: 12px 14px;
  border: 1px solid var(--m-line-strong);
  border-radius: var(--m-radius);
  background: var(--m-surface);
  font-family: var(--font-ui);
  font-size: var(--text-md);
  color: var(--m-ink);
  outline: none;
  resize: vertical;
  transition: border-color var(--m-dur-fast) var(--m-ease), box-shadow var(--m-dur-fast) var(--m-ease);
}
.mta__input:focus { border-color: var(--m-brand); box-shadow: var(--m-brand-ring); }
.mta__input--error { border-color: var(--m-danger); }
.mta__error { font-size: var(--text-xs); color: var(--m-danger-fg); }
</style>
