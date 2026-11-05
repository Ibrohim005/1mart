<script setup lang="ts">
/** «Доставка»: два способа и путь заказа. Ссылка «Пункты выдачи» из шапки ведёт на якорь #pickup. */
const METHODS = [
  { id: 'courier', icon: 'truck', facts: ['fact1', 'fact2', 'fact3'] },
  { id: 'pickup', icon: 'location', facts: ['fact1', 'fact2', 'fact3'] },
]
const STEPS = ['step1', 'step2', 'step3', 'step4']
</script>

<template>
  <div class="deliv">
    <div class="deliv__methods">
      <section v-for="method in METHODS" :id="method.id" :key="method.id" class="deliv__method">
        <span class="deliv__icon"><UiIcon :name="method.icon" :size="22" /></span>
        <h2 class="deliv__method-title">{{ $t(`ui.catalog.infoPage.delivery.${method.id}.title`) }}</h2>
        <ul class="deliv__facts">
          <li v-for="fact in method.facts" :key="fact" class="deliv__fact">
            <UiIcon name="tick-circle" :size="18" class="deliv__tick" />
            {{ $t(`ui.catalog.infoPage.delivery.${method.id}.${fact}`) }}
          </li>
        </ul>
      </section>
    </div>

    <section class="deliv__section">
      <h2 class="deliv__title">{{ $t('ui.catalog.infoPage.delivery.stepsTitle') }}</h2>
      <ol class="deliv__steps">
        <li v-for="(step, index) in STEPS" :key="step" class="deliv__step">
          <span class="deliv__num">{{ index + 1 }}</span>
          <span class="deliv__step-title">{{ $t(`ui.catalog.infoPage.delivery.${step}.title`) }}</span>
          <span class="deliv__step-text">{{ $t(`ui.catalog.infoPage.delivery.${step}.text`) }}</span>
        </li>
      </ol>
    </section>

    <section class="deliv__section">
      <h2 class="deliv__title">{{ $t('ui.catalog.infoItem.deliveryH3') }}</h2>
      <p class="deliv__text">{{ $t('ui.catalog.infoItem.deliveryP3_1') }}</p>
    </section>
  </div>
</template>

<style scoped>
.deliv { display: flex; flex-direction: column; gap: 28px; }

.deliv__methods { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.deliv__method {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  scroll-margin-top: 170px;
}

.deliv__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-brand-tint);
  color: var(--color-brand-text);
}

.deliv__method-title,
.deliv__title {
  margin: 0;
  font: var(--type-card-title);
  color: var(--color-text);
}

.deliv__facts { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none; }

.deliv__fact {
  display: flex;
  gap: 8px;
  font-size: var(--text-md);
  line-height: 22px;
  color: var(--color-text);
}

.deliv__tick { flex: none; margin-top: 2px; color: var(--color-brand-text); }

.deliv__section { display: flex; flex-direction: column; gap: 12px; }

.deliv__steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.deliv__step {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border-radius: 14px;
  background: var(--color-page);
}

.deliv__num {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  margin-bottom: 4px;
  border-radius: 8px;
  background: var(--color-surface);
  font-weight: 700;
  font-size: var(--text-xs);
  color: var(--color-text);
}

.deliv__step-title { font-weight: 600; font-size: var(--text-md); line-height: 20px; color: var(--color-text); }
.deliv__step-text { font-size: var(--text-sm); line-height: 20px; color: var(--color-text-muted); }

.deliv__text { margin: 0; font-size: var(--text-md); line-height: 24px; color: var(--color-text-muted); }
</style>
