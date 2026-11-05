<script setup lang="ts">
/** Выпадающий список с подписью. */
defineProps<{
  label?: string
  options: { value: string, label: string }[]
  placeholder?: string
  error?: string
  disabled?: boolean
}>()
const model = defineModel<string>()
const id = useId()
</script>

<template>
  <label class="msel" :for="id">
    <span v-if="label" class="msel__label">{{ label }}</span>
    <span class="msel__control" :class="{ 'msel__control--error': error }">
      <select :id="id" v-model="model" :disabled="disabled" class="msel__input">
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <UiIcon name="alt-arrow-down" :size="16" class="msel__chev" />
    </span>
    <span v-if="error" class="msel__error">{{ error }}</span>
  </label>
</template>

<style scoped>
.msel { display: flex; flex-direction: column; gap: 7px; }
.msel__label { font-size: var(--text-sm); font-weight: 500; color: var(--m-ink-soft); }
.msel__control {
  position: relative;
  display: flex;
  align-items: center;
  height: var(--field-height);
  border: 1px solid var(--m-line-strong);
  border-radius: var(--m-radius);
  background: var(--m-surface);
  transition: border-color var(--m-dur-fast) var(--m-ease), box-shadow var(--m-dur-fast) var(--m-ease);
}
.msel__control:focus-within { border-color: var(--m-brand); box-shadow: var(--m-brand-ring); }
.msel__control--error { border-color: var(--m-danger); }
.msel__input {
  width: 100%;
  height: 100%;
  padding-inline: 14px 38px;
  border: 0;
  border-radius: var(--m-radius);
  background: none;
  font-family: var(--font-ui);
  font-size: var(--text-md);
  color: var(--m-ink);
  outline: none;
  appearance: none;
  cursor: pointer;
}
.msel__chev { position: absolute; right: 14px; color: var(--m-slate-soft); pointer-events: none; }
.msel__error { font-size: var(--text-xs); color: var(--m-danger-fg); }
</style>
