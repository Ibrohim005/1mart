<script setup lang="ts">
/**
 * Страница категории. Макет Ca (1440×4000):
 * контейнер 1240, сайдбар 345, выдача 874.4, зазор 10.
 */
import type { Banner, Category, ProductCard, SearchResult } from '#shared/types/catalog'
const { t } = useI18n()

const localePath = useLocalePath()
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const router = useRouter()

/**
 * Сколько карточек показано. В макете каталога их шесть — две строки по три;
 * пагинации нет, поэтому остальное было недостижимо. Первый экран оставляем
 * макетным, дальше догружаем по кнопке.
 */
/**
 * Фильтры в адресе — всё, кроме вкладки и сортировки. Раньше страница
 * всегда писала «по фильтрам ничего не найдено» и показывала «Сбросить
 * фильтры», даже когда фильтров не было вовсе: в пустой категории кнопка
 * просто ничего не делала.
 */
// Перечисляем исключения, а не фильтры: фасеты приходят из реестра и
// пополняются из админки, поэтому список имён фильтров устаревал молча —
// отфильтровав по окрасу, покупатель видел подсказку про «написание запроса»
// и не получал кнопку сброса. См. тот же разбор в search.vue.
const NON_FILTER_KEYS = new Set(['q', 'sort', 'group', 'kind', 'page', 'limit'])
const hasFilters = computed(() =>
  Object.entries(route.query).some(([key, value]) => !NON_FILTER_KEYS.has(key) && value),
)

/** Сброс фильтров из пустого состояния: чистим всё, кроме вкладки и сортировки */
function resetFilters() {
  const { group, sort } = route.query
  router.replace({ query: { ...(group ? { group } : {}), ...(sort ? { sort } : {}) } })
}

const PAGE_SIZE = 6
const shown = ref(PAGE_SIZE)

const { data, refresh, status } = await useApiData<SearchResult>(
  `category:${slug.value}`,
  '/search',
  {
    // Все параметры из адреса уходят в запрос: фильтры задаются
    // сайдбаром и должны сужать выдачу, а не только менять ссылку
    query: () => ({
      ...route.query,
      categorySlug: slug.value,
      page: 1,
      perPage: shown.value,
      sort: route.query.sort ?? 'popular',
    }),
  },
)

const hasMore = computed(() => (data.value?.total ?? 0) > (data.value?.items?.length ?? 0))

function showMore() {
  shown.value += PAGE_SIZE
  refresh()
}

// Выдача перезапрашивается при смене сортировки, фильтров или страницы
watch(() => route.query, () => {
  shown.value = PAGE_SIZE
  refresh()
})

const { data: viewed, status: viewedStatus } = await useApiData<ProductCard[]>('category:viewed', '/products/shelf', { query: { kind: 'recommended', limit: 5 }, lazy: true })
const { data: wow, status: wowStatus } = await useApiData<ProductCard[]>('category:wow', '/products/shelf', { query: { kind: 'wow', limit: 5 }, lazy: true })
const { data: banners, status: bannersStatus } = await useApiData<Banner[]>('category:banners', '/banners', { lazy: true })

// `categories` is a two-level tree (see categoryList() in the adapter) - a
// bare .find() only checked the top level, so every subcategory page (the
// vast majority of the catalog: smartphones, dresses, sneakers, ...) 404'd
// even though the product listing itself already resolves the slug fine via
// categoryBySlug()'s own recursive walk.
function findCategory(nodes: Category[], target: string): Category | undefined {
  for (const node of nodes) {
    // Сверяемся и с чужими слагами: переключение языка сохраняет путь, так что
    // на `/ru/category/smartfonlar` приходит узбекский слаг, а `node.slug` здесь уже
    // русский. Без этого страница отдавала «Такой страницы нет» на категорию,
    // товары которой адаптер в том же ответе уже нашёл.
    if (node.slug === target || node.slugs?.includes(target)) return node
    const found = findCategory(node.children ?? [], target)
    if (found) return found
  }
  return undefined
}

const category = computed(() => findCategory(data.value?.categories ?? [], slug.value))

// Несуществующая категория должна отдавать 404, а не весь каталог
if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: t('ui.catalog.categoryItem.notFound'), fatal: true })
}
const title = computed(() => category.value?.title ?? t('catalog.category'))

// В макете в ряду ровно три баннера
const promoRow = computed(() => {
  const list = banners.value ?? []
  return list.length ? [list[0]!, list[1] ?? list[0]!, list[0]!] : []
})

useSeoMeta({
  title: () => t('seo.categoryTitle', { title: title.value }),
  description: () => t('seo.categoryDescription', { title: title.value, count: data.value?.total ?? 0 }),
})

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: t('breadcrumbs.home'), item: '/' },
      { name: title.value },
    ],
  }),
  // Список товаров категории: без него поисковик видит только крошки
  defineItemList({
    itemListElement: (data.value?.items ?? []).map(item => ({
      name: item.title,
      url: `/product/${item.slug}`,
    })),
  }),
])
</script>

<template>
  <div class="category">
    <div class="category__container">
      <!-- Крошки были только в разметке для поисковика, на экране их не было -->
      <nav class="category__breadcrumbs" :aria-label="$t('common.hlebnyeKroshki')">
        <NuxtLink :to="localePath('/')">{{ t('breadcrumbs.home') }}</NuxtLink> / {{ title }}
      </nav>

      <div class="category__layout">
        <div class="category__sidebar sticky-aside">
          <CatalogFilterPanel
            :filters="data?.filters ?? []"
            :category-title="title"
            :categories="data?.categories ?? []"
          />
        </div>

        <div class="category__content">
          <CatalogSortBar
            :title="title"
            :count="data ? $t('catalog.productsCount', data.total ?? 0, { named: { count: data.total ?? 0 } }) : undefined"
          />
          <UiState
            :status="status"
            :empty="!data?.items.length"
            :skeletons="6"
            :empty-title="hasFilters ? $t('catalog.emptyFiltersTitle') : $t('catalog.emptyCategoryTitle')"
            :empty-text="hasFilters ? $t('catalog.emptyFiltersText') : $t('catalog.emptyCategoryText')"
            empty-illustration="/mock/empty-filters.svg"
            :reset-label="hasFilters ? $t('catalog.resetFilters') : undefined"
            class="category__grid"
            style="--columns: 3"
            @retry="refresh()"
            @reset="resetFilters"
          >
            <CatalogProductGrid :products="data?.items ?? []" :columns="3" class="category__grid" />

            <button v-if="hasMore" type="button" class="category__more" @click="showMore">
              {{ $t('common.pokazatEsche') }}
            </button>
          </UiState>
        </div>
      </div>
    </div>

    <HomePromoBanners :banners="promoRow" :loading="bannersStatus === 'pending'" />
    <HomeShelf :title="$t('home.viewed')" :more-link="localePath('/search?kind=recommended')" :products="viewed ?? []" :loading="viewedStatus === 'pending'" />
    <HomeShelf :title="$t('home.wow')" :more-link="localePath('/search?kind=wow')" :products="wow ?? []" :loading="wowStatus === 'pending'" />
  </div>
</template>

<style scoped>
.category__breadcrumbs {
  padding-block: 24px 20px;
  font-weight: 400;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* Кнопка догрузки повторяет «Показать» из сайдбара (макет Ca, Button 345×60 r=13.6) */
.category__more {
  display: block;
  width: 100%;
  margin-top: 20px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.category { display: flex; flex-direction: column; }

.category__container {
  width: var(--container-width);
  margin-inline: auto;
  padding-block: 34px var(--section-gap);
}

.category__layout { display: flex; gap: 10px; align-items: flex-start; }

.category__sidebar {
  display: flex;
  flex-direction: column;
  gap: 21.8px;
  width: 345px;
}

.category__content { width: 874.4px; }
.category__grid { margin-top: 20px; }
</style>
