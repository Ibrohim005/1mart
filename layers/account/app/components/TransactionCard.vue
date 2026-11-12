<script setup lang="ts">
/**
 * Строка истории транзакций: слева иконка в круге, «Заказ #…» и под ним
 * дата · способ оплаты; справа сумма и, если есть, статус операции.
 * Строки живут внутри одной белой карточки-списка (см. страницу заказов).
 */
import type { Money } from '#shared/types/catalog'

/** Списание с карты по заказу или возврат на карту */
export type TransactionKind = 'order' | 'refund'

export interface Transaction {
  id: number
  kind: TransactionKind
  /** «#120021» */
  orderNumber: string
  /** Ссылка ведёт на этот заказ */
  orderId: number
  /**
   * Сумма деньгами, а не готовой строкой: строку нельзя отформатировать
   * по языку и к ней нечем подставить валюту.
   */
  amount: Money
  positive: boolean
  date: string
  method: string
  /** Кто в компании оформил заказ: закупщик, бухгалтер или руководитель */
  placedBy?: string
  /** Подпись статуса операции, если её отдаёт сервер */
  status?: string
}

const props = defineProps<{ transaction: Transaction }>()

const { amount } = useMoney()
const localePath = useLocalePath()

/** Знак ставим сами — в данных лежит отрицательное число у списаний */
const signed = computed(() => (props.transaction.positive ? '+' : '−') + amount({
  amount: Math.abs(props.transaction.amount.amount),
  currency: props.transaction.amount.currency,
}))

/** «09.10.2026 • 15:24» из мока → «09.10.2026, 15:24» */
const when = computed(() => props.transaction.date.replace(' • ', ', '))
const isRefund = computed(() => props.transaction.kind === 'refund')
</script>

<template>
  <article class="tx" :class="{ 'tx--refund': isRefund }">
    <span class="tx__icon" aria-hidden="true">
      <!-- Баланс компании — кошелёк, корпоративная карта — карта -->
      <UiIcon :name="isRefund ? 'rotate-left' : transaction.method.includes('•') ? 'card-fill' : 'wallet-3-fill'" :size="20" />
    </span>

    <div class="tx__main">
      <p class="tx__title">
        {{ $t(`ui.account.transactionCard.${isRefund ? 'refund' : 'nomerZakaz'}`) }}
        <NuxtLink :to="localePath(`/account/orders/${transaction.orderId}`)" class="tx__order">{{ transaction.orderNumber }}</NuxtLink>
      </p>
      <p class="tx__meta">{{ when }} · {{ transaction.method }}</p>
      <p v-if="transaction.placedBy && !isRefund" class="tx__meta tx__who">
        <UiIcon name="user" :size="14" color="currentColor" />
        {{ $t('org.orders.placedBy', { name: transaction.placedBy }) }}
      </p>
    </div>

    <div class="tx__side">
      <p class="tx__amount">
        {{ signed }}<span class="tx__currency">{{ $t('common.currency') }}</span>
      </p>
      <p v-if="transaction.status" class="tx__status">{{ transaction.status }}</p>
    </div>
  </article>
</template>

<style scoped>
.tx {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-block: 16px;
}

.tx__icon {
  display: grid;
  flex: 0 0 40px;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-brand-tint);
  color: var(--color-brand-text);
}

.tx__main { flex: 1; min-width: 0; }

.tx__title {
  margin: 0;
  font-weight: 500;
  font-size: var(--text-base);
  line-height: 20px;
  color: var(--color-navy);
}

.tx__order { color: inherit; }
.tx__order:hover { color: var(--color-brand-text); text-decoration: underline; }

.tx__meta {
  margin: 3px 0 0;
  overflow: hidden;
  font-size: var(--text-xs);
  line-height: 17px;
  color: var(--color-gray);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tx__side { text-align: right; }

.tx__amount {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 4px;
  margin: 0;
  font-weight: 600;
  font-size: var(--text-base);
  line-height: 20px;
  color: var(--color-navy);
  white-space: nowrap;
}

.tx--refund .tx__amount { color: var(--color-brand-text); }

.tx__currency { font-weight: 400; font-size: var(--text-sm); color: var(--color-gray); }

.tx__status { margin: 3px 0 0; font-size: var(--text-xs); line-height: 16px; color: var(--color-gray); }
.tx__who { display: flex; align-items: center; gap: 5px; margin-top: 2px; }
</style>
