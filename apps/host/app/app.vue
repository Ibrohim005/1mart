<script setup lang="ts">
/**
 * Корень приложения. Здесь же объявляются языковые метатеги:
 * lang на <html>, canonical и alternate hreflang для ru/uz.
 * Без этого поисковик считает /uz/ дублем русской версии.
 */
const head = useLocaleHead()

/**
 * Картинка для шаринга по умолчанию. Своя есть только у карточки товара,
 * остальные страницы уходили в мессенджеры и соцсети без превью.
 * Страница со своим og:image это значение перебивает.
 */
useSeoMeta({
  ogImage: '/og-image.png',
  // Без размеров мессенджеры и соцсети иногда не показывают превью вовсе:
  // им нужно знать пропорции до загрузки картинки
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/png',
})

/** Иконки вкладки, экрана «на рабочий стол» и цвет строки браузера */
useHead({
  link: [
    { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/icon-32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icons/icon-16.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest' },
  ],
  meta: [
    { name: 'theme-color', content: '#2CDD41' },
    { name: 'apple-mobile-web-app-title', content: '1mart' },
  ],
})

useHead(() => ({
  htmlAttrs: head.value.htmlAttrs,
  link: head.value.link,
  meta: head.value.meta,
}))
</script>

<template>
  <!--
    Полоса загрузки поверх шапки. Страницы приходят с сервера уже с данными,
    поэтому скелетоны видны только при догрузке в браузере; при переходе между
    страницами нужен отдельный отклик, иначе клик выглядит как «ничего не
    произошло».
  -->
  <NuxtLoadingIndicator color="#2CDD41" :height="3" :throttle="0" />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
