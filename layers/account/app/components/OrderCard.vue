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

/** Чьи заявки в заказе — имена без роли, по разу */
const requesters = computed(() => [...new Set(props.order.items.map(item => item.requestedBy?.split(' · ')[0]).filter(Boolean))].join(', '))

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

        <!-- B2B: кто оформил, чем заплатили и чьи заявки — видно сразу в списке -->
        <p v-if="order.placedBy" class="order__eta">
          {{ $t('org.orders.placed') }}: <strong>{{ order.placedBy }}</strong>
        </p>
        <p v-if="order.paymentMethod" class="order__eta">
          {{ $t('org.orders.paidWith') }}: <strong>{{ order.paymentMethod }}</strong>
        </p>
        <p v-if="requesters" class="order__eta">
          {{ $t('org.orders.requests') }}: <strong>{{ requesters }}</strong>
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
/*
 * Статус заказа и состояние денег — одна система плашек: одна высота и шрифт,
 * цвет несёт только точка, фон спокойный. Раньше статус был крупнее, с иконкой
 * и цветной заливкой, а оплата — другой плашкой рядом.
 */
.order__status,
.order__pay {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--color-line);
  border-radius: 8px;
  background: var(--color-surface);
  font-weight: 500;
  font-size: var(--text-sm);
  line-height: 1;
  white-space: nowrap;
  color: var(--color-text);
}

.order__status::before,
.order__pay::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--dot); }

.order__pay { margin-left: 6px; }

.order__status--progress { --dot: #2F80ED; }
.order__status--done { --dot: var(--color-brand); }
.order__status--waiting { --dot: #F59E0B; }
.order__status--return { --dot: #6366F1; }
.order__status--canceled { --dot: var(--color-danger); color: var(--color-danger); }

.order__pay--held { --dot: #F59E0B; }
.order__pay--charged { --dot: var(--color-brand); }
.order__pay--refunded { --dot: #6366F1; }

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
