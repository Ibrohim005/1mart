<script setup lang="ts">
/**
 * Способ оплаты. 1mart — только B2B: баланс компании, который пополняется
 * переводом с её расчётного счёта, или корпоративная карта. Личных карт,
 * рассрочки, кредита и наличных нет.
 *
 * Номера карт только замаскированные: в списке «UzCard •4408», полнее —
 * не больше первых 6 и последних 4 цифр.
 */
import type { PaymentCardInfo, PaymentMethod } from '#shared/types/order'

const props = defineProps<{
  cards: PaymentCardInfo[]
  /** Доступно на балансе, тийины */
  available: number
  /** Сумма заказа, тийины */
  payable: number
  /** Куда вести за пополнением: сумма нехватки уже подставлена */
  topUpLink: string
}>()

const method = defineModel<PaymentMethod>('method', { required: true })
const cardId = defineModel<string | null>('cardId', { required: true })

const emit = defineEmits<{ addCard: [] }>()

const { sum } = useMoney()
const { cardTitle, cardPan, networkLogo } = use1mart()

const shortage = computed(() => Math.max(props.payable - props.available, 0))
</script>

<template>
  <section class="payment">
    <h2 class="payment__title">{{ $t('common.sposobOplaty') }}</h2>

    <div class="payment__methods" role="radiogroup" :aria-label="$t('common.sposobOplaty')">
      <button
        type="button"
        role="radio"
        class="payment__method"
        :class="{ 'payment__method--active': method === 'balance' }"
        :aria-checked="method === 'balance'"
        @click="method = 'balance'"
      >
        <span class="payment__icon"><UiIcon name="wallet-3-fill" :size="24" /></span>
        <span class="payment__text">
          <span class="payment__name">{{ $t('pay.payment.balance') }}</span>
          <span class="payment__note">{{ $t('pay.payment.available', { sum: sum(available) }) }}</span>
        </span>
        <span class="payment__radio" :class="{ 'payment__radio--on': method === 'balance' }" aria-hidden="true" />
      </button>

      <button
        type="button"
        role="radio"
        class="payment__method"
        :class="{ 'payment__method--active': method === 'card' }"
        :aria-checked="method === 'card'"
        @click="method = 'card'"
      >
        <span class="payment__icon"><UiIcon name="card-fill" :size="24" /></span>
        <span class="payment__text">
          <span class="payment__name">{{ $t('pay.payment.card') }}</span>
          <span class="payment__note">{{ $t('pay.payment.cardNote') }}</span>
        </span>
        <span class="payment__radio" :class="{ 'payment__radio--on': method === 'card' }" aria-hidden="true" />
      </button>
    </div>

    <p v-if="method === 'balance' && shortage" class="payment__short">
      <span>{{ $t('pay.payment.short', { sum: sum(shortage) }) }}</span>
      <NuxtLink :to="topUpLink" class="payment__top-up">{{ $t('pay.payment.topUp') }}</NuxtLink>
    </p>

    <div v-if="method === 'card'" class="payment__cards" role="radiogroup" :aria-label="$t('pay.payment.card')">
      <button
        v-for="card in cards"
        :key="card.id"
        type="button"
        role="radio"
        class="payment__saved"
        :class="{ 'payment__saved--active': cardId === card.id }"
        :aria-checked="cardId === card.id"
        @click="cardId = card.id"
      >
        <img :src="networkLogo(card.network)" :alt="card.network" class="payment__saved-logo">
        <span class="payment__text">
          <span class="payment__saved-title">{{ cardTitle(card) }}</span>
          <span class="payment__note">{{ card.holder }} · {{ $t('pay.payment.expires', { date: card.expires }) }}</span>
        </span>
        <span class="payment__saved-pan" :title="cardPan(card)">{{ cardPan(card) }}</span>
        <span class="payment__radio" :class="{ 'payment__radio--on': cardId === card.id }" aria-hidden="true" />
      </button>

      <button type="button" class="payment__add" @click="emit('addCard')">
        <UiIcon name="add" :size="20" />
        {{ $t('pay.payment.addCard') }}
      </button>
    </div>

    <p class="payment__hint">
      <UiIcon name="info-circle" :size="18" />
      {{ $t('pay.payment.holdHint') }}
    </p>
  </section>
</template>

<style scoped>
.payment {
  padding: 24px;
  border-radius: 24px;
  background: var(--color-surface);
}

.payment__title {
  margin: 0 0 16px;
  font: var(--type-section-title);
  color: var(--color-text);
}

.payment__methods { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.payment__method,
.payment__saved {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px;
  border: 1.5px solid var(--color-line);
  border-radius: 16px;
  background: var(--color-surface);
  text-align: left;
  cursor: pointer;
}

.payment__method:focus-visible,
.payment__saved:focus-visible { box-shadow: var(--focus-ring); }

.payment__method--active,
.payment__saved--active { border-color: var(--color-brand); background: var(--color-brand-tint); }

.payment__icon { display: grid; flex: none; place-items: center; color: var(--color-text); }

.payment__text { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.payment__name { font-weight: 600; font-size: var(--text-lg); line-height: 20px; color: var(--color-text); }
.payment__note { font-size: var(--text-sm); line-height: 18px; font-variant-numeric: tabular-nums; color: var(--color-text-muted); }

.payment__radio {
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-line);
  border-radius: 50%;
  background: var(--color-surface);
}

.payment__radio--on { border: 7px solid var(--color-brand); }

.payment__short {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 12px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--color-field);
  font-weight: 500;
  font-size: var(--text-base);
  font-variant-numeric: tabular-nums;
  color: var(--color-danger);
}

.payment__top-up {
  flex: none;
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--color-brand);
  color: var(--color-on-brand);
  font: var(--type-button-sm);
}

.payment__top-up:hover { background: var(--color-brand-dark); }

.payment__cards { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }

.payment__saved-logo { width: 48px; height: 24px; }
.payment__saved-title { font-weight: 600; font-size: var(--text-lg); color: var(--color-text); }
.payment__saved-pan { font-size: var(--text-sm); color: var(--color-text-muted); font-variant-numeric: tabular-nums; }

.payment__add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1.5px dashed var(--color-line);
  background: none;
  color: var(--color-text);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.payment__hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 16px 0 0;
  font-size: var(--text-base);
  line-height: 20px;
  color: var(--color-text-muted);
}
</style>
