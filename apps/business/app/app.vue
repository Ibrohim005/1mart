<script setup lang="ts">
// Корень приложения. Макет страницы выбирается через definePageMeta({ layout })
// на самих страницах: 'merchant' для кабинета, 'landing'/'auth' снаружи.
const { locale } = useI18n()
useHead({
  htmlAttrs: { lang: locale },
  link: [
    { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
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
