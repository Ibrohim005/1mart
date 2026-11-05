<script setup lang="ts">
/** «Возврат товара»: своя страница вместо ссылки в общий центр помощи. */
const localePath = useLocalePath()
const STEPS = ['step1', 'step2', 'step3']
</script>

<template>
  <div class="ret">
    <ol class="ret__steps">
      <li v-for="(step, index) in STEPS" :key="step" class="ret__step">
        <span class="ret__num">{{ index + 1 }}</span>
        <span class="ret__body">
          <span class="ret__title">{{ $t(`ui.catalog.infoPage.returns.${step}.title`) }}</span>
          <span class="ret__text">{{ $t(`ui.catalog.infoPage.returns.${step}.text`) }}</span>
        </span>
      </li>
    </ol>

    <NuxtLink :to="localePath('/account/orders')" class="ret__link">
      {{ $t('ui.catalog.infoPage.returns.toOrders') }}
      <UiIcon name="alt-arrow-right" :size="16" />
    </NuxtLink>
  </div>
</template>

<style scoped>
.ret { display: flex; flex-direction: column; align-items: flex-start; gap: 20px; }

.ret__steps { display: flex; flex-direction: column; gap: 10px; width: 100%; margin: 0; padding: 0; list-style: none; }

.ret__step {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: 14px;
  background: var(--color-page);
}

.ret__num {
  display: grid;
  flex: none;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--color-surface);
  font-weight: 700;
  font-size: var(--text-xs);
  color: var(--color-text);
}

.ret__body { display: flex; flex-direction: column; gap: 4px; }
.ret__title { font-weight: 600; font-size: var(--text-base); line-height: 22px; color: var(--color-text); }
.ret__text { font-size: var(--text-md); line-height: 22px; color: var(--color-text-muted); }

.ret__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: var(--control-height, 48px);
  padding-inline: 20px;
  border-radius: 12px;
  background: var(--color-brand);
  font: var(--type-button);
  color: var(--color-on-brand);
}

.ret__link:hover { background: var(--color-brand-dark); }
.ret__link:focus-visible { outline: none; box-shadow: var(--focus-ring); }
</style>
