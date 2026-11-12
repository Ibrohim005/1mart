<script setup lang="ts">
/**
 * Экран подтверждения заказа. Макет 5058:106885 — показывается над списком
 * сразу после оплаты: шаги, заголовок 37.6/800, карточка заказа
 * 536.9×212.9 r25 на #F1F1F1 и две кнопки 261.7×60.
 *
 * Заголовок, подпись и плашка раньше были тремя константами «Заказ принят»,
 * хотя дорожка рисовалась по настоящей стадии: у заказа в пути горели три
 * шага, а текст сообщал, что товар скоро заберут со склада.
 */
import type { OrderCard } from '#shared/types/order'

const props = defineProps<{ order: OrderCard }>()
const { money } = useMoney()

const localePath = useLocalePath()

/** Четыре плитки, лишние сворачиваются в «+N» — как в макете */
const preview = computed(() => props.order.images.slice(0, 4))
const rest = computed(() => Math.max(0, props.order.images.length - 4))

const { steps, currentStep, title, text, canceled } = useOrderProgress(() => props.order)
</script>

<template>
  <section class="placed">
    <div class="placed__head">
      <h2 class="placed__title">{{ title }}</h2>
      <p class="placed__text">{{ text }}</p>
    </div>

    <ol v-if="!canceled" class="placed__steps" :aria-label="$t('ui.account.placed.stepsLabel')">
      <li
        v-for="(step, index) in steps"
        :key="step.key"
        class="placed__step"
        :class="{ 'placed__step--done': step.done }"
        :aria-current="index === currentStep ? 'step' : undefined"
      >
        <span class="placed__step-mark">
          <UiIcon :name="step.icon" :size="50.1" :color="step.done ? '#FFFFFF' : '#7C8A94'" />
        </span>
        <span class="placed__step-label">{{ step.label }}</span>
        <span class="visually-hidden">{{ $t('ui.account.orders.stepOf', { current: index + 1, total: steps.length }) }}</span>
      </li>
    </ol>

    <article class="placed__card">
      <div class="placed__collage">
        <span v-for="(image, index) in preview" :key="image + index" class="placed__cell">
          <UiImage :src="image" alt="" width="94" height="94" class="placed__image" />
          <span v-if="rest && index === preview.length - 1" class="placed__rest">+{{ rest }}</span>
        </span>
      </div>

      <div class="placed__content">
        <p class="placed__row">
          <span class="placed__label">{{ $t('ui.account.orderCard.nomerZakaza') }}</span>
          <span class="placed__value">{{ order.number }}</span>
        </p>

        <span class="placed__badge" :class="{ 'placed__badge--canceled': canceled }">
          <UiIcon :name="canceled ? 'close' : 'tick-circle-fill'" :size="25" :color="canceled ? '#C02A26' : '#06621D'" />
          {{ order.statusLabel }}
        </span>

        <hr class="placed__divider">

        <p class="placed__row">
          <span class="placed__label">{{ $t('ui.account.orderCard.dataZakaza') }}</span>
          <span class="placed__value">{{ order.date }}</span>
        </p>

        <p class="placed__price">{{ money(order.total) }}</p>
      </div>

    </article>

    <div class="placed__actions">
      <NuxtLink :to="localePath('/info/help')" class="placed__button">{{ $t('ui.account.placed.help') }}</NuxtLink>
      <NuxtLink :to="localePath(`/account/orders/${order.id}`)" class="placed__button placed__button--primary">
        {{ $t('ui.account.orderCard.podrobneeZakaze') }}
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.placed {
  display: flex;
  flex-direction: column;
  gap: 64px;
  align-items: center;
  width: 536.9px;
  margin-inline: auto;
  padding-top: 40px;
}

.placed__head { display: flex; flex-direction: column; gap: 6.3px; align-items: center; }

.placed__title {
  margin: 0;
  font: var(--type-page-title);
  color: var(--color-text);
}

.placed__text {
  width: 536.9px;
  margin: 0;
  font-weight: 500;
  font-size: var(--text-5xl);
  line-height: 32.6px;
  text-align: center;
  color: #000000;
}

/* Шаги: плитка 75.1 r21.9, между ними перемычка 28.2×1.6 */
.placed__steps {
  display: flex;
  gap: 52.9px;
  align-items: flex-start;
  margin: -34px 0 0;
  padding: 0;
  list-style: none;
}

/* Подпись под плиткой: раньше названия шагов были только для скринридера,
   и зрячий видел четыре иконки без единого слова. Даты убраны — они
   повторяли то, что и так написано в карточке заказа */
.placed__step {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  width: 75.1px;
}

.placed__step-mark {
  display: grid;
  place-items: center;
  width: 75.1px;
  height: 75.1px;
  border-radius: 21.9px;
  background: #F1F1F1;
}

.placed__step--done .placed__step-mark { background: var(--color-brand); }

.placed__step-label {
  font-weight: 500;
  font-size: var(--text-sm);
  line-height: 16px;
  text-align: center;
  color: #27383F;
}

.placed__step + .placed__step::before {
  content: '';
  position: absolute;
  top: 37.5px;
  left: -40.5px;
  width: 28.2px;
  height: 1.6px;
  border-radius: 12.5px;
  background: #7C8A94;
}

.placed__card {
  display: grid;
  grid-template-areas: 'collage content';
  grid-template-columns: 187.8px 1fr;
  gap: 19.2px;
  width: 536.9px;
  padding: 12px;
  border-radius: 25px;
  background: #F1F1F1;
}

.placed__collage {
  display: grid;
  grid-area: collage;
  grid-template-columns: repeat(2, 93.9px);
  width: 187.8px;
  height: 187.8px;
  border-radius: 18.8px;
  background: var(--color-surface);
  overflow: hidden;
}

.placed__cell { position: relative; display: block; }

.placed__image { width: 93.9px; height: 93.9px; object-fit: cover; }

.placed__rest {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(0 0 0 / 45%);
  font-weight: 700;
  font-size: var(--text-7xl);
  color: var(--color-surface);
}

.placed__content {
  display: flex;
  grid-area: content;
  flex-direction: column;
  gap: 9.4px;
  padding-top: 5px;
}

.placed__row {
  display: flex;
  gap: 16px;
  align-items: baseline;
  justify-content: space-between;
  margin: 0;
}

.placed__label {
  font-weight: 400;
  font-size: var(--text-xl);
  line-height: 24.4px;
  color: #7C8A94;
}

.placed__value {
  font-weight: 700;
  font-size: var(--text-3xl);
  line-height: 28.5px;
  color: #000000;
}

.placed__badge {
  display: inline-flex;
  gap: 6.3px;
  align-items: center;
  align-self: flex-start;
  padding: 4.7px 9.4px;
  border-radius: 9.4px;
  background: #3CC8C8;
  font-weight: 500;
  font-size: var(--text-xl);
  line-height: 24.4px;
  color: var(--color-brand-text-hover);
}

.placed__badge--canceled {
  background: rgb(229 50 45 / 15%);
  color: #C02A26;
}

.placed__divider {
  width: 100%;
  height: 1.6px;
  margin: 6.3px 0;
  border: 0;
  border-radius: 12.5px;
  background: #7C8A94;
}

.placed__price {
  margin: 0;
  font-weight: 600;
  font-size: var(--text-9xl);
  line-height: 40.7px;
  color: #000000;
}

.placed__actions { display: flex; gap: 13.6px; width: 536.9px; }

.placed__button {
  display: grid;
  flex: 1;
  place-items: center;
  background: #F1F1F1;
  color: #000000;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.placed__button--primary {
  background: var(--color-brand);
  font-weight: 600;
  color: var(--color-on-brand);
}

.placed__button--primary:hover { background: #097A24; }
</style>
