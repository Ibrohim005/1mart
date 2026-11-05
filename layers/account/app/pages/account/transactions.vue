<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

/** История транзакций живёт вкладкой внутри «Мои заказы» — как в макете. */
const localePath = useLocalePath()
await navigateTo(localePath('/account/orders?tab=history'), { redirectCode: 302 })
</script>

<template>
  <div />
</template>
