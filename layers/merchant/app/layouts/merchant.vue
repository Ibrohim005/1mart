<script setup lang="ts">
// Каркас кабинета: фиксированная боковая панель + верхняя полоса + контент.
// Ширина как у витрины — макет десктопный (body min-width 1440 из @zoo/shared).
// Контент мягко «проявляется» при каждом переходе — ключ по пути перезапускает
// анимацию (уважает prefers-reduced-motion, см. business.css).
const route = useRoute()
</script>

<template>
  <div class="mlayout">
    <MSidebar class="mlayout__aside" />
    <div class="mlayout__body">
      <MTopbar class="mlayout__top" />
      <main id="main" class="mlayout__content">
        <div :key="route.path" class="m-enter">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.mlayout {
  display: grid;
  grid-template-columns: 264px 1fr;
  min-height: 100vh;
  background: var(--m-page);
}

.mlayout__aside {
  position: sticky;
  top: 0;
  align-self: start;
  height: 100vh;
}

.mlayout__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.mlayout__top {
  position: sticky;
  top: 0;
  z-index: 40;
}

.mlayout__content {
  flex: 1;
  padding: 28px 32px 56px;
}
</style>
