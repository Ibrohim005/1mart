<script setup lang="ts">
/**
 * Кнопка проекта. Три вида из макета:
 * primary — зелёная заливка, secondary — серая, ghost — без фона.
 * Размеры берутся из токенов --control-*, поэтому кнопки во всех
 * диалогах и на страницах совпадают по высоте и скруглению.
 */
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'lg'
  block?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
}>(), { variant: 'primary', size: 'md', type: 'button' })

defineEmits<{ click: [MouseEvent] }>()
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block }]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-grid;
  grid-auto-flow: column;
  gap: 8px;
  place-items: center;
  padding-inline: 24px;
  border: 0;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.btn--lg {

}

.btn--block { display: grid; width: 100%; }

.btn--primary { background: var(--color-brand); color: var(--color-on-brand); }
.btn--primary:hover { background: var(--color-brand-dark); }
.btn--primary:active { background: var(--color-brand-darker); }

.btn--secondary { background: #F2F4F7; color: var(--color-text); }
.btn--secondary:hover { background: #E7EBF1; }
.btn--secondary:active { background: #DDE2EA; }

.btn--ghost { background: none; color: var(--color-brand-text); }
.btn--ghost:hover { text-decoration: underline; }

.btn:disabled { opacity: 0.5; cursor: default; }
.btn:focus-visible { outline: none; box-shadow: var(--focus-ring); }
</style>
