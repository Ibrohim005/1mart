<script setup lang="ts">
/**
 * Поверхность-карточка кабинета. Глубину (тень), радиус и линии берёт из
 * business.css — единая шкала на весь кабинет, ничего «на глаз».
 * `hover` поднимает карточку при наведении (для кликабельных плиток).
 */
withDefaults(defineProps<{
  title?: string
  /** Убрать внутренние отступы (например, под таблицу во всю ширину) */
  flush?: boolean
  /** Приподнимать карточку при наведении */
  hover?: boolean
}>(), { flush: false, hover: false })
</script>

<template>
  <section class="mcard" :class="{ 'mcard--hover': hover }">
    <header v-if="title || $slots.header || $slots.actions" class="mcard__head">
      <slot name="header">
        <h2 v-if="title" class="mcard__title">{{ title }}</h2>
      </slot>
      <div v-if="$slots.actions" class="mcard__actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="mcard__body" :class="{ 'mcard__body--flush': flush }">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.mcard {
  border: 1px solid var(--m-line);
  border-radius: var(--m-radius-lg);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-sm);
  transition: box-shadow var(--m-dur) var(--m-ease), transform var(--m-dur) var(--m-ease);
}
.mcard--hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--m-shadow-md);
}
.mcard__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--m-line-soft);
}
.mcard__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-lg);
  letter-spacing: -0.01em;
  color: var(--m-ink);
}
.mcard__actions { display: flex; align-items: center; gap: 10px; }
.mcard__body { padding: 22px; }
.mcard__body--flush { padding: 0; }
</style>
