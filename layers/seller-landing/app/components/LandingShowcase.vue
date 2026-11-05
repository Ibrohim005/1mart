<script setup lang="ts">
// «Витрина, которую видят покупатели»: реальные карточки товаров в рамке окна.
// Фото — из каталога площадки (cdn.dummyjson.com, как и витрина), цены — данные,
// «сум» из словаря. Без названий: каталог только на русском, а лендинг двуязычный.
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

const products = [
  { img: 'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp', price: 27990000, rating: '4.9' },
  { img: 'https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/thumbnail.webp', price: 7990000, rating: '4.8' },
  { img: 'https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp', price: 1490000, rating: '4.7' },
  { img: 'https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/thumbnail.webp', price: 1290000, rating: '4.6' },
  { img: 'https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/thumbnail.webp', price: 890000, rating: '4.8' },
  { img: 'https://cdn.dummyjson.com/product-images/womens-bags/blue-women%27s-handbag/thumbnail.webp', price: 449000, rating: '4.7' },
]

const features = [
  { icon: 'gallery', titleKey: 'landing.showcase.f1Title', textKey: 'landing.showcase.f1Text' },
  { icon: 'search-normal', titleKey: 'landing.showcase.f2Title', textKey: 'landing.showcase.f2Text' },
  { icon: 'bag-tick-2', titleKey: 'landing.showcase.f3Title', textKey: 'landing.showcase.f3Text' },
]
</script>

<template>
  <section class="show">
    <div class="show__inner">
      <div class="show__head">
        <h2 class="show__title">{{ $t('landing.showcase.title') }}</h2>
        <p class="show__sub">{{ $t('landing.showcase.subtitle') }}</p>
      </div>

      <div class="show__grid">
        <div class="win" aria-hidden="true">
          <div class="win__bar">
            <span class="win__dots"><i /><i /><i /></span>
            <span class="win__url"><UiIcon name="lock" :size="12" color="currentColor" />market.paylov.uz</span>
          </div>

          <div class="win__body">
            <div class="win__search">
              <UiIcon name="search-normal" :size="16" color="currentColor" />
              <span class="win__search-ph" />
            </div>
            <ul class="pgrid">
              <li v-for="(p, i) in products" :key="i" class="pcard">
                <div class="pcard__img"><img :src="p.img" alt="" loading="lazy" width="220" height="150"></div>
                <div class="pcard__meta">
                  <span class="pcard__price m-tnum">{{ fmt(p.price) }} <small>{{ $t('common.currency') }}</small></span>
                  <span class="pcard__rating"><UiIcon name="star-fill" :size="12" color="#F5A623" />{{ p.rating }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <ul class="show__features">
          <li v-for="f in features" :key="f.titleKey" class="feat">
            <span class="feat__ic"><UiIcon :name="f.icon" :size="22" color="currentColor" /></span>
            <div>
              <h3 class="feat__title">{{ $t(f.titleKey) }}</h3>
              <p class="feat__text">{{ $t(f.textKey) }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.show { padding: 100px 0; background: var(--m-surface); }
.show__inner { width: var(--container-width); max-width: var(--container-width); margin: 0 auto; }
.show__head { max-width: 680px; margin: 0 auto 52px; text-align: center; }
.show__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-10xl);
  letter-spacing: -0.025em;
  color: var(--m-ink);
  text-wrap: balance;
}
.show__sub { margin: 14px 0 0; font-size: var(--text-xl); line-height: 1.5; color: var(--m-slate); text-wrap: pretty; }

.show__grid { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 40px; align-items: center; }

/* ── Окно браузера с витриной ────────────────────────────────────────────── */
.win {
  overflow: hidden;
  border: 1px solid var(--m-line-strong);
  border-radius: var(--m-radius-xl);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-lg);
}
.win__bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--m-line);
  background: var(--m-surface-sunken);
}
.win__dots { display: flex; gap: 7px; }
.win__dots i { width: 11px; height: 11px; border-radius: 50%; background: var(--m-line-strong); }
.win__url {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: var(--m-radius-pill);
  background: var(--m-surface);
  border: 1px solid var(--m-line);
  font-size: var(--text-xs);
  color: var(--m-slate);
}
.win__body { padding: 20px; background: var(--m-page); }
.win__search {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  margin-bottom: 18px;
  padding: 0 16px;
  border: 1px solid var(--m-line);
  border-radius: var(--m-radius-pill);
  background: var(--m-surface);
  color: var(--m-slate-soft);
}
.win__search-ph { width: 180px; height: 7px; border-radius: 999px; background: var(--m-line); }

.pgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 0; padding: 0; list-style: none; }
.pcard { overflow: hidden; border: 1px solid var(--m-line); border-radius: var(--m-radius); background: var(--m-surface); box-shadow: var(--m-shadow-xs); }
.pcard__img { height: 128px; background: var(--m-surface-sunken); }
.pcard__img img { display: block; width: 100%; height: 100%; object-fit: cover; }
.pcard__meta { display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 10px 12px; }
.pcard__price { font-family: var(--font-display); font-weight: 700; font-size: var(--text-sm); color: var(--m-ink); white-space: nowrap; }
.pcard__price small { font-size: var(--text-2xs); font-weight: 600; color: var(--m-slate); }
.pcard__rating { display: inline-flex; align-items: center; gap: 3px; font-size: var(--text-2xs); font-weight: 600; color: var(--m-slate); }

/* ── Боковые подписи-фичи ────────────────────────────────────────────────── */
.show__features { display: flex; flex-direction: column; gap: 24px; margin: 0; padding: 0; list-style: none; }
.feat { display: flex; gap: 14px; }
.feat__ic {
  display: grid;
  width: 46px; height: 46px;
  flex: none;
  place-items: center;
  border-radius: var(--m-radius);
  background: var(--m-brand-tint);
  color: var(--m-brand-strong);
}
.feat__title { margin: 2px 0 6px; font-family: var(--font-display); font-weight: 700; font-size: var(--text-xl); letter-spacing: -0.01em; color: var(--m-ink); }
.feat__text { margin: 0; font-size: var(--text-sm); line-height: 1.5; color: var(--m-slate); }
</style>
