<script setup lang="ts">
// Преимущества платформы: 6 карточек с заливными (filled) иконками из набора
// Figma. Тон задаёт цвет иконки-чипа (семантические семейства из business.css).
const items = [
  { icon: 'box-fill', tone: 'brand', titleKey: 'landing.benefits.item1Title', textKey: 'landing.benefits.item1Text' },
  { icon: 'wallet-money-fill', tone: 'success', titleKey: 'landing.benefits.item2Title', textKey: 'landing.benefits.item2Text' },
  { icon: 'chart-fill', tone: 'info', titleKey: 'landing.benefits.item3Title', textKey: 'landing.benefits.item3Text' },
  { icon: 'money-recive-fill', tone: 'violet', titleKey: 'landing.benefits.item4Title', textKey: 'landing.benefits.item4Text' },
  { icon: 'receipt-item-fill', tone: 'warning', titleKey: 'landing.benefits.item5Title', textKey: 'landing.benefits.item5Text' },
  { icon: 'headphone-fill', tone: 'brand', titleKey: 'landing.benefits.item6Title', textKey: 'landing.benefits.item6Text' },
]
</script>

<template>
  <section id="benefits" class="benefits">
    <div class="benefits__inner">
      <h2 class="benefits__title">{{ $t('landing.benefits.title') }}</h2>
      <div class="benefits__grid">
        <article v-for="item in items" :key="item.titleKey" class="benefit">
          <span class="benefit__icon" :class="`benefit__icon--${item.tone}`">
            <UiIcon :name="item.icon" :size="28" />
          </span>
          <h3 class="benefit__title">{{ $t(item.titleKey) }}</h3>
          <p class="benefit__text">{{ $t(item.textKey) }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.benefits { padding: 100px 0; background: var(--m-page); }
.benefits__inner { width: var(--container-width); max-width: var(--container-width); margin: 0 auto; }
.benefits__title {
  margin: 0 0 48px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-10xl);
  letter-spacing: -0.025em;
  color: var(--m-ink);
  text-align: center;
}
.benefits__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.benefit {
  padding: 32px;
  border: 1px solid var(--m-line);
  border-radius: var(--m-radius-xl);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-sm);
  transition: box-shadow var(--m-dur) var(--m-ease), transform var(--m-dur) var(--m-ease);
}
.benefit:hover { transform: translateY(-4px); box-shadow: var(--m-shadow-lg); }
.benefit__icon {
  display: grid;
  width: 58px; height: 58px;
  margin-bottom: 22px;
  border-radius: var(--m-radius-lg);
  place-items: center;
}
.benefit__icon--brand { background: var(--m-brand-tint); color: var(--m-brand-strong); }
.benefit__icon--success { background: var(--m-success-bg); color: var(--m-success-fg); }
.benefit__icon--info { background: var(--m-info-bg); color: var(--m-info-fg); }
.benefit__icon--violet { background: var(--m-violet-bg); color: var(--m-violet-fg); }
.benefit__icon--warning { background: var(--m-warning-bg); color: var(--m-warning-fg); }
.benefit__title { margin: 0 0 10px; font-family: var(--font-display); font-weight: 700; font-size: var(--text-3xl); letter-spacing: -0.01em; color: var(--m-ink); }
.benefit__text { margin: 0; font-size: var(--text-base); line-height: 1.55; color: var(--m-slate); }
</style>
