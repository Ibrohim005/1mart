<script setup lang="ts">
// Финальный призыв: слева зелёная панель с заголовком и чёрной кнопкой, справа фото,
// на стыке панелей белая плашка с условием подключения.
</script>

<template>
  <section class="cta2">
    <div class="cta2__band">
      <div class="cta2__panel">
        <h2 class="cta2__title">{{ $t('landing.cta2.title') }}</h2>
        <p class="cta2__text">{{ $t('landing.cta2.text') }}</p>
        <a href="#apply" class="cta2__btn">{{ $t('landing.hero.cta') }}</a>
      </div>
      <div class="cta2__media">
        <img class="cta2__photo" src="/landing/team.jpg" alt="" width="1280" height="853" loading="lazy">
      </div>
      <span class="cta2__chip">
        <UiIcon name="tick-circle-fill" :size="20" color="var(--m-brand-strong)" />
        {{ $t('landing.hero.fact1') }}
      </span>
    </div>
  </section>
</template>

<style scoped>
.cta2 { padding: 32px 0; background: var(--m-page); }
.cta2__band {
  position: relative;
  display: grid;
  grid-template-columns: 55% 45%;
  width: var(--container-width);
  max-width: var(--container-width);
  min-height: 400px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: var(--m-radius-xl);
}
.cta2__panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 48px 56px;
  background: var(--m-mesh-gradient);
}
.cta2__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 56px;
  line-height: 1.06;
  letter-spacing: -0.03em;
  color: var(--m-on-brand);
  text-wrap: balance;
}
.cta2__text {
  margin: 16px 0 32px;
  font-size: var(--text-xl);
  line-height: 1.5;
  color: var(--m-on-brand);
  text-wrap: pretty;
}
.cta2__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--control-height);
  margin-top: auto;
  padding-inline: 32px;
  border-radius: var(--m-radius-pill);
  background: var(--m-ink);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--m-on-dark);
  text-decoration: none;
  transition: box-shadow var(--m-dur) var(--m-ease);
}
.cta2__btn:hover { box-shadow: var(--m-shadow-lg); }
.cta2__btn:focus-visible { outline: none; box-shadow: var(--focus-ring); }

/* Фото абсолютно: высоту полосы задаёт панель с текстом, а не размер картинки. */
.cta2__media { position: relative; }
.cta2__photo { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }

.cta2__chip {
  position: absolute;
  bottom: 48px;
  left: 55%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--m-radius-pill);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-md);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--m-ink);
  white-space: nowrap;
  transform: translateX(-50%);
}

@media (prefers-reduced-motion: reduce) {
  .cta2__btn { transition: none; }
}
</style>
