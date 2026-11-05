<script setup lang="ts">
/**
 * Чек платежа (ТЗ п.4.1.7.3): оператор АО «Octagram», ИНН, сумма, дата,
 * id транзакции и замаскированный способ оплаты. Используется и сразу после
 * оплаты, и на странице заказа в кабинете.
 */
import type { PaymentReceipt } from '#shared/types/order'

defineProps<{ modelValue: boolean, receipt: PaymentReceipt | null | undefined }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const { money } = useMoney()
const { paymentStatusLabel } = use1mart()

function print() {
  if (import.meta.client) window.print()
}
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('pay.receipt.title')"
    body-padding="16px 24px 24px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="receipt" class="receipt">
      <p class="receipt__brand">1mart</p>
      <p class="receipt__amount">{{ money(receipt.amount) }}</p>
      <p class="receipt__status">{{ paymentStatusLabel(receipt.paymentStatus) }}</p>

      <dl class="receipt__rows">
        <div class="receipt__row">
          <dt>{{ $t('pay.receipt.operator') }}</dt>
          <dd>{{ receipt.operator }}</dd>
        </div>
        <div class="receipt__row">
          <dt>{{ $t('pay.receipt.inn') }}</dt>
          <dd>{{ receipt.inn }}</dd>
        </div>
        <div class="receipt__row">
          <dt>{{ $t('pay.receipt.transaction') }}</dt>
          <dd class="receipt__mono">{{ receipt.transactionId }}</dd>
        </div>
        <div class="receipt__row">
          <dt>{{ $t('pay.receipt.date') }}</dt>
          <dd>{{ receipt.date }}</dd>
        </div>
        <div class="receipt__row">
          <dt>{{ $t('pay.receipt.method') }}</dt>
          <dd>{{ receipt.paymentMethod }}</dd>
        </div>
        <div class="receipt__row">
          <dt>{{ $t('pay.receipt.orders') }}</dt>
          <dd>{{ receipt.orderNumbers.join(', ') }}</dd>
        </div>
        <div class="receipt__row">
          <dt>{{ $t('pay.summary.commission') }}</dt>
          <dd>{{ money({ amount: 0, currency: receipt.amount.currency }) }}</dd>
        </div>
      </dl>

      <UiButton block variant="secondary" @click="print">{{ $t('pay.receipt.print') }}</UiButton>
    </div>
  </UiModal>
</template>

<style scoped>
.receipt { display: flex; flex-direction: column; align-items: stretch; gap: 6px; }
.receipt__brand { margin: 0; font-weight: 700; font-size: var(--text-lg); text-align: center; color: var(--color-text-muted); }
.receipt__amount { margin: 0; font-weight: 800; font-size: var(--text-8xl); text-align: center; color: var(--color-text); }
.receipt__status { margin: 0 0 10px; font-weight: 600; font-size: var(--text-base); text-align: center; color: var(--color-brand-text); }
.receipt__rows { margin: 0 0 14px; padding: 6px 14px; border-radius: 14px; background: #F6F8FA; }

.receipt__row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-block: 9px;
  border-bottom: 1px dashed #D9DEE5;
  font-size: var(--text-base);
}

.receipt__row:last-child { border-bottom: 0; }
.receipt__row dt { color: var(--color-text-muted); }
.receipt__row dd { margin: 0; font-weight: 600; text-align: right; color: var(--color-text); }
.receipt__mono { font-family: var(--font-ui); font-variant-numeric: tabular-nums; }
</style>
