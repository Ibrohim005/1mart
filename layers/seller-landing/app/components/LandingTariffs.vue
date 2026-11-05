<script setup lang="ts">
// Тарифы: ставки комиссии по категориям. Это комиссии, а не планы подписки, поэтому
// кнопок покупки нет: три самые низкие ставки вынесены в карточки поверх тёмной шапки,
// остальные идут компактной сеткой. Ставки — данные; подписи локализуются.
const rows = [
  { labelKey: 'landing.tariffs.catElectronics', rate: 6 },
  { labelKey: 'landing.tariffs.catSmartphones', rate: 8 },
  { labelKey: 'landing.tariffs.catAccessories', rate: 10 },
  { labelKey: 'landing.tariffs.catOffice', rate: 9 },
  { labelKey: 'landing.tariffs.catComponents', rate: 6 },
  { labelKey: 'landing.tariffs.catNetwork', rate: 7 },
]

// Сортировка устойчивая: при равных ставках сохраняется исходный порядок
const sorted = [...rows].sort((a, b) => a.rate - b.rate)
const lowest = sorted.slice(0, 3)
const others = sorted.slice(3)
</script>

<template>
  <section id="tariffs" class="tariffs">
    <div class="tariffs__inner">
      <header class="tariffs__head">
        <h2 class="tariffs__title">{{ $t('landing.tariffs.title') }}</h2>
        <p class="tariffs__subtitle">{{ $t('landing.tariffs.subtitle') }}</p>
      </header>

      <div class="tariffs__body">
        <ul class="tariffs__cards">
          <li
            v-for="(row, index) in lowest"
            :key="row.labelKey"
            class="tcard"
            :class="{ 'tcard--lead': index === 0 }"
          >
            <span class="tcard__label">{{ $t('landing.tariffs.colCommission') }}</span>
            <span class="tcard__rate m-tnum">{{ row.rate }}<span class="tcard__unit">%</span></span>
            <span class="tcard__cat">{{ $t(row.labelKey) }}</span>
          </li>
        </ul>

        <ul class="tariffs__rest">
          <li v-for="row in others" :key="row.labelKey" class="trow">
            <span class="trow__cat">{{ $t(row.labelKey) }}</span>
            <span class="trow__rate m-tnum">{{ row.rate }}%</span>
          </li>
        </ul>

        <div class="tariffs__foot">
          <p class="tariffs__note">{{ $t('landing.tariffs.note') }}</p>
          <a href="#apply" class="tariffs__link">
            {{ $t('landing.nav.apply') }}
            <UiIcon name="arrow-right" :size="20" color="var(--m-ink)" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tariffs { padding: 100px 0; background: var(--m-page); }
.tariffs__inner { width: var(--container-width); max-width: var(--container-width); margin: 0 auto; }

/* Тёмная шапка: нижний отступ равен заходу карточек плюс воздух под текстом */
.tariffs__head {
  display: grid;
  grid-template-columns: 1fr 440px;
  gap: 64px;
  align-items: end;
  padding: 72px 72px 200px;
  border-radius: calc(var(--m-radius-xl) * 2);
  background: var(--m-hero-gradient);
}
.tariffs__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 64px;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--m-on-dark);
  text-wrap: balance;
}
.tariffs__subtitle { margin: 0; font-size: var(--text-xl); line-height: 1.5; color: var(--m-on-dark-2); text-wrap: pretty; }

.tariffs__body { position: relative; margin-top: -136px; padding-inline: 40px; }

.tariffs__cards,
.tariffs__rest {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tcard {
  display: flex;
  flex-direction: column;
  padding: 28px 32px 32px;
  border-radius: var(--m-radius-xl);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-lg);
}
/* Самая низкая ставка: карточка выше соседних и в фирменном градиенте */
.tcard--lead { margin-top: -24px; background: var(--m-mesh-gradient); }

.tcard__label { font-size: var(--text-sm); font-weight: 500; color: var(--m-slate); }
.tcard__rate {
  margin-top: auto;
  padding-top: 32px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 136px;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--m-brand-strong);
}
.tcard__unit { margin-left: 4px; font-size: 64px; letter-spacing: -0.02em; }
.tcard__cat { margin-top: 16px; font-size: var(--text-2xl); font-weight: 600; line-height: 1.3; color: var(--m-ink); }
.tcard--lead .tcard__label,
.tcard--lead .tcard__rate,
.tcard--lead .tcard__cat { color: var(--m-on-brand); }

.tariffs__rest { margin-top: 20px; }
.trow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 32px;
  border: 1px solid var(--m-line);
  border-radius: var(--m-radius-lg);
  background: var(--m-surface);
}
.trow__cat { font-size: var(--text-md); line-height: 1.3; color: var(--m-ink-soft); }
.trow__rate {
  flex: none;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-7xl);
  letter-spacing: -0.02em;
  color: var(--m-ink);
}

.tariffs__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  margin-top: 28px;
  padding-inline: 8px;
}
.tariffs__note { margin: 0; max-width: 640px; font-size: var(--text-sm); line-height: 1.5; color: var(--m-slate); text-wrap: pretty; }
.tariffs__link {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 8px;
  border-radius: var(--m-radius-sm);
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--m-ink);
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 4px;
  transition: text-decoration-color var(--m-dur-fast) var(--m-ease);
}
.tariffs__link:hover { text-decoration-color: var(--m-ink); }
.tariffs__link:focus-visible { outline: none; box-shadow: var(--focus-ring); }
</style>
