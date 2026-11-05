<script setup lang="ts">
/**
 * Результаты поиска. Раскладка та же, что у категории (макет Ca):
 * контейнер 1240, сайдбар с фильтрами 345, выдача 874.4, зазор 10.
 */
import type { Banner, ProductCard, SearchResult } from '#shared/types/catalog'
const { t } = useI18n()

const route = useRoute()
const localePath = useLocalePath()
const query = computed(() => String(route.query.q ?? ''))

/**
 * Сколько карточек показано. Пагинации в макете нет, но без догрузки часть
 * выдачи была недостижима: бэкенд отдавал 30 товаров, на экран попадали 24.
 */
const PAGE_SIZE = 24
const shown = ref(PAGE_SIZE)

const { data, refresh, status } = await useApiData<SearchResult>('search', '/search', {
  query: () => ({
    ...route.query,
    q: query.value,
    sort: route.query.sort ?? 'popular',
    perPage: shown.value,
  }),
})

/*
 * Фильтры в адресе — всё, КРОМЕ запроса, сортировки и вкладки.
 *
 * Перечисляем не фильтры, а исключения. Раньше здесь был список из
 * одиннадцати имён, и фасеты из реестра (color, memory,
 * size) в него не входили: отфильтровав по окрасу и не найдя
 * ничего, покупатель читал «проверьте написание запроса» — хотя никакого
 * запроса не вводил, — и кнопки «сбросить фильтры» ему не предлагали.
 * Реестр пополняется из админки, так что любой новый фасет иначе снова
 * оказался бы забыт.
 */
const NON_FILTER_KEYS = new Set(['q', 'sort', 'group', 'kind', 'page', 'limit', 'exact'])
const hasFilters = computed(() =>
  Object.entries(route.query).some(([key, value]) => !NON_FILTER_KEYS.has(key) && value),
)

const router = useRouter()
function resetFilters() {
  const { q, sort, group, kind } = route.query
  router.replace({ query: { ...(q ? { q } : {}), ...(sort ? { sort } : {}), ...(group ? { group } : {}), ...(kind ? { kind } : {}) } })
}

/**
 * Пустая выдача без фильтров: бэкенд отдаёт фасеты всего каталога, и 76 брендов
 * рядом с «ничего не найдено» обещают то, чего нет — любой выбор снова даст пусто.
 */
const panelFilters = computed(() =>
  !data.value?.items.length && !hasFilters.value ? [] : data.value?.filters ?? [],
)

const hasMore = computed(() => (data.value?.total ?? 0) > (data.value?.items?.length ?? 0))

function showMore() {
  shown.value += PAGE_SIZE
  refresh()
}

// Выдача перезапрашивается при смене запроса, сортировки и фильтров
watch(() => route.query, () => {
  shown.value = PAGE_SIZE
  refresh()
})

const { data: wow, status: wowStatus } = await useApiData<ProductCard[]>('search:wow', '/products/shelf', { query: { kind: 'wow', limit: 5 }, lazy: true })
const { data: banners, status: bannersStatus } = await useApiData<Banner[]>('search:banners', '/banners', { lazy: true })

const promoRow = computed(() => {
  const list = banners.value ?? []
  return list.length ? [list[0]!, list[1] ?? list[0]!, list[0]!] : []
})

/** «Смотреть все» с полок главной ведёт сюда: заголовок называет ту же подборку */
const KIND_TITLES: Record<string, string> = {
  discounts: 'shell.home.weeklyDiscounts',
  recommended: 'shell.home.bestsellers',
  wow: 'home.wow',
}
const kindTitle = computed(() => KIND_TITLES[String(route.query.kind ?? '')])
const allProducts = computed(() => t('ui.catalog.search.allProducts'))
const heading = computed(() => {
  if (query.value) return `«${query.value}»`
  return kindTitle.value ? t(kindTitle.value) : allProducts.value
})

/**
 * Поиск прощает опечатки и забытую раскладку. Когда он что-то исправил,
 * это нужно сказать вслух и оставить возможность искать ровно как набрано —
 * иначе непонятно, почему по «xt[jk» показаны чехлы.
 */
const correctedTo = computed(() => data.value?.correctedTo ?? null)
const suggestion = computed(() => data.value?.suggestion ?? null)

function searchFor(value: string, exact = false) {
  const { exact: _drop, ...rest } = route.query
  return localePath({
    path: '/search',
    query: { ...rest, q: value, ...(exact ? { exact: '1' } : {}) },
  })
}

useSeoMeta({
  title: () => (query.value ? t('seo.searchTitle', { query: query.value }) : heading.value),
  robots: 'noindex, follow',
})
</script>

<template>
  <div class="search">
    <div class="search__container">
      <nav class="search__breadcrumbs" :aria-label="$t('common.hlebnyeKroshki')">
        <NuxtLink :to="localePath('/')">{{ t('breadcrumbs.home') }}</NuxtLink> / {{ t('breadcrumbs.search') }}
      </nav>

      <div class="search__layout">
        <aside class="search__sidebar sticky-aside">
          <CatalogFilterPanel
            :filters="panelFilters"
            :category-title="allProducts"
            :categories="data?.categories ?? []"
          />
        </aside>

        <div class="search__content">
          <CatalogSortBar
            :title="heading"
            :count="data ? $t('catalog.productsCount', data.total ?? 0, { named: { count: data.total ?? 0 } }) : undefined"
          />

          <p v-if="correctedTo" class="search__corrected">
            {{ $t('catalog.correctedNotice', { query: correctedTo }) }}
            <NuxtLink :to="searchFor(query, true)" class="search__corrected-link">
              {{ $t('catalog.correctedOriginal', { query }) }}
            </NuxtLink>
          </p>

          <UiState
            :status="status"
            :empty="!data?.items.length"
            :skeletons="6"
            :empty-title="hasFilters ? $t('catalog.emptyFiltersTitle') : $t('catalog.emptyTitle')"
            :empty-text="hasFilters ? $t('catalog.emptyFiltersText') : $t('catalog.emptyText')"
            empty-illustration="/mock/empty-filters.svg"
            :reset-label="hasFilters ? $t('catalog.resetFilters') : undefined"
            class="search__grid"
            style="--columns: 3"
            @retry="refresh()"
            @reset="resetFilters"
          >
            <template #empty-extra>
              <p v-if="suggestion" class="search__suggestion">
                {{ $t('catalog.didYouMean') }}
                <NuxtLink :to="searchFor(suggestion)" class="search__suggestion-link">«{{ suggestion }}»</NuxtLink>
              </p>
            </template>

            <CatalogProductGrid :products="data?.items ?? []" :columns="3" class="search__grid" />

            <button v-if="hasMore" type="button" class="search__more" @click="showMore">
              {{ $t('common.pokazatEsche') }}
            </button>
          </UiState>
        </div>
      </div>
    </div>

    <HomePromoBanners :banners="promoRow" :loading="bannersStatus === 'pending'" />
    <HomeShelf :title="$t('home.wow')" :more-link="localePath('/search?kind=wow')" :products="wow ?? []" :loading="wowStatus === 'pending'" />
  </div>
</template>

<style scoped>
/* Строка про исправленный запрос — над выдачей, тем же ритмом, что сортировка */
.search__corrected {
  margin: 12px 0 14px;
  font-size: var(--text-xl);
  color: var(--color-text-muted);
}

.search__corrected-link,
.search__suggestion-link {
  color: var(--color-brand-text);
  text-decoration: none;
}

.search__corrected-link:hover,
.search__suggestion-link:hover { text-decoration: underline; }

.search__suggestion {
  margin: 0 0 18px;
  font-size: var(--text-3xl);
  color: var(--color-text);
}

/* Кнопка догрузки повторяет «Показать» из сайдбара (макет Ca, Button 345×60 r=13.6) */
.search__more {
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

.search { display: flex; flex-direction: column; }

.search__container {
  width: var(--container-width);
  margin-inline: auto;
  padding-block: 34px var(--section-gap);
}

.search__breadcrumbs {
  padding-block: 24px 20px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.search__layout { display: flex; gap: 10px; align-items: flex-start; }

.search__sidebar {
  display: flex;
  flex-direction: column;
  gap: 21.8px;
  width: 345px;
}

.search__content { width: 874.4px; }
.search__grid { margin-top: 20px; }
</style>
