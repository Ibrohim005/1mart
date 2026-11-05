<script setup lang="ts">
// Шаги подключения: большая белая карточка. Слева липкая колонка с заголовком,
// справа таймлайн из пяти строк: номера в кружках соединены тонкой линией.
const localePath = useLocalePath()
const storefrontUrl = useRuntimeConfig().public.storefrontUrl as string

const rows = [
  {
    titleKey: 'landing.steps.row1Title',
    textKey: 'landing.steps.row1Text',
    timeKey: 'landing.steps.chooseTime',
    pill: { href: storefrontUrl, key: 'landing.steps.row1Action', external: true },
  },
  {
    titleKey: 'landing.steps.row2Title',
    textKey: 'landing.steps.row2Text',
    timeKey: 'landing.steps.step4Time',
    pill: { href: '#tariffs', key: 'landing.steps.row2Action', external: false },
  },
  {
    titleKey: 'landing.steps.step1Title',
    textKey: 'landing.steps.step1Text',
    timeKey: 'landing.steps.step1Time',
    pill: { href: '#apply', key: 'landing.steps.ctaBtn', external: false },
  },
  {
    titleKey: 'landing.steps.step2Title',
    textKey: 'landing.steps.step2Text',
    timeKey: 'landing.steps.step2Time',
  },
  {
    titleKey: 'landing.steps.row5Title',
    textKey: 'landing.steps.row5Text',
    timeKey: 'landing.steps.step3Time',
    link: { to: '/login', key: 'landing.steps.row5Link' },
  },
]
</script>

<template>
  <section id="steps" class="steps">
    <div class="steps__stage">
      <div class="steps__card">
        <div class="steps__lead">
          <h2 class="steps__title">{{ $t('landing.steps.title') }}</h2>
          <p class="steps__sub">{{ $t('landing.steps.subtitle') }}</p>
          <a href="#apply" class="steps__link">{{ $t('landing.steps.ctaBtn') }}</a>
        </div>

        <ol class="steps__list">
          <li v-for="(row, i) in rows" :key="row.titleKey" class="srow">
            <span class="srow__num">{{ i + 1 }}</span>
            <div class="srow__body">
              <div class="srow__head">
                <h3 class="srow__title">{{ $t(row.titleKey) }}</h3>
                <span class="srow__time">
                  <UiIcon name="clock" :size="13" />
                  {{ $t(row.timeKey) }}
                </span>
              </div>
              <p class="srow__text">{{ $t(row.textKey) }}</p>
              <div v-if="row.pill || row.link" class="srow__actions">
                <a
                  v-if="row.pill"
                  :href="row.pill.href"
                  class="srow__pill"
                  :target="row.pill.external ? '_blank' : undefined"
                  :rel="row.pill.external ? 'noopener' : undefined"
                >{{ $t(row.pill.key) }}</a>
                <NuxtLink v-if="row.link" :to="localePath(row.link.to)" class="steps__link">
                  {{ $t(row.link.key) }}
                </NuxtLink>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.steps { padding: 100px 0; background: var(--m-page); }
.steps__stage { width: var(--container-width); max-width: var(--container-width); margin: 0 auto; }

.steps__card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 640px;
  padding: 72px 112px 24px 72px;
  border-radius: var(--m-radius-xl);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-sm);
}

/* Липкая левая колонка */
.steps__lead { position: sticky; top: 110px; align-self: start; padding-right: 56px; }
.steps__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-10xl);
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: var(--m-ink);
  text-wrap: balance;
}
.steps__sub { margin: 48px 0 0; font-size: var(--text-base); line-height: 1.5; color: var(--m-ink-soft); text-wrap: pretty; }
.steps__lead .steps__link { display: inline-block; margin-top: 24px; }
.steps__link {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--m-brand-strong);
  text-decoration: none;
  transition: color var(--m-dur-fast) var(--m-ease);
}
.steps__link:hover { color: var(--m-brand-ink); }

.steps__list { margin: 0; padding: 0; list-style: none; }

.srow { position: relative; display: grid; grid-template-columns: 40px minmax(0, 1fr); column-gap: 20px; }

/* Линия таймлайна: от низа кружка до кружка следующей строки */
.srow:not(:last-child)::before {
  content: '';
  position: absolute;
  top: 40px;
  bottom: 0;
  left: 19.5px;
  width: 1px;
  background: var(--m-line-strong);
}
.srow__num {
  display: grid;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--m-brand-tint);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-base);
  font-variant-numeric: tabular-nums;
  color: var(--m-brand-ink);
  place-items: center;
}
/* Разделитель только под текстом, линию таймлайна он не пересекает */
.srow__body { padding-bottom: 52px; }
.srow:not(:last-child) .srow__body { margin-bottom: 52px; border-bottom: 1px solid var(--m-line); }
.srow__head { display: flex; align-items: center; gap: 12px; min-height: 40px; }
.srow__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-4xl);
  line-height: 32px;
  letter-spacing: -0.01em;
  color: var(--m-ink);
}
.srow__time {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--m-radius-pill);
  background: var(--m-surface-sunken);
  font-size: var(--text-2xs);
  font-weight: 600;
  color: var(--m-slate);
  white-space: nowrap;
}
.srow__text { margin: 20px 0 0; font-size: var(--text-base); line-height: 1.55; color: var(--m-ink-soft); text-wrap: pretty; }
.srow__actions { display: flex; align-items: center; gap: 32px; margin-top: 32px; }
.srow__pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 250px;
  height: 52px;
  padding-inline: 28px;
  border: 1px solid var(--m-ink);
  border-radius: var(--m-radius-pill);
  background: transparent;
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--m-ink);
  text-decoration: none;
  transition: background var(--m-dur) var(--m-ease), color var(--m-dur) var(--m-ease);
}
.srow__pill:hover { background: var(--m-ink); color: var(--m-on-dark); }
.srow__pill:focus-visible,
.steps__link:focus-visible { outline: none; border-radius: var(--m-radius-pill); box-shadow: var(--focus-ring); }
</style>
