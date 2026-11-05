<script setup lang="ts">
/**
 * Кнопка закрытия диалога — единственный вариант на весь проект.
 * Размеры и цвета берутся из токенов (--close-*), чтобы крестик
 * выглядел одинаково во всех окнах.
 */
defineProps<{ label?: string }>()
defineEmits<{ click: [MouseEvent] }>()
</script>

<template>
  <button type="button" class="close" :aria-label="label ?? $t('common.close')" @click="$emit('click', $event)">
    <UiIcon name="close" color="currentColor" :size="18.5" />
  </button>
</template>

<style scoped>
.close {
  display: grid;
  place-items: center;
  flex: 0 0 var(--close-size);
  width: var(--close-size);
  height: var(--close-size);
  border: 0;
  border-radius: 50%;
  background: var(--close-bg);
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.15s ease;
}

.close:hover { background: var(--close-bg-hover); }
.close:focus-visible { outline: none; box-shadow: var(--focus-ring); }
</style>
