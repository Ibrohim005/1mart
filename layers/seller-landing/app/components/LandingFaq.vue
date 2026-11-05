<script setup lang="ts">
// Частые вопросы: слева заголовок и ссылка на поддержку, справа аккордеон.
// Открыт один пункт за раз. Тексты из словаря.
const faqs = [1, 2, 7, 8, 6, 5, 3, 4].map(n => ({ q: `landing.faq.q${n}`, a: `landing.faq.a${n}` }))
const open = ref(0)
function toggle(i: number) {
  open.value = open.value === i ? -1 : i
}
</script>

<template>
  <section id="faq" class="faq">
    <div class="faq__inner">
      <div class="faq__side">
        <h2 class="faq__title">{{ $t('landing.faq.title') }}</h2>
        <p class="faq__sub">{{ $t('landing.faq.subtitle') }}</p>
        <p class="faq__ask">
          {{ $t('landing.faq.askText') }}
          <a href="#support" class="faq__ask-link">{{ $t('landing.faq.askLink') }}</a>
        </p>
      </div>

      <ul class="faq__list">
        <li v-for="(item, i) in faqs" :key="item.q" class="faq__item" :class="{ 'faq__item--open': open === i }">
          <button type="button" class="faq__q" :aria-expanded="open === i" @click="toggle(i)">
            <span>{{ $t(item.q) }}</span>
            <span class="faq__mark"><UiIcon name="add" :size="20" /></span>
          </button>
          <div class="faq__panel">
            <div class="faq__panel-inner">
              <p class="faq__a">{{ $t(item.a) }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.faq { padding: 112px 0; background: var(--m-page); }
.faq__inner {
  display: grid;
  grid-template-columns: 420px minmax(0, 1fr);
  align-items: start;
  gap: 72px;
  width: var(--container-width);
  max-width: var(--container-width);
  margin: 0 auto;
}
.faq__side { position: sticky; top: 104px; }
.faq__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-10xl);
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--m-ink);
  text-wrap: balance;
}
.faq__sub { margin: 18px 0 0; font-size: var(--text-lg); line-height: 1.5; color: var(--m-slate); text-wrap: pretty; }
.faq__ask { margin: 32px 0 0; font-size: var(--text-base); color: var(--m-ink-soft); }
.faq__ask-link { display: block; margin-top: 4px; font-weight: 600; color: var(--m-brand-strong); }
.faq__ask-link:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.faq__list { margin: 0; padding: 0; border-top: 1px solid var(--m-line-strong); list-style: none; }
.faq__item { border-bottom: 1px solid var(--m-line-strong); }
.faq__q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  padding: 24px 0;
  border: 0;
  background: none;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-2xl);
  letter-spacing: -0.01em;
  color: var(--m-ink);
  text-align: left;
  cursor: pointer;
}
.faq__q:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.faq__mark {
  display: grid;
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--m-surface);
  box-shadow: var(--m-shadow-xs);
  place-items: center;
  transition: transform var(--m-dur) var(--m-ease), background var(--m-dur) var(--m-ease);
}
.faq__q:hover .faq__mark { background: var(--m-brand-tint); }
.faq__item--open .faq__mark { background: var(--m-brand); color: var(--m-on-brand); transform: rotate(45deg); }

/* Плавное раскрытие без замера высоты: grid-rows 0fr → 1fr. */
.faq__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--m-dur) var(--m-ease);
}
.faq__item--open .faq__panel { grid-template-rows: 1fr; }
.faq__panel-inner { overflow: hidden; }
.faq__a { max-width: 640px; margin: 0; padding: 0 0 26px; font-size: var(--text-lg); line-height: 1.6; color: var(--m-slate); text-wrap: pretty; }

@media (prefers-reduced-motion: reduce) {
  .faq__panel, .faq__mark { transition: none; }
}
</style>
