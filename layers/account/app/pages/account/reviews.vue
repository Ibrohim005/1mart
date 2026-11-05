<script setup lang="ts">
/**
 * «Мои отзывы». Макет: Мои заказы (5058:105209) —
 * табы 816×60 и сетка карточек 404.5×155.9 r16.2:
 * фото 110.9×143.2 r8.5, название Inter 400 20.8 и пять звёзд 28.8 с шагом 38.
 */
import type { Id, ProductCard } from '#shared/types/catalog'

const { t } = useI18n()

definePageMeta({ middleware: 'auth' })

const tab = ref('waiting')
/** `lazy` не блокирует переход: сетка открывается со скелетонами карточек */
const { data: products, status } = await useApiData<ProductCard[]>('account:reviews', '/products/shelf', { query: { kind: 'recommended', limit: 4 }, lazy: true })

const items = computed(() => (tab.value === 'waiting' ? products.value ?? [] : []))
const openReview = ref(false)

// Оценка прямо в списке: подсвечиваем звёзды и открываем форму отзыва.
// Ключ — id товара: от мока он приходит числом, от бэкенда — UUID
const picked = reactive<Record<Id, number>>({})
const hovered = reactive<Record<Id, number>>({})

function rate(productId: Id, value: number) {
  picked[productId] = value
  openReview.value = true
}

useSeoMeta({ title: () => t('ui.account.reviews.seoTitle'), robots: 'noindex, nofollow' })
</script>

<template>
  <AccountLayout :title="$t('account.reviews')">
    <AccountTabs
      v-model="tab"
      :tabs="[{ value: 'waiting', label: $t('account.reviewsWaiting') }, { value: 'done', label: $t('account.reviewsDone') }]"
      class="reviews__tabs"
    />

    <!-- Карточка 404.5×155.9 r16.2 с фото 110.9×143.2 r8.5 — размеры из макета -->
    <div v-if="status === 'pending'" class="reviews__grid" aria-busy="true" aria-live="polite">
      <span class="visually-hidden">{{ $t('ui.shared.state.loading') }}</span>
      <article v-for="n in 4" :key="n" class="reviews__card">
        <UiSkeleton width="110.9px" height="143.2px" radius="8.5px" />
        <div class="reviews__body">
          <UiSkeleton width="90%" height="18px" />
          <UiSkeleton width="60%" height="18px" class="reviews__skeleton-line" />
          <UiSkeleton width="180px" height="28.8px" class="reviews__skeleton-stars" />
        </div>
      </article>
    </div>

    <div v-else-if="items.length" class="reviews__grid">
      <article v-for="product in items" :key="product.id" class="reviews__card">
        <UiImage :src="product.image" :alt="product.title" width="111" height="143" class="reviews__image" />

        <div class="reviews__body">
          <p class="reviews__title">{{ product.title }}</p>

          <div class="reviews__stars">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              class="reviews__star"
              :aria-label="$t('ui.account.reviews.rateStars', { rating: n })"
              @click="rate(product.id, n)"
              @mouseenter="hovered[product.id] = n"
              @mouseleave="hovered[product.id] = 0"
            >
              <UiIcon
                :name="(hovered[product.id] || picked[product.id] || 0) >= n ? 'star-fill' : 'star'"
                :size="28.8"
                :color="(hovered[product.id] || picked[product.id] || 0) >= n ? '#FF9F0A' : 'var(--color-gray)'"
              />
            </button>
          </div>
        </div>
      </article>
    </div>

    <AccountEmptyState
      v-else
      :title="$t('ui.account.reviews.dannyyMomentNetVybrannyh')"
      :text="$t('ui.account.reviews.zdesPoyavyatsyaTovaryKotorye')"
      illustration="/mock/empty-favorites.png"
    />

    <LazyAppReviewModal v-model="openReview" @submit="openReview = false" />
  </AccountLayout>
</template>

<style scoped>
.reviews__tabs { margin-bottom: 20px; }

.reviews__skeleton-line { margin-top: 8px; }
.reviews__skeleton-stars { margin-top: 20px; }

.reviews__grid {
  display: grid;
  grid-template-columns: repeat(2, 404.5px);
  gap: 11.6px;
}

.reviews__card {
  display: flex;
  gap: 11.6px;
  height: 155.9px;
  padding: 6.4px 5.8px;
  border-radius: 16.2px;
  background: var(--color-surface);
}

.reviews__image {
  flex: 0 0 110.9px;
  width: 110.9px;
  height: 143.2px;
  border-radius: 8.5px;
  object-fit: cover;
}

.reviews__body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 17.3px;
  width: 270.4px;
}

.reviews__title {
  margin: 0;
  font-weight: 400;
  font-size: var(--text-2xl);
  line-height: 26.6px;
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reviews__stars { display: flex; gap: 9.2px; }

.reviews__star {
  display: grid;
  place-items: center;
  flex: 0 0 28.8px;
  width: 28.8px;
  height: 28.8px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}
</style>
