<script setup lang="ts">
/** Сетка выдачи. Макет категории: 3 колонки, карточка 286.7, зазор 12/20. */
import type { ProductCard } from '#shared/types/catalog'

defineProps<{ products: ProductCard[], columns?: number }>()
</script>

<template>
  <div class="grid" :style="{ '--columns': columns ?? 3 }">
    <UiProductCard v-for="product in products" :key="product.id" :product="product" />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  column-gap: 12px;
  row-gap: 20px;
}

/*
 * В каталоге карточка крупнее, чем на полках главной: макет Ca даёт 287×638
 * против 239×532 на Home — та же карточка, увеличенная в 1.199 раза.
 * Масштаб задаётся одним числом, остальные длины карточки от него производные.
 */
.grid :deep(.card) { --u: 1.199px; }
</style>
