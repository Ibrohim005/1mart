<script setup lang="ts">
// Большой тёмный блок: слева телефон на зелёном свечении, обрезанный нижним
// краем блока, справа белая карточка с логотипом. Приложения пока нет, поэтому текст честно
// говорит «скоро», а экран телефона это HTML-макет кабинета с примером данных.
const bars = [38, 52, 44, 66, 48, 74, 58, 82, 62, 92, 70, 100]
</script>

<template>
  <section id="mobile" class="mobile">
    <div class="mobile__block">
      <span class="mobile__glow" aria-hidden="true" />

      <div class="phone" aria-hidden="true">
        <span class="phone__notch" />
        <div class="phone__screen">
          <div class="phone__bar">
            <span class="phone__clock">{{ $t('landing.mobile.phoneTime') }}</span>
          </div>

          <div class="phone__top">
            <span class="phone__sample">{{ $t('landing.mobile.phoneSample') }}</span>
            <UiIcon name="notification" :size="20" color="var(--m-ink)" />
          </div>

          <div class="phone__balance">
            <span class="phone__balance-label">
              <UiIcon name="wallet-3-fill" :size="16" color="var(--m-on-dark)" />
              {{ $t('landing.mobile.phoneBalance') }}
            </span>
            <strong class="phone__balance-value">{{ $t('landing.mobile.phoneBalanceValue') }}</strong>
            <span class="phone__balance-note">{{ $t('landing.mobile.phoneBalanceNote') }}</span>
          </div>

          <div class="phone__stat">
            <span class="phone__stat-label">{{ $t('landing.mobile.phoneOrders') }}</span>
            <strong class="phone__stat-value">{{ $t('landing.mobile.phoneOrdersValue') }}</strong>
          </div>

          <div class="phone__chart">
            <span v-for="(h, i) in bars" :key="i" class="phone__col" :style="{ height: `${h}%` }" />
          </div>
        </div>
      </div>

      <div class="mobile__card">
        <img src="/1mart-logo.svg" alt="1mart" class="mobile__logo" width="130" height="40">
        <h2 class="mobile__title">{{ $t('landing.mobile.soonTitle') }}</h2>
        <p class="mobile__text">{{ $t('landing.mobile.soonText') }}</p>
        <div class="mobile__status">
          <span class="mobile__status-tile">
            <UiIcon name="clock-fill" :size="26" color="var(--m-brand-strong)" />
          </span>
          <p class="mobile__status-text">{{ $t('landing.mobile.soonStatus') }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mobile { padding: 61px 0; background: var(--m-page); }
.mobile__block {
  position: relative;
  width: var(--container-width);
  max-width: var(--container-width);
  height: 681px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: var(--m-radius-xl);
  background: var(--m-hero-gradient);
}

/* Зелёное свечение за телефоном */
.mobile__glow {
  position: absolute;
  top: 35px;
  left: -95px;
  width: 760px;
  height: 760px;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--m-brand) 45%, transparent) 0%, transparent 100%);
}

/* Белая карточка: справа, с равными отступами сверху и снизу */
.mobile__card {
  position: absolute;
  top: 64px;
  right: 64px;
  bottom: 64px;
  display: flex;
  flex-direction: column;
  width: 606px;
  padding: 48px 48px 44px;
  border-radius: var(--m-radius-lg);
  background: var(--m-surface);
}
.mobile__logo { display: block; flex: none; width: 130px; height: 40px; margin-bottom: 32px; }
.mobile__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-10xl);
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: var(--m-ink);
  text-wrap: balance;
}
.mobile__text { margin: 24px 0 0; font-size: var(--text-base); line-height: 1.55; color: var(--m-ink-soft); text-wrap: pretty; }

/* Статус на месте QR-кода */
.mobile__status { display: flex; align-items: center; gap: 16px; margin-top: auto; }
.mobile__status-tile {
  display: grid;
  flex: none;
  width: 64px;
  height: 64px;
  border-radius: var(--m-radius);
  background: var(--m-brand-tint);
  place-items: center;
}
.mobile__status-text { margin: 0; font-size: var(--text-sm); line-height: 1.45; color: var(--m-ink-soft); }

/* Телефон уходит за нижний край блока */
.phone {
  position: absolute;
  top: 149px;
  left: 80px;
  width: 410px;
  height: 640px;
  padding: 12px;
  border-radius: 56px;
  background: var(--m-ink);
  /* Корпус чёрный на чёрном: светлый контур отделяет его от фона */
  box-shadow: 0 0 0 1px var(--m-glass-strong), var(--m-shadow-lg);
}
.phone__notch {
  position: absolute;
  top: 24px;
  left: 50%;
  width: 124px;
  height: 30px;
  border-radius: var(--m-radius-pill);
  background: var(--m-ink);
  transform: translateX(-50%);
}
.phone__screen { display: flex; flex-direction: column; height: 100%; padding: 0 20px; border-radius: 44px; background: var(--m-surface); }
.phone__bar { display: flex; align-items: center; height: 54px; padding-left: 10px; flex: none; }
.phone__clock { font-size: var(--text-md); font-weight: 700; font-variant-numeric: tabular-nums; color: var(--m-ink); }

.phone__top { display: flex; align-items: center; justify-content: space-between; flex: none; margin-top: 6px; }
.phone__sample {
  padding: 6px 12px;
  border-radius: var(--m-radius-pill);
  background: var(--m-surface-sunken);
  font-size: var(--text-2xs);
  font-weight: 600;
  color: var(--m-slate);
}

.phone__balance {
  display: flex;
  flex-direction: column;
  flex: none;
  gap: 6px;
  margin-top: 14px;
  padding: 18px;
  border-radius: var(--m-radius-lg);
  background: var(--m-hero-gradient);
}
.phone__balance-label { display: inline-flex; align-items: center; gap: 6px; font-size: var(--text-xs); color: var(--m-on-dark-2); }
.phone__balance-value {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-8xl);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--m-on-dark);
  white-space: nowrap;
}
.phone__balance-note { font-size: var(--text-xs); color: var(--m-on-dark-3); }

.phone__stat { display: flex; align-items: baseline; justify-content: space-between; flex: none; margin-top: 22px; }
.phone__stat-label { font-size: var(--text-sm); font-weight: 600; color: var(--m-slate); }
.phone__stat-value { font-family: var(--font-display); font-weight: 700; font-size: var(--text-7xl); font-variant-numeric: tabular-nums; color: var(--m-ink); }

.phone__chart { display: flex; align-items: flex-end; flex: none; gap: 8px; height: 190px; margin-top: 12px; }
.phone__col { flex: 1; border-radius: 6px 6px 0 0; background: var(--m-brand); }
.phone__col:nth-child(odd) { background: var(--m-brand-tint-2); }
</style>
