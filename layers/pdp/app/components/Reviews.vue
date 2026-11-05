<script setup lang="ts">
/** Блок отзывов. Макет: reviews-card 740×263.4, r25. */
import type { ReviewPreview } from '#shared/types/catalog'

const props = defineProps<{
  count: number
  photos: string[]
  reviews: ReviewPreview[]
}>()

// Лента отзывов прокручивается по кнопке-стрелке справа
const list = ref<HTMLElement | null>(null)
function next() {
  list.value?.scrollBy({ left: 360, behavior: 'smooth' })
}

/** Стрелку прячем, когда лента домотана до конца */
const atEnd = ref(false)
function onScroll() {
  const node = list.value
  if (!node) return
  atEnd.value = node.scrollLeft + node.clientWidth >= node.scrollWidth - 8
}

/**
 * Лента фотографий собирается из снимков самих отзывов — поэтому по клику
 * открывается именно тот отзыв, к которому относится фотография.
 * Если снимки пришли отдельным списком (старый контракт), берём его.
 */
const gallery = computed(() => {
  const fromReviews = props.reviews.flatMap(review =>
    (review.photos ?? []).map(src => ({ src, review })),
  )
  if (fromReviews.length) return fromReviews
  return props.photos.map(src => ({ src, review: props.reviews[0]! })).filter(item => item.review)
})

const allOpen = ref(false)
const photoOpen = ref(false)
const photoIndex = ref(0)
const focusId = ref<number | null>(null)

function openPhoto(index: number) {
  photoIndex.value = index
  photoOpen.value = true
}

function openAll() {
  focusId.value = null
  allOpen.value = true
}

/** Из списка всех отзывов можно открыть снимок крупно */
function openPhotoFromList(payload: { review: { id: number }, index: number }) {
  const position = gallery.value.findIndex(item => item.review.id === payload.review.id)
  openPhoto(position === -1 ? 0 : position + payload.index)
}
</script>

<template>
  <section id="reviews" class="reviews">
    <header class="reviews__header">
      <h2 class="reviews__title">{{ $t('ui.pdp.reviews.reviewsCount', { count, word: $t('common.otzyv', count) }) }}</h2>
      <button type="button" class="reviews__all" @click="openAll">{{ $t('ui.pdp.reviews.vse') }}</button>
    </header>

    <div v-if="gallery.length" class="reviews__photos">
      <button
        v-for="(item, index) in gallery"
        :key="item.src + index"
        type="button"
        class="reviews__photo-button"
        :aria-label="$t('ui.pdp.reviews.openPhotoOf', { author: item.review.author })"
        @click="openPhoto(index)"
      >
        <UiImage :src="item.src" alt="" width="130" height="75" class="reviews__photo" />
      </button>
    </div>

    <div id="reviews" ref="list" class="reviews__list scroll-x" @scroll="onScroll">
      <article v-for="review in reviews" :key="review.id" class="reviews__item">
        <div class="reviews__user">
          <span class="reviews__author">{{ review.author }}</span>
          <span class="reviews__stars" :aria-label="$t('ui.pdp.reviews.ratingOf5', { rating: review.rating })">
            <UiIcon
              v-for="n in 5"
              :key="n"
              :name="n <= Math.round(review.rating) ? 'star-fill' : 'star'"
              :size="17"
              color="#FF9F0A"
            />
          </span>
        </div>
        <p class="reviews__date">{{ review.date }}</p>
        <p class="reviews__text">{{ review.text }}</p>
        <p v-if="review.reply" class="reviews__reply">
          <b>{{ $t('ui.pdp.reviews.sellerReply') }}:</b> {{ review.reply.text }}
        </p>
      </article>

    </div>

    <button v-show="!atEnd" type="button" class="reviews__next" :aria-label="$t('ui.pdp.reviews.sleduyuschieOtzyvy')" @click="next"><UiIcon name="alt-arrow-right" color="currentColor" :size="18" /></button>

    <LazyPdpReviewsModal
      v-model="allOpen"
      :reviews="reviews"
      :focus-id="focusId"
      @photo="openPhotoFromList"
    />

    <LazyPdpReviewPhotoModal v-model="photoOpen" :items="gallery" :start-index="photoIndex" />
  </section>
</template>

<style scoped>
.reviews { scroll-margin-top: var(--sticky-top); }

.reviews__photo-button {
  padding: 0;
  border: 0;
  background: none;
  cursor: zoom-in;
  line-height: 0;
}

.reviews {
  position: relative;
  padding: 20px;
  border-radius: 25px;
  background: var(--color-surface);
}

.reviews__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 27px;
}

.reviews__title {
  margin: 0;
  font: var(--type-section-title);
  color: var(--color-text);
}

.reviews__all {
  padding: 0;
  border: 0;
  background: none;
  font-weight: 400;
  font-size: var(--text-base);
  line-height: 19.4px;
  color: #90949C;
  cursor: pointer;
}

.reviews__all:hover { color: var(--color-text); }

.reviews__photos {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 13px;
  margin-top: 15px;
}

.reviews__photo {
  width: 100%;
  height: 74.5px;
  border-radius: 9.4px;
  object-fit: cover;
}

/* Лента отзывов прокручивается вбок — колесом, свайпом или стрелкой */
.reviews__list {
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 352px;
  gap: 20px;
  margin-top: 18px;
  padding-right: 56px;
  overflow-x: auto;
  scroll-snap-type: x proximity;
}

/* Карточка отзыва крупнее макета: в исходнике текст был 10px и не читался */
.reviews__item {
  scroll-snap-align: start;
  padding: 16px 18px;
  border-radius: 14px;
  background: #F2F4F7;
}

.reviews__user { display: flex; align-items: center; justify-content: space-between; }

.reviews__author {
  font-weight: 600;
  font-size: var(--text-base);
  line-height: 20px;
  color: #111111;
}

.reviews__stars { display: flex; gap: 3px; }

.reviews__date {
  margin: 3px 0 0;
  font-size: var(--text-xs);
  line-height: 18px;
  color: #90949C;
}

.reviews__reply {
  margin: 10px 0 0;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--color-page);
  font-size: var(--text-sm);
  line-height: 19px;
  color: var(--color-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reviews__reply b { font-weight: 600; color: var(--color-text); }

.reviews__text {
  margin: 12px 0 0;
  font-weight: 400;
  font-size: var(--text-md);
  line-height: 21px;
  color: #111111;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reviews__next {
  position: absolute;
  top: 50%;
  right: 0;
  display: grid;
  place-items: center;
  width: 30.3px;
  height: 30.3px;
  border: 0;
  border-radius: 50%;
  background: var(--color-surface);
  box-shadow: 0 2px 8px rgb(17 17 17 / 8%);
  transform: translateY(-50%);
  cursor: pointer;
}
</style>
