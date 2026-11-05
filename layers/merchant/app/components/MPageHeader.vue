<script setup lang="ts">
/** Шапка страницы кабинета: заголовок, подзаголовок и слот действий справа. */
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="mpagehead">
    <div class="mpagehead__text">
      <h1 class="mpagehead__title">{{ title }}</h1>
      <p v-if="subtitle" class="mpagehead__sub">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="mpagehead__actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.mpagehead {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}
.mpagehead__title { margin: 0; font-family: var(--font-display); font-weight: 700; font-size: var(--text-9xl); letter-spacing: -0.025em; color: var(--m-ink); }
.mpagehead__sub { margin: 7px 0 0; font-size: var(--text-md); color: var(--m-slate); }
.mpagehead__actions { display: flex; align-items: center; gap: 12px; }
</style>
