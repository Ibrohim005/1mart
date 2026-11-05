<script setup lang="ts">
import type { Banner, Category, ProductCard } from '#shared/types/catalog'
const { t } = useI18n()
// Ссылки «Смотреть все» на полках — с учётом языка
const localePath = useLocalePath()

/*
 * Данные главной грузятся на сервере: контент должен быть в HTML для поисковиков.
 * `lazy` на это не влияет — при рендере на сервере запрос всё равно дожидается,
 * флаг снимает блокировку только при переходе внутри сайта: страница открывается
 * сразу со скелетонами, а не висит на старой до ответа.
 */
const { data: banners, status: bannersStatus } = await useApiData<Banner[]>('home:banners', '/banners', { query: { placement: 'shop_carousel' }, lazy: true })
// Независимый набор: своя площадка в бэкенде (SHOP_PLATFORM), свои картинки,
// свои ссылки. Раньше этот ряд рисовал те же баннеры, что и карусель выше,
// только обрезанными — третья плитка при этом всегда дублировала первую.
const { data: promoBanners, status: promoBannersStatus } = await useApiData<Banner[]>('home:promoBanners', '/banners', { query: { placement: 'shop_platform' }, lazy: true })
const { data: categories, status: categoriesStatus } = await useApiData<Category[]>('home:categories', '/categories/root', { lazy: true })
// Полки — только виды, которые есть в API: discounts | recommended | wow.
// «Хиты продаж» — это recommended, «Новинки» — wow.
const { data: discounts, status: discountsStatus } = await useApiData<ProductCard[]>('home:discounts', '/products/shelf', { query: { kind: 'discounts', limit: 5 }, lazy: true })
const { data: recommended, status: recommendedStatus } = await useApiData<ProductCard[]>('home:recommended', '/products/shelf', { query: { kind: 'recommended', limit: 10 }, lazy: true })
const { data: wow, status: wowStatus } = await useApiData<ProductCard[]>('home:wow', '/products/shelf', { query: { kind: 'wow', limit: 5 }, lazy: true })

useSeoMeta({
  // Имя бренда добавляет titleTemplate — в заголовке оно было дважды
  title: () => t('seo.homeTitle'),
  description: () => t('seo.homeDescription'),
  ogType: 'website',
})

// Разметка для Google: организация + поиск по сайту прямо в выдаче
useSchemaOrg([
  defineWebSite({
    name: '1mart',
    potentialAction: {
      '@type': 'SearchAction',
      'target': 'https://market.paylov.uz/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }),
])
</script>

<template>
  <!--
    Порядок блоков как у Uzum Market: баннер → категории → скидки недели →
    хиты → пара промо-баннеров → новинки → бесконечные рекомендации →
    приложение.
  -->
  <div class="home">
    <!-- Заголовка в макете нет, но h1 нужен скринридеру и поисковику -->
    <h1 class="visually-hidden">{{ $t('shell.home.title') }}</h1>

    <div class="home__hero">
      <HomeHeroCarousel :banners="banners ?? []" :loading="bannersStatus === 'pending'" />
      <HomeHeroAside />
    </div>

    <section class="home__categories">
      <CatalogCategoryStrip :categories="categories ?? []" :loading="categoriesStatus === 'pending'" />
    </section>

    <HomeShelf
      :title="$t('shell.home.weeklyDiscounts')"
      :more-link="localePath('/search?kind=discounts')"
      :products="discounts ?? []"
      :loading="discountsStatus === 'pending'"
      countdown
      accent
    />

    <HomeShelf
      :title="$t('shell.home.bestsellers')"
      :more-link="localePath('/search?kind=recommended')"
      :products="recommended ?? []"
      :loading="recommendedStatus === 'pending'"
      :skeletons="10"
    />

    <HomePromoBanners :banners="promoBanners ?? []" :loading="promoBannersStatus === 'pending'" />

    <HomeShelf
      :title="$t('shell.home.newArrivals')"
      :more-link="localePath('/search?kind=wow')"
      :products="wow ?? []"
      :loading="wowStatus === 'pending'"
    />

    <HomeRecommendations />

  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  /* Главная — на белом, как у Uzum; фон остальных страниц не трогаем */
  padding-bottom: 48px;
  background: var(--color-surface);
}

/* Карусель и плитки одной высоты: её задаёт сама карусель */
.home__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: 12px;
  width: var(--container-width);
  margin: 20px auto 8px;
}

.home__categories { padding-block: 20px 12px; }
</style>
