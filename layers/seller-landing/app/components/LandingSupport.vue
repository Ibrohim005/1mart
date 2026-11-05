<script setup lang="ts">
// Поддержка: два блока рядом с общими краями: градиент слева, белая карточка со ссылками справа.
// Контакты настоящие: телефон и почта из конфига, тикеты — раздел кабинета после входа.
const config = useRuntimeConfig()
const localePath = useLocalePath()
const phone = config.public.supportPhone as string
const email = config.public.supportEmail as string

const links = computed(() => [
  { key: 'ticket', href: localePath('/login') },
  { key: 'phone', href: `tel:${phone.replace(/\s/g, '')}`, value: phone },
  { key: 'email', href: `mailto:${email}`, value: email },
  { key: 'start', href: '#steps' },
])
</script>

<template>
  <section id="support" class="support">
    <div class="support__inner">
      <h2 class="support__title">{{ $t('landing.support.title') }}</h2>

      <div class="support__stage">
        <div class="support__block">
          <div class="support__group">
            <span class="support__tile">
              <UiIcon name="headphone-fill" :size="24" color="var(--m-on-brand)" />
            </span>
            <h3 class="support__groupTitle">{{ $t('landing.support.contactTitle') }}</h3>
            <p class="support__groupText">{{ $t('landing.support.contactText') }}</p>
          </div>
          <div class="support__group">
            <span class="support__tile">
              <UiIcon name="messages-2-fill" :size="24" color="var(--m-on-brand)" />
            </span>
            <h3 class="support__groupTitle">{{ $t('landing.support.feedbackTitle') }}</h3>
            <p class="support__groupText">{{ $t('landing.support.feedbackText') }}</p>
          </div>
        </div>

        <div class="support__card">
          <h3 class="support__cardTitle">{{ $t('landing.support.cardTitle') }}</h3>
          <p class="support__cardText">{{ $t('landing.support.cardText') }}</p>

          <ul class="support__links">
            <li v-for="link in links" :key="link.key" class="support__item">
              <a :href="link.href" class="support__link">
                <span>
                  {{ $t(`landing.support.links.${link.key}`) }}
                  <span v-if="link.value" class="support__value m-tnum">{{ link.value }}</span>
                </span>
                <UiIcon name="arrow-right" :size="16" />
              </a>
            </li>
          </ul>

          <a href="#apply" class="support__btn">
            {{ $t('landing.support.cta') }}
            <UiIcon name="arrow-right" :size="18" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.support { padding: 96px 0 120px; background: var(--m-page); }
.support__inner { width: var(--container-width); max-width: var(--container-width); margin: 0 auto; }
.support__title { margin: 0 0 56px; font-family: var(--font-display); font-weight: 800; font-size: var(--text-10xl); letter-spacing: -0.025em; color: var(--m-ink); }

/* Сцена: сетка растягивает оба блока, верхний и нижний края совпадают. */
.support__stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 680px;
  gap: 24px;
  min-height: 660px;
}

.support__card {
  display: flex;
  flex-direction: column;
  padding: 48px;
  border-radius: var(--m-radius-xl);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-sm);
}
.support__cardTitle { margin: 0; font-family: var(--font-display); font-weight: 700; font-size: var(--text-9xl); line-height: 1.2; letter-spacing: -0.015em; color: var(--m-ink); }
.support__cardText { margin: 16px 0 0; font-size: var(--text-xl); line-height: 1.45; color: var(--m-ink-soft); }

.support__links { margin: 28px 0 24px; padding: 0; list-style: none; }
.support__item { border-top: 1px solid var(--m-line-strong); }
.support__link {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  font-size: var(--text-base);
  color: var(--m-ink);
  text-decoration: none;
  transition: color var(--m-dur-fast) var(--m-ease);
}
.support__link :deep(svg) { transition: transform var(--m-dur-fast) var(--m-ease); }
.support__link:hover { color: var(--m-brand-strong); }
.support__link:hover :deep(svg) { transform: translateX(3px); }
.support__value { font-weight: 600; white-space: nowrap; }

.support__btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  align-self: flex-start;
  height: 52px;
  margin-top: auto;
  padding: 0 28px;
  border: 1px solid var(--m-ink);
  border-radius: var(--m-radius-pill);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--m-ink);
  text-decoration: none;
  transition: background var(--m-dur) var(--m-ease), color var(--m-dur) var(--m-ease);
}
.support__btn:hover { background: var(--m-ink); color: var(--m-surface); }

.support__block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px;
  border-radius: var(--m-radius-xl);
  background: var(--m-mesh-gradient);
  color: var(--m-on-brand);
}
/* Волосяная линия делит две группы текста */
.support__group + .support__group {
  margin-top: 36px;
  padding-top: 36px;
  border-top: 1px solid color-mix(in srgb, var(--m-on-brand) 22%, transparent);
}
.support__tile {
  display: grid;
  width: 48px;
  height: 48px;
  margin-bottom: 20px;
  border-radius: var(--m-radius);
  background: var(--m-glass-strong);
  place-items: center;
}
.support__groupTitle { margin: 0; font-family: var(--font-display); font-weight: 700; font-size: var(--text-9xl); line-height: 1.2; letter-spacing: -0.015em; }
.support__groupText { margin: 14px 0 0; font-size: var(--text-base); line-height: 1.5; }

@media (prefers-reduced-motion: reduce) {
  .support__link,
  .support__link :deep(svg),
  .support__btn { transition: none; }
}
</style>
