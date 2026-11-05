<script setup lang="ts">
/** Поле ввода с подписью, подсказкой и ошибкой. Опциональная иконка слева. */
withDefaults(defineProps<{
  label?: string
  type?: string
  placeholder?: string
  hint?: string
  error?: string
  icon?: string
  required?: boolean
  disabled?: boolean
  inputmode?: 'text' | 'numeric' | 'tel' | 'email' | 'search'
}>(), { type: 'text' })

const model = defineModel<string | number>()
const id = useId()
</script>

<template>
  <label class="mfield" :for="id">
    <span v-if="label" class="mfield__label">
      {{ label }}<span v-if="required" class="mfield__req">*</span>
    </span>
    <span class="mfield__control" :class="{ 'mfield__control--icon': icon, 'mfield__control--error': error }">
      <UiIcon v-if="icon" :name="icon" :size="18" class="mfield__icon" />
      <input
        :id="id"
        v-model="model"
        :type="type"
        :inputmode="inputmode"
        :placeholder="placeholder"
        :disabled="disabled"
        class="mfield__input"
      >
    </span>
    <span v-if="error" class="mfield__error">{{ error }}</span>
    <span v-else-if="hint" class="mfield__hint">{{ hint }}</span>
  </label>
</template>

<style scoped>
.mfield { display: flex; flex-direction: column; gap: 7px; }
.mfield__label { font-size: var(--text-sm); font-weight: 500; color: var(--m-ink-soft); }
.mfield__req { margin-left: 2px; color: var(--m-danger); }
.mfield__control {
  display: flex;
  align-items: center;
  height: var(--field-height);
  padding-inline: 14px;
  border: 1px solid var(--m-line-strong);
  border-radius: var(--m-radius);
  background: var(--m-surface);
  transition: border-color var(--m-dur-fast) var(--m-ease), box-shadow var(--m-dur-fast) var(--m-ease);
}
.mfield__control:focus-within { border-color: var(--m-brand); box-shadow: var(--m-brand-ring); }
.mfield__control--error { border-color: var(--m-danger); }
.mfield__control--error:focus-within { box-shadow: 0 0 0 4px rgb(229 72 77 / 14%); }
.mfield__icon { margin-right: 10px; color: var(--m-slate-soft); }
.mfield__input {
  width: 100%;
  border: 0;
  background: none;
  font-family: var(--font-ui);
  font-size: var(--text-md);
  color: var(--m-ink);
  outline: none;
}
.mfield__input::placeholder { color: var(--m-slate-soft); }
.mfield__input:disabled { color: var(--m-slate-soft); }
.mfield__hint { font-size: var(--text-xs); color: var(--m-slate); }
.mfield__error { font-size: var(--text-xs); color: var(--m-danger-fg); }
</style>
