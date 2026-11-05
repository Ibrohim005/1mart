<script setup lang="ts">
/**
 * Фотография покупателя крупно и отзыв, к которому она относится.
 * Собрано как лайтбокс галереи товара: затемнение, крестик на снимке,
 * стрелки по краям и счётчик снизу.
 */
import type { ReviewPreview } from '#shared/types/catalog'

const props = defineProps<{
  modelValue: boolean
  /** Все снимки покупателей подряд, чтобы листать не выходя из окна */
  items: Array<{ src: string, review: ReviewPreview }>
  startIndex: number
}>()

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const index = ref(props.startIndex)
watch(() => props.startIndex, value => (index.value = value))

const current = computed(() => props.items[index.value])

function close() {
  emit('update:modelValue', false)
}

function step(delta: number) {
  const total = props.items.length
  if (!total) return
  index.value = (index.value + delta + total) % total
}

const panel = ref<HTMLElement | null>(null)
useDialog(toRef(props, 'modelValue'), { panel, onClose: close })

function onKey(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') step(-1)
  if (event.key === 'ArrowRight') step(1)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue && current" class="lightbox" @click.self="close" @keydown="onKey">
      <div ref="panel" class="lightbox__panel" role="dialog" aria-modal="true" :aria-label="$t('ui.pdp.reviews.photoDialog')" tabindex="-1">
        <figure class="lightbox__figure">
          <!-- fit="inside": IPX по умолчанию режет кадр под width×height — фото отзыва показываем целиком -->
          <UiImage :src="current.src" alt="" width="900" height="900" fit="inside" class="lightbox__image" />

          <button type="button" class="lightbox__close" :aria-label="$t('common.close')" @click.stop="close">
            <UiIcon name="close" color="#FFFFFF" :size="22" />
          </button>

          <button v-if="items.length > 1" type="button" class="lightbox__arrow lightbox__arrow--prev" :aria-label="$t('ui.pdp.gallery.predyduscheeFoto')" @click.stop="step(-1)">
            <UiIcon name="alt-arrow-right" color="#FFFFFF" :size="22" class="lightbox__flip" />
          </button>

          <button v-if="items.length > 1" type="button" class="lightbox__arrow lightbox__arrow--next" :aria-label="$t('ui.pdp.gallery.sleduyuscheeFoto')" @click.stop="step(1)">
            <UiIcon name="alt-arrow-right" color="#FFFFFF" :size="22" />
          </button>

          <figcaption class="lightbox__counter">{{ index + 1 }} / {{ items.length }}</figcaption>
        </figure>

        <article class="lightbox__review">
          <header class="lightbox__head">
            <span class="lightbox__author">{{ current.review.author }}</span>
            <span class="lightbox__stars" :aria-label="$t('ui.pdp.reviews.ratingOf5', { rating: current.review.rating })">
              <UiIcon
                v-for="n in 5"
                :key="n"
                :name="n <= Math.round(current.review.rating) ? 'star-fill' : 'star'"
                :size="17"
                color="#FF9F0A"
              />
            </span>
          </header>
          <p class="lightbox__date">{{ current.review.date }}</p>
          <p class="lightbox__text">{{ current.review.text }}</p>
        </article>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 48px 32px;
  background: rgb(15 20 28 / 92%);
  backdrop-filter: blur(6px);
  cursor: zoom-out;
}

.lightbox__panel {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  max-width: 100%;
  cursor: default;
}

.lightbox__figure {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
  margin: 0;
  border-radius: 18px;
  background: var(--color-surface);
  line-height: 0;
  overflow: hidden;
}

.lightbox__image {
  display: block;
  width: auto;
  height: auto;
  max-width: min(720px, calc(100vw - 540px));
  max-height: calc(100vh - 140px);
  object-fit: contain;
}

/* Крестик на самом снимке, а не в углу экрана */
.lightbox__close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: rgb(0 0 0 / 45%);
  cursor: pointer;
}

.lightbox__close:hover { background: rgb(0 0 0 / 65%); }

.lightbox__arrow {
  position: absolute;
  top: 50%;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 50%;
  background: rgb(0 0 0 / 45%);
  transform: translateY(-50%);
  cursor: pointer;
}

.lightbox__arrow--prev { left: 16px; }
.lightbox__arrow--next { right: 16px; }
.lightbox__arrow:hover { background: rgb(0 0 0 / 65%); }
.lightbox__flip { transform: rotate(180deg); }

.lightbox__counter {
  position: absolute;
  bottom: 16px;
  left: 50%;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgb(0 0 0 / 45%);
  font-weight: 600;
  font-size: var(--text-sm);
  line-height: 20px;
  color: #FFFFFF;
  transform: translateX(-50%);
}

.lightbox__review {
  flex: 0 0 380px;
  width: 380px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  padding: 24px;
  border-radius: 25px;
  background: var(--color-surface);
}

.lightbox__head {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.lightbox__author {
  font-weight: 700;
  font-size: var(--text-3xl);
  line-height: 26px;
  color: var(--color-text);
}

.lightbox__stars { display: inline-flex; gap: 2px; }

.lightbox__date {
  margin: 6px 0 0;
  font-size: var(--text-md);
  color: var(--color-text-muted);
}

.lightbox__text {
  margin: 14px 0 0;
  font-size: var(--text-lg);
  line-height: 25px;
  color: var(--color-text);
}
</style>
