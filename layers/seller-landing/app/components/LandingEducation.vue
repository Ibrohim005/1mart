<script setup lang="ts">
// Блок материалов для продавцов: цветной блок справа с заголовком и крупной иконкой,
// поверх него белая карточка, выступающая за его левый край. Тексты из словаря.
const guides = ['c1Title', 'c2Title', 'guide3', 'guide4']
</script>

<template>
  <section id="education" class="edu">
    <div class="edu__stage">
      <div class="edu__block">
        <h2 class="edu__heading">{{ $t('landing.edu.heading') }}</h2>
        <span class="edu__mark" aria-hidden="true">
          <UiIcon name="note-fill" :size="208" />
        </span>
      </div>

      <div class="edu__card">
        <p class="edu__label">{{ $t('landing.edu.label') }}</p>
        <h3 class="edu__title">{{ $t('landing.edu.guideTitle') }}</h3>
        <p class="edu__text">{{ $t('landing.edu.text') }}</p>

        <ul class="edu__list">
          <li v-for="g in guides" :key="g" class="edu__item">
            <a href="#apply" class="edu__link">
              {{ $t(`landing.edu.${g}`) }}
              <UiIcon name="arrow-right" :size="16" />
            </a>
          </li>
        </ul>

        <a href="#apply" class="edu__all">
          {{ $t('landing.edu.link2') }}
          <UiIcon name="arrow-right" :size="18" />
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.edu { padding: 112px 0; background: var(--m-page); }
.edu__stage {
  position: relative;
  width: var(--container-width);
  max-width: var(--container-width);
  height: 743px;
  margin: 0 auto;
}

/* ── Цветной блок: заголовок вверху, тоновая иконка в нижнем углу ────────── */
.edu__block {
  position: absolute;
  inset: 0 0 0 auto;
  width: 1014px;
  border-radius: var(--m-radius-xl);
  background: var(--m-mesh-gradient);
}
.edu__heading {
  position: absolute;
  top: 72px;
  right: 67px;
  width: 460px;
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 38px;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--m-on-brand);
  text-wrap: pretty;
}
.edu__mark {
  position: absolute;
  right: 56px;
  bottom: 48px;
  display: block;
  color: var(--m-on-brand);
  opacity: 0.16;
}

/* ── Белая карточка: заходит на блок и выступает за его левый край ───────── */
.edu__card {
  position: absolute;
  top: 64px;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 679px;
  min-height: 620px;
  padding: 52px 48px 48px;
  border-radius: var(--m-radius-xl);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-lg);
}
.edu__label {
  margin: 0;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--m-ink);
}
.edu__title {
  margin: 24px 0 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 48px;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--m-ink);
}
.edu__text {
  margin: 20px 0 0;
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--m-ink-soft);
  text-wrap: pretty;
}

.edu__list { width: 100%; margin: 24px 0 0; padding: 0; list-style: none; }
.edu__item { border-top: 1px solid var(--m-line-strong); }
.edu__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 45px;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--m-ink);
  text-decoration: none;
  transition: color var(--m-dur-fast) var(--m-ease);
}
.edu__link :deep(svg) { transition: transform var(--m-dur-fast) var(--m-ease); }
.edu__link:hover { color: var(--m-brand-strong); }
.edu__link:hover :deep(svg) { transform: translateX(3px); }
.edu__link:focus-visible,
.edu__all:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.edu__all {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  height: 52px;
  margin-top: auto;
  padding-inline: 32px;
  border: 1px solid var(--m-ink);
  border-radius: var(--m-radius-pill);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--m-ink);
  text-decoration: none;
  transition: background var(--m-dur-fast) var(--m-ease);
}
.edu__all:hover { background: var(--m-surface-sunken); }

@media (prefers-reduced-motion: reduce) {
  .edu__link, .edu__link :deep(svg), .edu__all { transition: none; }
  .edu__link:hover :deep(svg) { transform: none; }
}
</style>
