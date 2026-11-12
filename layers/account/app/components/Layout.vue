<script setup lang="ts">
/**
 * Каркас кабинета: меню 404 слева, контент 820 справа
 * и общие полки внизу — они есть на всех экранах кабинета в макете.
 */
import type { Banner, ProductCard } from '#shared/types/catalog'
const localePath = useLocalePath()
const { t } = useI18n()

defineProps<{ title: string }>()

/** Полки кабинета грузятся не блокируя переход — до ответа на их месте скелетоны */
const { data: viewed, status: viewedStatus } = await useApiData<ProductCard[]>('account:layout-viewed', '/products/shelf', { query: { kind: 'recommended', limit: 5 }, lazy: true })
const { data: wow, status: wowStatus } = await useApiData<ProductCard[]>('account:layout-wow', '/products/shelf', { query: { kind: 'wow', limit: 5 }, lazy: true })
const { data: banners, status: bannersStatus } = await useApiData<Banner[]>('account:layout-banners', '/banners', { lazy: true })

const promoRow = computed(() => {
  const list = banners.value ?? []
  return list.length ? [list[0]!, list[1] ?? list[0]!, list[0]!] : []
})
</script>

<template>
  <div class="account">
    <div class="account__breadcrumbs-wrap">
      <nav class="account__breadcrumbs" :aria-label="$t('common.hlebnyeKroshki')">
        <NuxtLink :to="localePath('/')">{{ t('breadcrumbs.home') }}</NuxtLink> / {{ title }}
      </nav>
    </div>

    <div class="account__container">
      <AccountMenu class="sticky-aside" />

      <div class="account__content">
        <h1 class="account__title">{{ title }}</h1>
        <slot />
      </div>
    </div>

    <HomeShelf :title="$t('home.viewed')" :products="viewed ?? []" :loading="viewedStatus === 'pending'" />
    <HomePromoBanners :banners="promoRow" :loading="bannersStatus === 'pending'" />
    <HomeShelf :title="$t('home.wow')" :products="wow ?? []" :loading="wowStatus === 'pending'" />
  </div>
</template>

<style scoped>
.account { display: flex; flex-direction: column; }

.account__breadcrumbs-wrap {
  width: var(--container-width);
  margin-inline: auto;
}

.account__breadcrumbs {
  padding-top: 24px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/*
 * Колонки сразу под крошками, как на остальных страницах витрины (корзина,
 * оформление): 24 px. Прежние 76 px из макета оставляли пустую полосу.
 */
.account__container {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  width: var(--container-width);
  margin-inline: auto;
  padding-block: 24px 52px;
}

.account__content { width: 820px; }

.account__title {
  margin: 0 0 16px;
  font: var(--type-page-title);
  color: var(--color-text);
}
</style>
