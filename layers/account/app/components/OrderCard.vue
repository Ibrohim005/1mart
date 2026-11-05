<script setup lang="ts">
/**
 * Карточка заказа в списке.
 * Макет: Мои заказы → Orders card — сетка превью 2×2 с «+N»,
 * номер заказа, плашка статуса, дата и сумма, кнопка «Подробнее о заказе».
 */
import type { OrderCard } from '#shared/types/order'

const props = defineProps<{
  order: OrderCard
  /** На странице заказа кнопка «Подробнее» живёт отдельно */
  hideAction?: boolean
}>()
const { amount } = useMoney()
const localePath = useLocalePath()

const preview = computed(() => props.order.images.slice(0, 4))
const extra = computed(() => Math.max(0, props.order.images.length - 4))

/**
 * Цвет и значок плашки считаются по машинному статусу.
 * Раньше здесь стояло `/доставлен|получен|выдан/i.test(order.status)` —
 * на узбекском «Yetkazildi» и английском «Delivered» проверка промахивалась,
 * и доставленный заказ красился как «в процессе».
 */
const statusKind = computed(() => orderStatusKind(props.order.status))
const statusIcon = computed(() => orderStatusIcon(props.order.status))

/** Где сейчас деньги: в резерве, списаны или возвращены (ТЗ UC-FL-10) */
const { paymentStatusLabel, providerName } = use1mart()
</script>

<template>
  <article class="order">
    <div class="order__body">
      <div class="order__images">
        <span
          v-for="(image, index) in preview"
          :key="index"
          class="order__cell"
        >
          <UiImage :src="image" alt="" width="94" height="94" class="order__image" />
          <span v-if="index === 3 && extra" class="order__more-count">+{{ extra }}</span>
        </span>
      </div>

      <dl class="order__info">
        <div class="order__row">
          <dt class="order__label">{{ $t('ui.account.orderCard.nomerZakaza') }}</dt>
          <dd class="order__value">{{ order.number }}</dd>
        </div>

        <span class="order__status" :class="`order__status--${statusKind}`">
          <UiIcon :name="statusIcon" color="currentColor" :size="25" />
          {{ order.statusLabel }}
        </span>

        <span v-if="order.paymentStatus" class="order__pay" :class="`order__pay--${order.paymentStatus}`">
          {{ paymentStatusLabel(order.paymentStatus) }}
        </span>

        <p v-if="order.expectedAt && (statusKind === 'progress' || statusKind === 'waiting')" class="order__eta">
          {{ $t('ui.account.orders.expectedAt') }}: <strong>{{ order.expectedAt }}</strong>
        </p>

        <p v-if="order.tracking" class="order__eta">
          {{ $t('pay.orders.tracking') }}: <strong>{{ order.tracking.number }}</strong> · {{ providerName(order.tracking.provider) }}
        </p>

        <div class="order__row order__row--divided">
          <dt class="order__label">{{ $t('ui.account.orderCard.dataZakaza') }}</dt>
          <dd class="order__value">{{ order.date }}</dd>
        </div>

        <p class="order__total">
          {{ amount(order.total) }}<span class="order__currency">{{ $t('common.currency') }}</span>
        </p>
      </dl>
    </div>

    <NuxtLink v-if="!hideAction" :to="localePath(`/account/orders/${order.id}`)" class="order__more">
      <span>{{ $t('ui.account.orderCard.podrobneeZakaze') }}</span>
      <UiIcon name="alt-arrow-right" color="currentColor" :size="22" class="order__chevron" />
    </NuxtLink>
  </article>
</template>

<style scoped>
.order {
  padding: 10px;
  border-radius: 25px;
  background: var(--color-surface);
}

.order__body { display: flex; gap: 19px; }

.order__images {
  display: grid;
  grid-template-columns: repeat(2, 93.9px);
  width: 187.8px;
  height: 187.8px;
  border-radius: 18.8px;
  overflow: hidden;
}

.order__cell { position: relative; display: block; }

.order__image { width: 93.9px; height: 93.9px; object-fit: cover; }

.order__more-count {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(31 32 38 / 55%);
  font-weight: 700;
  font-size: var(--text-5xl);
  color: var(--color-surface);
}

.order__info { flex: 1; margin: 0; padding-top: 6px; }

.order__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 10px;
}

.order__row--divided { margin-top: 14px; border-top: 1px solid #EBEFF2; padding-top: 14px; }

.order__label { font-weight: 400; font-size: var(--text-base); color: var(--color-text-muted); }
.order__value { margin: 0; font-weight: 600; font-size: var(--text-xl); color: #101010; }

/* Макет: Badge 175.1×34.4 r9.4 — заливка #1FABE7 с прозрачностью 20%,
   текст и галочка #0D85B8 */
.order__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34.4px;
  padding-inline: 9px;
  border-radius: 9.4px;
  font-weight: 600;
  font-size: var(--text-base);
  line-height: 24px;
}

.order__status--progress {
  background: rgb(31 171 231 / 20%);
  color: #0D85B8;
}

.order__status--done {
  background: rgb(44 221 65 / 20%);
  color: var(--color-brand-text-hover);
}

.order__status--waiting {
  background: #FFF4E5;
  color: #8A4B00;
}

.order__status--return {
  background: #EEF0FF;
  color: #3B3FB6;
}

.order__pay {
  display: inline-flex;
  align-items: center;
  height: 28px;
  margin-left: 8px;
  padding-inline: 9px;
  border-radius: 8px;
  font-weight: 600;
  font-size: var(--text-sm);
}

.order__pay--held { background: #FFF4E5; color: #8A4B00; }
.order__pay--charged { background: rgb(44 221 65 / 14%); color: var(--color-brand-text-hover); }
.order__pay--refunded { background: #EEF0FF; color: #3B3FB6; }

.order__status--canceled {
  background: rgb(229 50 45 / 15%);
  color: #C02A26;
}

.order__eta {
  margin: 8px 0 0;
  font-size: var(--text-base);
  color: var(--color-text-muted);
}

.order__eta strong { font-weight: 600; color: #101010; }

.order__total {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 10px 0 0;
  font-weight: 700;
  font-size: var(--text-5xl);
  line-height: 32px;
  color: #101010;
}

.order__currency { font-size: var(--text-xl); font-weight: 500; }

.order__more {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-inline: 19px;
  background: #F0F2F5;
  color: #000000;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.order__chevron { font-size: var(--text-3xl); }
</style>
