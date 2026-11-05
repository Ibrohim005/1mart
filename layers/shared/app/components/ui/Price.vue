<script setup lang="ts">
import type { Money } from '#shared/types/catalog'

const props = defineProps<{
  price: Money
  fullPrice?: Money | null
  size?: 'sm' | 'md' | 'lg'
}>()

const { money } = useMoney()
const formatted = computed(() => money(props.price))
const formattedFull = computed(() => (props.fullPrice ? money(props.fullPrice) : null))
</script>

<template>
  <div class="price" :class="`price--${size ?? 'md'}`">
    <span class="price__current">{{ formatted }}</span>
    <s v-if="formattedFull" class="price__full">{{ formattedFull }}</s>
  </div>
</template>

<style scoped>
.price { display: flex; align-items: baseline; gap: var(--space-2); }
.price__current { font-weight: var(--font-weight-bold); }
.price__full { color: var(--color-text-tertiary); font-size: var(--font-size-sm); }
.price--sm .price__current { font-size: var(--font-size-md); }
.price--md .price__current { font-size: var(--font-size-lg); }
.price--lg .price__current { font-size: var(--font-size-2xl); }
</style>
