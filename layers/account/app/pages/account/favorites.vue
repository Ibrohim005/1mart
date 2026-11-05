<script setup lang="ts">
/**
 * Избранное. Макет: Избранное (1440×3145) — пустое состояние
 * с иллюстрацией и кнопкой «На главную».
 */
import type { Banner, ProductCard } from '#shared/types/catalog'

const { t } = useI18n()
definePageMeta({ middleware: 'auth' })

const localePath = useLocalePath()
const illustration = '/mock/empty-favorites.png'
/** `lazy` не блокирует переход: сетка открывается со скелетонами карточек */
const { data: items, status } = await useApiData<ProductCard[]>('favorites', '/favorites', { lazy: true })
const { data: recommended, status: recommendedStatus } = await useApiData<ProductCard[]>('favorites:recommended', '/products/shelf', { query: { kind: 'wow', limit: 5 }, lazy: true })
const { data: banners, status: bannersStatus } = await useApiData<Banner[]>('favorites:banners', '/banners', { lazy: true })

useSeoMeta({ title: () => t('ui.account.favorites.seoTitle'), robots: 'noindex, nofollow' })
</script>

<template>
  <div class="favorites">
    <div class="favorites__container">
      <nav class="favorites__breadcrumbs" :aria-label="$t('common.hlebnyeKroshki')">
        <NuxtLink :to="localePath('/')">{{ t('breadcrumbs.home') }}</NuxtLink> / {{ t('breadcrumbs.favorites') }}
      </nav>

      <h1 class="favorites__heading">{{ $t('breadcrumbs.favorites') }}</h1>

      <!-- Пока избранное едет, «здесь пусто» показывать нельзя — там скелетоны -->
      <div v-if="status === 'pending'" class="favorites__grid" aria-busy="true" aria-live="polite">
        <span class="visually-hidden">{{ $t('ui.shared.state.loading') }}</span>
        <UiProductCardSkeleton v-for="n in 5" :key="n" />
      </div>

      <div v-else-if="items?.length" class="favorites__grid">
        <UiProductCard v-for="product in items" :key="product.id" :product="product" favorite />
      </div>

      <div v-else class="favorites__empty">
        <img :src="illustration" alt="" class="favorites__illustration">
        <h2 class="favorites__title">{{ $t('ui.account.favorites.zdesSohranimVashiLyubimye') }}</h2>
        <p class="favorites__text">
          {{ $t('ui.account.favorites.nazhmiteTovarahKotoryeOsobenno') }}
        </p>
        <NuxtLink :to="localePath('/')" class="favorites__button">{{ $t('common.glavnuyu') }}</NuxtLink>
      </div>
    </div>

    <HomePromoBanners
      :banners="[...(banners ?? []), ...(banners ?? [])]"
      :loading="bannersStatus === 'pending'"
    />
    <HomeShelf
      :title="$t('home.wow')"
      :more-link="localePath('/search?kind=wow')"
      :products="recommended ?? []"
      :loading="recommendedStatus === 'pending'"
    />
  </div>
</template>

<style scoped>
.favorites__heading {
  margin: 0 0 20px;
  font: var(--type-page-title);
  color: var(--color-text);
}

.favorites { display: flex; flex-direction: column; }

.favorites__container {
  width: var(--container-width);
  margin-inline: auto;
  padding-bottom: var(--section-gap);
}

.favorites__breadcrumbs {
  padding-block: 24px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.favorites__grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.favorites__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 511px;
  margin-inline: auto;
  padding-block: 52px;
  text-align: center;
}

.favorites__illustration { width: 264.2px; height: 264.2px; object-fit: contain; }

.favorites__title {
  margin: 35.9px 0 0;
  font: var(--type-page-title);
  color: var(--color-text);
}

.favorites__text {
  margin: 6.3px 0 0;
  font-weight: 400;
  font-size: var(--text-xl);
  line-height: 24.4px;
  color: #7C8A94;
}

.favorites__button {
  display: grid;
  place-items: center;
  width: 158px;
  margin-top: 33.9px;
  background: var(--color-brand);
  color: var(--color-on-brand);
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}
</style>
