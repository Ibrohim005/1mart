<script setup lang="ts">
/**
 * Большой баннер главной — карусель как у Uzum Market: один слайд на всю
 * ширину колонки (рядом плитки HeroAside), скруглённый, с автопрокруткой,
 * стрелками по краям (видны при наведении) и точками поверх баннера.
 * Слайды лежат в ленте и сдвигаются `transform`, без перерисовки.
 */
import type { Banner } from '#shared/types/catalog'

const props = withDefaults(defineProps<{
  banners: Banner[]
  /** Баннеры ещё едут — вместо карусели показываем скелетон */
  loading?: boolean
}>(), { loading: false })
const localePath = useLocalePath()

const active = ref(0)

/** Листать есть что только начиная со второго баннера */
const canSlide = computed(() => props.banners.length > 1)

watch(() => props.banners.length, (total) => {
  if (active.value >= total) active.value = 0
})

function go(step: number) {
  const total = props.banners.length
  if (total < 2) return
  active.value = (active.value + step + total) % total
}

/** Автопрокрутка раз в 5 секунд; на наведении и фокусе — пауза */
let timer: ReturnType<typeof setInterval> | undefined
const paused = ref(false)

onMounted(() => {
  timer = setInterval(() => {
    if (!paused.value && canSlide.value) go(1)
  }, 5000)
})

onUnmounted(() => clearInterval(timer))

/** Цены на запасном (нарисованном) баннере — без слова «сум» */
function amount(value: { amount: number, currency: 'UZS' }) {
  return groupDigits(toSum(value))
}
</script>

<template>
  <section v-if="loading" class="hero" aria-busy="true" aria-live="polite">
    <span class="visually-hidden">{{ $t('ui.shared.state.loading') }}</span>
    <div class="hero__viewport">
      <UiSkeleton width="100%" height="100%" radius="20px" />
    </div>
  </section>

  <section
    v-else-if="banners.length"
    class="hero"
    :aria-label="$t('ui.catalog.heroCarousel.bannery')"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
  >
    <div class="hero__viewport">
      <div class="hero__track" :style="{ transform: `translateX(-${active * 100}%)` }">
        <article
          v-for="(banner, index) in banners"
          :key="banner.id"
          class="hero__slide"
          :class="`hero__slide--${banner.tone}`"
          :aria-hidden="index !== active"
        >
          <!--
            Баннер — цельная картинка, кликабельная целиком. Текст в неё
            впечатан, поэтому заголовок и описание отдаются в alt и скрытым
            блоком — иначе поисковик и скринридер не увидят ничего.
          -->
          <!--
            Слайд собирается из данных: градиент бренда, текст акции слева,
            фото товара справа на светлой подложке (как промо-баннеры Uzum).
            Фото каталога — товар на белом фоне, поэтому на весь баннер его не растягиваем.
          -->
          <NuxtLink
            :to="localePath(banner.link)"
            :title="banner.description"
            class="hero__link hero__content"
            :tabindex="index === active ? 0 : -1"
          >
            <span class="hero__text">
              <span class="hero__title">{{ banner.title }}</span>
              <!-- Описание не выводим: на баннере оно повторяло заголовок и срок акции.
                   Для поисковиков и скринридеров оно остаётся в title ссылки. -->
              <span v-if="banner.oldPrice && banner.discountLabel" class="hero__old-line">
                <s class="hero__old-price">{{ amount(banner.oldPrice) }}</s>
                <span class="hero__discount">{{ banner.discountLabel }}</span>
              </span>
              <span v-if="banner.price" class="hero__price">
                {{ amount(banner.price) }}<span class="hero__currency">{{ $t('common.currency') }}</span>
              </span>
              <span v-if="banner.until" class="hero__until">{{ banner.until }}</span>
            </span>
            <span v-if="banner.image" class="hero__media" :class="{ 'hero__media--photo': banner.imageKind === 'photo' }">
              <UiImage
                :src="banner.image"
                :alt="banner.title"
                width="320"
                height="300"
                fit="inside"
                loading="eager"
                :preload="index === 0"
                class="hero__image"
              />
            </span>
          </NuxtLink>
        </article>
      </div>

      <template v-if="canSlide">
        <button type="button" class="hero__arrow hero__arrow--prev" :aria-label="$t('ui.catalog.heroCarousel.predyduschiyBanner')" @click="go(-1)">
          <UiIcon name="alt-arrow-right" color="currentColor" :size="20" class="hero__arrow-icon" />
        </button>

        <button type="button" class="hero__arrow hero__arrow--next" :aria-label="$t('ui.catalog.heroCarousel.sleduyuschiyBanner')" @click="go(1)">
          <UiIcon name="alt-arrow-right" color="currentColor" :size="20" />
        </button>

        <div class="hero__dots" role="tablist" :aria-label="$t('ui.catalog.heroCarousel.bannery')">
          <button
            v-for="(banner, index) in banners"
            :key="banner.id"
            type="button"
            role="tab"
            class="hero__dot"
            :class="{ 'hero__dot--active': index === active }"
            :aria-selected="index === active"
            :aria-label="$t('ui.catalog.heroCarousel.bannerNumber', { index: index + 1 })"
            @click="active = index"
          />
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.hero { min-width: 0; }

.hero__viewport {
  position: relative;
  height: 345px;
  overflow: hidden;
  border-radius: 12px;
  background: var(--color-topbar);
}

.hero__track {
  display: flex;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero__slide {
  position: relative;
  flex: 0 0 100%;
  height: 100%;
}

.hero__link {
  display: block;
  width: 100%;
  height: 100%;
  line-height: 0;
}

/* Фото товаров с прозрачным фоном — ставим прямо на градиент, без подложки */
.hero__media {
  position: relative;
  flex: none;
  display: grid;
  place-items: center;
  width: 280px;
  height: 280px;
}

/* Серый скелетон на чёрном слайде выглядел как белый квадрат вокруг товара */
.hero__media .hero__image { background: none; animation: none; }

.hero__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 18px 28px rgb(0 0 0 / 22%));
}

/* Снимок со своим фоном: на градиент его не поставить, поэтому это фото-плитка */
.hero__media--photo {
  overflow: hidden;
  border-radius: 12px;
  background: var(--color-surface);
  box-shadow: 0 18px 40px rgb(0 0 0 / 28%);
}

/* contain, а не cover: портретное фото (кофемашина) иначе срезалось; фон у таких снимков светлый */
.hero__media--photo .hero__image {
  object-fit: contain;
  filter: none;
}

/* Стрелки появляются при наведении на баннер */
.hero__arrow {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: rgb(255 255 255 / 92%);
  color: var(--color-navy);
  box-shadow: 0 6px 18px rgb(39 49 64 / 18%);
  opacity: 0;
  transform: translateY(-50%);
  cursor: pointer;
  transition: opacity 0.2s ease, background 0.15s ease;
}

.hero:hover .hero__arrow,
.hero__arrow:focus-visible { opacity: 1; }

.hero__arrow:hover { background: var(--color-surface); }
.hero__arrow--prev { left: 16px; }
.hero__arrow--next { right: 16px; }
.hero__arrow-icon { transform: rotate(180deg); }

.hero__dots {
  position: absolute;
  bottom: 14px;
  left: 50%;
  z-index: 2;
  display: flex;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 999px;
  background: rgb(39 49 64 / 25%);
  transform: translateX(-50%);
}

.hero__dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 55%);
  cursor: pointer;
  transition: width 0.25s ease, background 0.25s ease;
}

.hero__dot--active {
  width: 24px;
  background: var(--color-surface);
}

/* ---------- Фон слайда по тону акции ---------- */

.hero__slide--orange { background: linear-gradient(223deg, #FFD3B0 0%, #FA8231 55%, #D9601A 100%); }
.hero__slide--violet { background: var(--promo-dark-bg); }
/* Деловые фоны B2B: тёмно-зелёный бренда и графитовый */
.hero__slide--brand { background: var(--promo-brand-bg); }
.hero__slide--slate { background: var(--promo-slate-bg); }

.hero__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  /* Слева шире стрелки «назад» (16 + 44 px): при наведении она закрывала старую цену */
  padding: 32px 88px 32px 80px;
  line-height: normal;
  text-decoration: none;
}

.hero__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}


.hero__title {
  max-width: 440px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 32px;
  line-height: 38px;
  color: var(--color-surface);
}

.hero__old-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero__old-price {
  font-weight: 500;
  font-size: var(--text-lg);
  color: rgb(255 255 255 / 70%);
}

.hero__discount {
  padding: 2px 8px;
  border-radius: 8px;
  background: var(--color-surface);
  font-weight: 700;
  font-size: var(--text-lg);
  color: var(--color-navy);
}

.hero__price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-weight: 700;
  font-size: 32px;
  line-height: 38px;
  color: var(--color-surface);
}

.hero__currency { font-size: var(--text-2xl); }

.hero__until {
  align-self: flex-start;
  margin-top: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgb(255 255 255 / 20%);
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--color-surface);
}
</style>
