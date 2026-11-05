<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()

definePageMeta({ middleware: 'auth' })

/**
 * «Стать продавцом». Отдельного макета в Figma нет —
 * страница собрана на компонентах кабинета, чтобы пункт меню не вёл в 404.
 * TODO: Connect to backend endpoint POST /seller/applications
 */
useSeoMeta({ title: () => t('ui.account.seller.seoTitle'), robots: 'noindex, nofollow' })

const steps = [
  { title: 'ui.account.seller.zapolniteAnketu', text: 'ui.account.seller.nazvanieHozyaystva' },
  { title: 'ui.account.seller.prishliteDokumenty', text: 'ui.account.seller.veterinarnyeSpravki' },
  { title: 'ui.account.seller.nachniteProdavat', text: 'ui.account.seller.razmestiteObyavleniya' },
]
</script>

<template>
  <AccountLayout :title="$t('common.becomeSeller')">
    <section class="seller">
      <p class="seller__lead">
        {{ $t('ui.account.seller.prodavayteZhivotnyhTovaryNih') }}
      </p>

      <ol class="seller__steps">
        <li v-for="(step, index) in steps" :key="step.title" class="seller__step">
          <span class="seller__number">{{ index + 1 }}</span>
          <span class="seller__step-text">
            <span class="seller__step-title">{{ $t(step.title) }}</span>
            <span class="seller__step-description">{{ $t(step.text) }}</span>
          </span>
        </li>
      </ol>

      <NuxtLink :to="localePath('/info/partners')" class="seller__button">{{ $t('ui.account.seller.ostavitZayavku') }}</NuxtLink>
    </section>
  </AccountLayout>
</template>

<style scoped>
.seller {
  padding: 28px;
  border-radius: 20.6px;
  background: var(--color-surface);
}

.seller__lead {
  margin: 0;
  font-size: var(--text-lg);
  line-height: 24px;
  color: var(--color-text);
}

.seller__steps {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 26px 0 0;
  padding: 0;
  list-style: none;
}

.seller__step { display: flex; gap: 14px; }

.seller__number {
  display: grid;
  place-items: center;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-brand);
  font-weight: 700;
  color: var(--color-on-brand);
}

.seller__step-title {
  display: block;
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--color-text);
}

.seller__step-description {
  display: block;
  margin-top: 2px;
  font-size: var(--text-md);
  color: var(--color-text-muted);
}

.seller__button {
  display: grid;
  place-items: center;
  width: 220px;
  margin-top: 28px;
  background: var(--color-brand);
  color: var(--color-on-brand);
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}
</style>
