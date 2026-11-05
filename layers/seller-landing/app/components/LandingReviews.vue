<script setup lang="ts">
// Истории продавцов: белый контейнер и горизонтальная карусель, выступающая за его края.
// Истории — заглушки: заменить на реальных продавцов, имена и фото условные.
const stories = [
  { key: 'r1', img: '/landing/hero-1.jpg', tone: 'mesh', focus: '50% 10%' },
  { key: 'r2', img: '/landing/hero-2.jpg', tone: 'dark', focus: '62% 20%' },
  { key: 'r3', img: '/landing/hero-3.jpg', tone: 'tint', focus: '50% 10%' },
  { key: 'r4', img: '/landing/hero-4.jpg', tone: 'warm', focus: '50% 20%' },
]

const track = ref<HTMLElement | null>(null)
const canPrev = ref(false)
const canNext = ref(true)

// Стрелки гаснут на краях; состояние считается от реальной прокрутки дорожки.
function sync() {
  const el = track.value
  if (!el)
    return
  canPrev.value = el.scrollLeft > 4
  canNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

function move(direction: number) {
  const el = track.value
  const first = el?.firstElementChild as HTMLElement | null | undefined
  if (!el || !first)
    return
  const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: direction * (first.offsetWidth + gap), behavior: still ? 'auto' : 'smooth' })
}

onMounted(() => {
  sync()
  window.addEventListener('resize', sync)
})
onBeforeUnmount(() => window.removeEventListener('resize', sync))
</script>

<template>
  <section id="reviews" class="stories">
    <div class="stories__box">
      <div class="stories__head">
        <h2 class="stories__title">{{ $t('landing.reviews.title') }}</h2>

        <div class="stories__arrows">
          <button type="button" class="stories__arrow" :disabled="!canPrev" :aria-label="$t('landing.reviews.prev')" @click="move(-1)">
            <UiIcon name="arrow-left" :size="20" />
          </button>
          <button type="button" class="stories__arrow" :disabled="!canNext" :aria-label="$t('landing.reviews.next')" @click="move(1)">
            <UiIcon name="arrow-right" :size="20" />
          </button>
        </div>
      </div>

      <div ref="track" class="stories__track" @scroll.passive="sync">
        <article v-for="s in stories" :key="s.key" class="story" :class="`story--${s.tone}`">
          <div class="story__body">
            <UiIcon name="quote-up" :size="30" class="story__quote" />
            <p class="story__metric">{{ $t(`landing.reviews.${s.key}Metric`) }}</p>
            <div class="story__who">
              <p class="story__name">{{ $t(`landing.reviews.${s.key}Name`) }}</p>
              <p class="story__company">{{ $t(`landing.reviews.${s.key}Company`) }}</p>
            </div>
            <a href="#apply" class="story__read">{{ $t('landing.reviews.read') }}</a>
          </div>
          <img
            class="story__photo"
            :src="s.img"
            :alt="$t(`landing.reviews.${s.key}Name`)"
            :style="{ objectPosition: s.focus }"
            width="760"
            height="920"
            loading="lazy"
          >
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Дорожка шире контейнера на всю ширину окна, поэтому секция обрезает лишнее. */
.stories { overflow: hidden; padding: 72px 0; background: var(--m-page); }
.stories__box {
  width: var(--container-width);
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 56px 0;
  border-radius: var(--m-radius-xl);
  background: var(--m-surface);
}
.stories__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  margin: 0 56px 48px;
}
.stories__title {
  max-width: 720px;
  margin: 0;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-10xl);
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--m-ink);
}

/* Первый слайд стартует на 34px левее контейнера, правые уходят за край окна. */
.stories__track {
  --bleed: calc((100vw - var(--container-width)) / 2 - 34px);
  display: flex;
  gap: 16px;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  padding: 0 var(--bleed);
  overflow-x: auto;
  scroll-padding: 0 var(--bleed);
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.stories__track::-webkit-scrollbar { display: none; }

.story {
  position: relative;
  flex: 0 0 552px;
  height: 552px;
  overflow: hidden;
  border-radius: var(--m-radius-xl);
  scroll-snap-align: start;
}
.story--mesh { background: var(--m-mesh-gradient); color: var(--m-on-brand); }
.story--dark { background: var(--m-hero-gradient); color: var(--m-on-dark); }
.story--tint { background: var(--m-brand-tint-2); color: var(--m-ink); }
.story--warm { background: var(--m-warm-gradient); color: var(--m-on-dark); }

/* Текст прямо на карточке, слева от фото; цвет наследуется от тона карточки. */
.story__body {
  position: absolute;
  inset: 32px 264px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.story--dark .story__quote,
.story--warm .story__quote { color: var(--m-brand); }

.story__metric {
  margin: 12px 0 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-7xl);
  line-height: 1.2;
  letter-spacing: -0.015em;
}
.story__who { margin-top: auto; }
.story__name { margin: 0; font-weight: 700; font-size: var(--text-xl); }
.story__company { margin: 4px 0 0; font-size: var(--text-xs); line-height: 1.35; color: var(--m-ink-soft); }
.story--dark .story__company,
.story--warm .story__company { color: var(--m-on-dark-2); }

.story__read {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 52px;
  margin-top: 16px;
  border: 1px solid var(--m-ink);
  border-radius: var(--m-radius-pill);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--m-ink);
  text-decoration: none;
  transition: background var(--m-dur) var(--m-ease), color var(--m-dur) var(--m-ease);
}
.story__read:hover { background: var(--m-ink); color: var(--m-surface); }
.story--dark .story__read,
.story--warm .story__read { border-color: var(--m-surface); background: var(--m-surface); }
.story--dark .story__read:hover,
.story--warm .story__read:hover { background: var(--m-brand); border-color: var(--m-brand); color: var(--m-on-brand); }

.story__photo {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 216px;
  height: calc(100% - 48px);
  border-radius: var(--m-radius-lg);
  object-fit: cover;
}

.stories__arrows { display: flex; flex: none; gap: 10px; }
.stories__arrow {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1px solid var(--m-ink);
  border-radius: 50%;
  background: transparent;
  color: var(--m-ink);
  cursor: pointer;
  transition: background var(--m-dur) var(--m-ease), color var(--m-dur) var(--m-ease), opacity var(--m-dur) var(--m-ease);
}
.stories__arrow:hover:not(:disabled) { background: var(--m-ink); color: var(--m-surface); }
.stories__arrow:disabled { opacity: 0.35; cursor: default; }
.stories__arrow:focus-visible { outline: 2px solid var(--m-ink); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  .story__read,
  .stories__arrow { transition: none; }
}
</style>
