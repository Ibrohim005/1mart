<script setup lang="ts">
// Кто может подключиться: юридические формы в виде чипов.
const forms = ['llc', 'ie', 'jsc', 'selfEmployed'] as const
</script>

<template>
  <section class="parts">
    <div class="parts__inner">
      <h2 class="parts__title">{{ $t('landing.participants.title') }}</h2>
      <p class="parts__text">{{ $t('landing.participants.text') }}</p>
      <ul class="parts__chips">
        <li v-for="form in forms" :key="form" class="parts__chip">{{ $t(`m.legalForm.${form}`) }}</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.parts { padding: 88px 0; background: var(--m-page); }
.parts__inner { width: var(--container-width); max-width: var(--container-width); margin: 0 auto; text-align: center; }
.parts__title {
  margin: 0 0 16px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-10xl);
  letter-spacing: -0.025em;
  color: var(--m-ink);
  text-wrap: balance;
}
.parts__text { margin: 0 auto 32px; max-width: 760px; font-size: var(--text-lg); line-height: 1.55; color: var(--m-slate); text-wrap: pretty; }
.parts__chips { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin: 0; padding: 0; list-style: none; }
.parts__chip {
  padding: 11px 22px;
  border: 1px solid var(--m-brand-tint-2);
  border-radius: var(--m-radius-pill);
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--m-brand-strong);
  background: var(--m-brand-tint);
}
</style>
