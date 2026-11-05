<script setup lang="ts">
/**
 * Заготовка под загружающийся блок. Сама по себе — просто прямоугольник
 * с бегущим бликом; из таких собираются скелетоны конкретных карточек.
 *
 * Анимацию отключаем при `prefers-reduced-motion` — бегущий блик
 * на весь экран укачивает.
 */
withDefaults(defineProps<{
  width?: string
  height?: string
  radius?: string
  circle?: boolean
  /** На цветной подложке (баннер, полка «Скидки недели») серый не виден */
  onDark?: boolean
}>(), {
  width: '100%',
  height: '1em',
  radius: '8px',
})
</script>

<template>
  <span
    class="skeleton"
    :class="{ 'skeleton--circle': circle, 'skeleton--on-dark': onDark }"
    :style="{ width, height, borderRadius: circle ? '50%' : radius }"
    aria-hidden="true"
  />
</template>

<style scoped>
.skeleton {
  display: block;
  flex: none;
  background: linear-gradient(
    90deg,
    var(--skeleton-base) 25%,
    var(--skeleton-shine) 37%,
    var(--skeleton-base) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

/* Полупрозрачный белый: ложится на любой градиент баннера, не выбиваясь плашкой */
.skeleton--on-dark {
  background: linear-gradient(
    90deg,
    rgb(255 255 255 / 14%) 25%,
    rgb(255 255 255 / 26%) 37%,
    rgb(255 255 255 / 14%) 63%
  );
  background-size: 400% 100%;
}

@keyframes skeleton-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
</style>
