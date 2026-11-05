<script setup lang="ts">
// Корень приложения. Макет страницы выбирается через definePageMeta({ layout })
// на самих страницах: 'merchant' для кабинета, 'landing'/'auth' снаружи.
const { locale } = useI18n()
useHead({
  htmlAttrs: { lang: locale },
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.png' },
    { rel: 'apple-touch-icon', href: '/favicon.png' },
  ],
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UiToasts />
  </div>
</template>
