<script setup lang="ts">
/**
 * Экран после оплаты (ТЗ п.4.1.7.3): номера заказов, id транзакции,
 * зарезервированная сумма и чек. Деньги на этом шаге только в резерве —
 * списание после подтверждения продавцом, об этом говорим прямо.
 */
import type { Money } from '#shared/types/catalog'
import type { PaymentReceipt } from '#shared/types/order'

export interface PlacementResult {
  orders: Array<{ id: number | string, number: string, amount: Money }>
  transactionId: string
  reserved: Money
  receipt?: PaymentReceipt
}

const props = defineProps<{ result: PlacementResult }>()

const { money } = useMoney()
const localePath = useLocalePath()
const showReceipt = ref(false)

const orderLink = computed(() => (props.result.orders.length === 1
  ? localePath(`/account/orders/${props.result.orders[0]!.id}`)
  : localePath(`/account/orders?placed=${props.result.orders[0]?.id ?? ''}`)))
</script>

<template>
  <section class="success" aria-live="polite">
    <UiSuccessMark :size="104" />
    <h1 class="success__title">{{ $t('pay.success.title') }}</h1>
    <p class="success__text">{{ $t('pay.success.text') }}</p>

    <dl class="success__rows">
      <div class="success__row">
        <dt>{{ $t(result.orders.length > 1 ? 'pay.success.orders' : 'pay.success.order') }}</dt>
        <dd>
          <NuxtLink v-for="order in result.orders" :key="order.id" :to="localePath(`/account/orders/${order.id}`)" class="success__order">
            {{ order.number }}
          </NuxtLink>
        </dd>
      </div>
      <div class="success__row">
        <dt>{{ $t('pay.receipt.transaction') }}</dt>
        <dd class="success__mono">{{ result.transactionId }}</dd>
      </div>
      <div class="success__row">
        <dt>{{ $t('pay.success.reserved') }}</dt>
        <dd>{{ money(result.reserved) }}</dd>
      </div>
      <div v-if="result.receipt" class="success__row">
        <dt>{{ $t('pay.receipt.method') }}</dt>
        <dd>{{ result.receipt.paymentMethod }}</dd>
      </div>
      <div class="success__row">
        <dt>{{ $t('pay.success.status') }}</dt>
        <dd><span class="success__chip">{{ $t('pay.paymentStatus.held') }}</span></dd>
      </div>
    </dl>

    <div class="success__actions">
      <UiButton variant="secondary" :disabled="!result.receipt" @click="showReceipt = true">{{ $t('pay.success.receipt') }}</UiButton>
      <NuxtLink :to="localePath('/')" class="success__link">{{ $t('pay.success.toCatalog') }}</NuxtLink>
      <NuxtLink :to="orderLink" class="success__link success__link--primary">{{ $t('pay.success.toOrder') }}</NuxtLink>
    </div>

    <CheckoutReceiptModal v-model="showReceipt" :receipt="result.receipt" />
  </section>
</template>

<style scoped>
.success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 620px;
  margin-inline: auto;
  padding: 40px 40px 32px;
  border-radius: 30px;
  background: var(--color-surface);
  text-align: center;
}

.success__title { margin: 6px 0 0; font: var(--type-page-title); color: var(--color-text); }
.success__text { margin: 0; max-width: 480px; font-size: var(--text-xl); line-height: 26px; color: var(--color-text-muted); }

.success__rows { width: 100%; margin: 8px 0 0; padding: 6px 18px; border-radius: 18px; background: #F6F8FA; }

.success__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-block: 12px;
  border-bottom: 1px solid #E7EBF0;
  font-size: var(--text-lg);
}

.success__row:last-child { border-bottom: 0; }
.success__row dt { color: var(--color-text-muted); }
.success__row dd { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; margin: 0; font-weight: 600; color: var(--color-text); }
.success__order { color: var(--color-brand-text); text-decoration: underline; }
.success__mono { font-family: var(--font-ui); font-variant-numeric: tabular-nums; }

.success__chip {
  padding: 4px 10px;
  border-radius: 9px;
  background: #FFF4E5;
  font-size: var(--text-base);
  color: #8A4B00;
}

.success__actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; margin-top: 8px; }

.success__link {
  display: grid;
  place-items: center;
  background: #EEF1F4;
  color: var(--color-text);
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.success__link--primary { background: var(--color-brand); color: var(--color-on-brand); }
.success__link--primary:hover { background: var(--color-brand-dark, #097A24); }
</style>
