<script setup lang="ts">
/**
 * Все отзывы товара. Отдельного макета нет — собрано на компонентах проекта:
 * карточка отзыва как в ленте под товаром, диалог из UiModal.
 * Открывается по «Все ›» и по клику на фотографию покупателя.
 */
import type { ReviewPreview } from '#shared/types/catalog'

const props = defineProps<{
  modelValue: boolean
  reviews: ReviewPreview[]
  /** Открыть сразу на нужном отзыве — когда пришли с фотографии */
  focusId?: number | null
}>()

const emit = defineEmits<{ 'update:modelValue': [boolean], photo: [{ review: ReviewPreview, index: number }] }>()

const list = ref<HTMLElement | null>(null)

// Пришли с фотографии — подкручиваем к нужному отзыву
watch(() => [props.modelValue, props.focusId], async ([open]) => {
  if (!open || !props.focusId) return
  await nextTick()
  list.value?.querySelector(`[data-review="${props.focusId}"]`)?.scrollIntoView({ block: 'start' })
})
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('ui.pdp.reviews.allTitle')"
    body-padding="20px 25px 28px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div ref="list" class="all">
      <article
        v-for="review in reviews"
        :key="review.id"
        :data-review="review.id"
        class="all__item"
        :class="{ 'all__item--focused': review.id === focusId }"
      >
        <header class="all__head">
          <span class="all__author">{{ review.author }}</span>
          <span class="all__stars" :aria-label="$t('ui.pdp.reviews.ratingOf5', { rating: review.rating })">
            <UiIcon
              v-for="n in 5"
              :key="n"
              :name="n <= Math.round(review.rating) ? 'star-fill' : 'star'"
              :size="17"
              color="#FF9F0A"
            />
          </span>
        </header>

        <p class="all__date">{{ review.date }}</p>
        <p class="all__text">{{ review.text }}</p>
        <div v-if="review.reply" class="all__reply">
          <p class="all__reply-title">{{ $t('ui.pdp.reviews.sellerReply') }} · {{ review.reply.date }}</p>
          <p class="all__reply-text">{{ review.reply.text }}</p>
        </div>

        <div v-if="review.photos?.length" class="all__photos">
          <button
            v-for="(photo, index) in review.photos"
            :key="photo"
            type="button"
            class="all__photo"
            :aria-label="$t('ui.pdp.reviews.openPhoto')"
            @click="emit('photo', { review, index })"
          >
            <UiImage :src="photo" alt="" width="130" height="75" />
          </button>
        </div>
      </article>
    </div>
  </UiModal>
</template>

<style scoped>
.all {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 60vh;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.all__item {
  padding: 16px 18px;
  border-radius: 18px;
  background: var(--color-page);
}

.all__item--focused { outline: 2px solid var(--color-brand); outline-offset: -2px; }

.all__head {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.all__author {
  font-weight: 700;
  font-size: var(--text-2xl);
  line-height: 24px;
  color: var(--color-text);
}

.all__stars { display: inline-flex; gap: 2px; }

.all__date {
  margin: 4px 0 0;
  font-size: var(--text-md);
  color: var(--color-text-muted);
}

.all__reply { margin-top: 10px; padding: 10px 12px; border-radius: 12px; background: var(--color-page); }
.all__reply-title { margin: 0 0 4px; font-weight: 600; font-size: var(--text-sm); color: var(--color-text); }
.all__reply-text { margin: 0; font-size: var(--text-md); line-height: 22px; color: var(--color-text-muted); }

.all__text {
  margin: 10px 0 0;
  font-size: var(--text-lg);
  line-height: 24px;
  color: var(--color-text);
}

.all__photos { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }

.all__photo {
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: none;
  cursor: zoom-in;
  overflow: hidden;
  line-height: 0;
}

.all__photo img { width: 130px; height: 75px; object-fit: cover; }
</style>
