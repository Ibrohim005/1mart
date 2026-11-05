<script setup lang="ts">
// Героблок: крупный заголовок на чистом фоне, справа выгода и действия, ниже полка
// с настоящими товарами витрины. Фото с cdn.dummyjson.com, как и в каталоге площадки.
// Названий нет: каталог только на русском, а лендинг двуязычный.
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

const CDN = 'https://cdn.dummyjson.com/product-images'
const products = [
  { img: `${CDN}/laptops/apple-macbook-pro-14-inch-space-grey/1.webp`, price: 27990000 },
  { img: `${CDN}/smartphones/iphone-13-pro/1.webp`, price: 14490000 },
  { img: `${CDN}/mobile-accessories/apple-airpods/1.webp`, price: 1890000 },
  { img: `${CDN}/mens-watches/brown-leather-belt-watch/1.webp`, price: 890000 },
]
const facts = ['fact1', 'fact2', 'fact3']

// Плитка с иконкой стоит после первого слова заголовка, в обоих языках.
const { t } = useI18n()
const titleParts = computed(() => {
  const full = t('landing.hero.title')
  const gap = full.indexOf(' ')
  return gap < 0 ? { first: full, rest: '' } : { first: full.slice(0, gap), rest: full.slice(gap + 1) }
})
</script>

<template>
  <section class="hero">
    <div class="hero__inner">
      <div class="hero__top">
        <h1 class="hero__title">
          <span class="hero__word">{{ titleParts.first }} <span class="hero__mark" aria-hidden="true"><UiIcon name="bag-2-fill" :size="44" color="var(--m-on-brand)" /></span></span> {{ titleParts.rest }}
        </h1>

        <div class="hero__side">
          <p class="hero__lead">{{ $t('landing.hero.lead') }}</p>
          <div class="hero__actions">
            <a href="#apply" class="hero__cta">
              <UiButton variant="primary" size="lg">{{ $t('landing.hero.cta') }}</UiButton>
            </a>
            <a href="#steps" class="hero__how">{{ $t('landing.hero.how') }}</a>
          </div>
        </div>
      </div>

      <ul class="hero__facts">
        <li v-for="f in facts" :key="f" class="hero__fact">{{ $t(`landing.hero.${f}`) }}</li>
      </ul>

      <ul class="hero__shelf" aria-hidden="true">
        <li v-for="p in products" :key="p.img" class="hero__tile">
          <img class="hero__photo" :src="p.img" alt="" width="360" height="360" loading="eager">
          <span class="hero__price m-tnum">{{ fmt(p.price) }} <small>{{ $t('common.currency') }}</small></span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hero { padding: calc(var(--lnav-offset, 76px) + 72px) 0 80px; background: var(--m-surface); }
.hero__inner { width: var(--container-width); max-width: var(--container-width); margin: 0 auto; }

.hero__top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  align-items: end;
  gap: 64px;
}
.hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 80px;
  line-height: 1.02;
  letter-spacing: -0.035em;
  color: var(--m-ink);
  text-wrap: balance;
}
/* Первое слово и плитка не разрываются: плитка не уезжает одна на следующую строку. */
.hero__word { white-space: nowrap; }
.hero__mark {
  display: inline-grid;
  place-items: center;
  width: 0.9em;
  height: 0.9em;
  border-radius: var(--m-radius-xl);
  background: var(--m-brand-gradient);
  vertical-align: middle;
}
.hero__lead {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: 500;
  line-height: 1.4;
  color: var(--m-ink-soft);
  text-wrap: pretty;
}
.hero__actions {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 24px;
}
.hero__cta { display: inline-block; flex: none; }
.hero__cta :deep(.btn) {
  height: 56px;
  padding-inline: 32px;
  border-radius: var(--m-radius-pill);
  font-size: var(--text-base);
}
.hero__how {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--m-ink);
  text-decoration: underline;
  text-decoration-color: var(--m-line-strong);
  text-underline-offset: 5px;
  transition: text-decoration-color var(--m-dur-fast) var(--m-ease);
}
.hero__how:hover { text-decoration-color: var(--m-ink); }
.hero__how:focus-visible { outline: none; border-radius: var(--m-radius-sm); box-shadow: var(--focus-ring); }

.hero__facts {
  display: flex;
  gap: 32px;
  margin: 40px 0 0;
  padding: 24px 0 0;
  border-top: 1px solid var(--m-line);
  list-style: none;
}
.hero__fact { font-size: var(--text-base); font-weight: 500; color: var(--m-slate); }

/* Полка товаров: первый товар шире, чтобы ряд не выглядел сеткой из одинаковых карточек */
.hero__shelf {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  margin: 32px 0 0;
  padding: 0;
  list-style: none;
}
.hero__tile {
  position: relative;
  height: 400px;
  overflow: hidden;
  border-radius: var(--m-radius-xl);
  background: var(--m-surface-sunken);
}
.hero__photo { display: block; width: 100%; height: 100%; object-fit: contain; padding: 32px 24px 64px; }
.hero__price {
  position: absolute;
  bottom: 24px;
  left: 24px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-xl);
  color: var(--m-ink);
  white-space: nowrap;
}
.hero__price small { font-size: var(--text-sm); font-weight: 600; color: var(--m-slate); }
</style>
