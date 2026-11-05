<script setup lang="ts">
/** Корень кабинета ведёт на заказы. */
definePageMeta({ middleware: 'auth' })
const localePath = useLocalePath()
await navigateTo(localePath('/account/orders'), { replace: true })
</script>

<template>
  <div />
</template>
