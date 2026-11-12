<script setup lang="ts">
/**
 * «Рекомендации» — бесконечная лента внизу главной, как у Uzum:
 * сетка по пять карточек и «Показать ещё», догружающая следующую страницу.
 *
 * Отдельного эндпоинта ленты нет — берём общую выдачу GET /search
 * без запроса, по популярности, с постраничкой page/perPage. Первая
 * страница рисуется на сервере (SEO), следующие догружаются в браузере.
 */
import type { ProductCard, SearchResult } from '#shared/types/catalog'

const PER_PAGE = 20

const { t } = useI18n()
const api = useApi()

const { data: first, status, refresh } = await useApiData<SearchResult>('home:recommendations', '/search', {
  query: { page: 1, perPage: PER_PAGE, sort: 'popular' },
  lazy: true,
})

/** Догруженные страницы — поверх первой; первая остаётся из SSR */
const extra = ref<ProductCard[]>([])
const page = ref(1)
const loadingMore = ref(false)
const moreFailed = ref(false)

const items = computed(() => {
  // Один товар может прийти на двух страницах, если выдача сдвинулась
  const seen = new Set<string | number>()
  return [...(first.value?.items ?? []), ...extra.value].filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
})

const total = computed(() => first.value?.total ?? 0)
const hasMore = computed(() => page.value * PER_PAGE < total.value)

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  moreFailed.value = false
  try {
    const next = await api.get<SearchResult>('/search', { page: page.value + 1, perPage: PER_PAGE, sort: 'popular' })
    extra.value.push(...(next?.items ?? []))
    page.value += 1
  }
  catch {
    moreFailed.value = true
  }
  finally {
    loadingMore.value = false
  }
}
</script>

<template>
  <section class="feed">
    <h2 class="feed__title">{{ t('shell.home.recommendations') }}</h2>

    <div v-if="status === 'pending' && !items.length" class="feed__grid" aria-busy="true" aria-live="polite">
      <span class="visually-hidden">{{ t('ui.shared.state.loading') }}</span>
      <UiProductCardSkeleton v-for="n in 10" :key="n" />
    </div>

    <div v-else-if="status === 'error' && !items.length" class="feed__error">
      <p>{{ t('shell.home.loadError') }}</p>
      <UiButton variant="secondary" @click="refresh()">{{ t('shell.home.retry') }}</UiButton>
    </div>

    <template v-else>
      <div class="feed__grid">
        <UiProductCard v-for="product in items" :key="product.id" :product="product" />
        <template v-if="loadingMore">
          <UiProductCardSkeleton v-for="n in 5" :key="`s${n}`" />
        </template>
      </div>

      <div class="feed__footer">
        <p v-if="moreFailed" class="feed__error-text" role="alert">{{ t('shell.home.loadError') }}</p>

        <button
          v-if="hasMore"
          type="button"
          class="feed__more"
          :disabled="loadingMore"
          @click="loadMore"
        >
          {{ moreFailed ? t('shell.home.retry') : t('shell.home.showMore') }}
        </button>

        <p v-else-if="items.length" class="feed__end">{{ t('shell.home.noMore') }}</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.feed {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: var(--container-width);
  margin: 20px auto 0;
}

.feed__title {
  margin: 0;
  font: var(--type-section-title);
  color: var(--color-text);
}

.feed__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px 16px;
}

.feed__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-block: 8px 12px;
}

.feed__more {
  min-width: 320px;
  padding-inline: 32px;
  border: 0;
  background: var(--color-topbar);
  color: var(--color-navy);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.feed__more:hover { background: var(--color-line); }
.feed__more:disabled { opacity: .6; cursor: progress; }

.feed__end,
.feed__error-text {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-gray);
}

.feed__error-text { color: var(--color-danger); }

.feed__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  color: var(--color-gray);
}
</style>
