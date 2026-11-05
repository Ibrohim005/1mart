<script setup lang="ts">
// Блок ключевых цифр: широкая карточка сверху и две равные под ней. Справа в
// широкой карточке декоративные круглые плитки с иконками. Тексты из словаря.
const tiles = [
  ['location-fill', 'shop-fill', 'truck-fill', 'box-fill', 'building-fill'],
  ['map-fill', 'people-fill', 'shopping-cart-fill', 'receipt-text-fill', 'global-fill'],
]
const tones = [
  { cls: 'stats__tile--brand', color: 'var(--m-on-brand)' },
  { cls: 'stats__tile--white', color: 'var(--m-brand-strong)' },
  { cls: 'stats__tile--dark', color: 'var(--m-on-dark)' },
  { cls: 'stats__tile--soft', color: 'var(--m-brand-ink)' },
]
const tone = (row: number, col: number) => tones[(row * 2 + col) % tones.length]!
</script>

<template>
  <section class="stats" :aria-label="$t('landing.stats.aria')">
    <div class="stats__inner">
      <article class="stats__wide">
        <span class="stats__shape" aria-hidden="true" />
        <div class="stats__wide-text">
          <div class="stats__wide-head">
            <p class="stats__num">{{ $t('landing.stats.regionsVal') }}</p>
            <p class="stats__label stats__label--side">{{ $t('landing.stats.regionsLabel') }}</p>
          </div>
          <p class="stats__sub stats__sub--wide">{{ $t('landing.stats.regionsSub') }}</p>
        </div>

        <div class="stats__tiles" aria-hidden="true">
          <div v-for="(row, r) in tiles" :key="r" class="stats__tiles-row">
            <span
              v-for="(icon, c) in row"
              :key="icon"
              class="stats__tile"
              :class="tone(r, c).cls"
            >
              <UiIcon :name="icon" :size="34" :color="tone(r, c).color" />
            </span>
          </div>
        </div>
      </article>

      <div class="stats__pair">
        <article class="stats__card">
          <p class="stats__num">{{ $t('landing.stats.sellersVal') }}</p>
          <p class="stats__label">{{ $t('landing.stats.sellersLabel') }}</p>
          <p class="stats__sub">{{ $t('landing.stats.sellersSub') }}</p>
        </article>

        <article class="stats__card stats__card--accent">
          <p class="stats__num">{{ $t('landing.stats.ordersVal') }}</p>
          <p class="stats__label">{{ $t('landing.stats.ordersLabel') }}</p>
          <p class="stats__sub">{{ $t('landing.stats.ordersSub') }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats { padding: 100px 0; background: var(--m-page); }
.stats__inner {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: var(--container-width);
  max-width: var(--container-width);
  margin: 0 auto;
}
.stats__pair { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }

.stats__card {
  display: flex;
  flex-direction: column;
  height: 374px;
  padding: 48px;
  border-radius: var(--m-radius-xl);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-sm);
}
.stats__card--accent { background: var(--m-mesh-gradient); box-shadow: none; }

.stats__num {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 120px;
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: lining-nums;
  white-space: nowrap;
  color: var(--m-brand-strong);
}
.stats__label {
  margin: 16px 0 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 36px;
  line-height: 1.12;
  color: var(--m-brand-strong);
}
.stats__sub {
  margin: auto 0 0;
  font-size: var(--text-2xl);
  font-weight: 500;
  line-height: 1.4;
  color: var(--m-ink);
}
.stats__card--accent .stats__num,
.stats__card--accent .stats__label,
.stats__card--accent .stats__sub { color: var(--m-on-brand); }

/* ── Широкая карточка: цифра, подпись и кластер плиток ───────────────────── */
.stats__wide {
  position: relative;
  height: 330px;
  overflow: hidden;
  border-radius: var(--m-radius-xl);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-sm);
}
.stats__shape {
  position: absolute;
  top: -50px;
  right: -70px;
  width: 800px;
  height: 430px;
  border-radius: 62% 38% 46% 54% / 58% 44% 56% 42%;
  background: var(--m-brand-tint);
}
.stats__wide-text {
  position: absolute;
  top: 48px;
  bottom: 48px;
  left: 48px;
  display: flex;
  flex-direction: column;
  width: 500px;
}
.stats__wide-head { display: flex; align-items: center; gap: 20px; }
.stats__label--side { margin: 0; }
.stats__sub--wide { max-width: 420px; }

.stats__tiles {
  position: absolute;
  top: 50%;
  right: 35px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transform: translateY(-50%);
}
.stats__tiles-row { display: flex; gap: 22px; }
.stats__tiles-row:first-child { margin-right: 57px; }
.stats__tiles-row:last-child { margin-left: 57px; }
.stats__tile {
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  border: 4px solid var(--m-surface);
  border-radius: 50%;
  box-shadow: var(--m-shadow-md);
}
.stats__tile--brand { background: var(--m-brand-gradient); }
.stats__tile--white { background: var(--m-surface); }
.stats__tile--dark { background: var(--m-hero-gradient); }
.stats__tile--soft { background: var(--m-brand-tint-2); }
</style>
