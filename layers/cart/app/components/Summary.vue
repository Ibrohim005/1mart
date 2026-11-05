<script setup lang="ts">
/** Блок «Ваш заказ». */
import type { Cart } from '#shared/types/cart'

defineProps<{ cart: Cart }>()
const emit = defineEmits<{ checkout: [] }>()
const { money } = useMoney()
const { t } = useI18n()
</script>

<template>
  <aside class="summary">
    <div class="summary__card">
      <h2 class="summary__title">{{ $t('common.vashZakaz') }}</h2>

      <p class="summary__row">
        <!-- Считаем выбранные, а не все: сумма рядом тоже только по выбранным,
             и «2 товар — 412 990» показывал цену одного -->
        <span class="summary__label">{{ $t('common.itemsCount', { count: cart.selectedCount, word: $t('common.tovar', cart.selectedCount) }) }}</span>
        <span class="summary__value">{{ money(cart.subtotal) }}</span>
      </p>

      <p v-if="cart.discount.amount" class="summary__row">
        <span class="summary__label">{{ $t('common.skidka') }}</span>
        <span class="summary__value summary__value--discount">– {{ money(cart.discount) }}</span>
      </p>

      <hr class="summary__divider">

      <p class="summary__row summary__row--total">
        <span class="summary__total-label">{{ t('cart.total') }}</span>
        <span class="summary__total-value">{{ money(cart.total) }}</span>
      </p>

      <button
        type="button"
        class="summary__submit"
        :disabled="!cart.selectedCount"
        @click="emit('checkout')"
      >{{ t('cart.checkout') }}</button>

      <!-- Чем можно заплатить — до оформления, чтобы не было сюрпризов -->
      <p class="summary__pay">{{ $t('pay.cart.paymentTitle') }}</p>
    </div>

    <p class="summary__note">
      <UiIcon name="truck" :size="20" />
      {{ $t('pay.cart.deliveryNote') }}
    </p>
  </aside>
</template>

<style scoped>
.summary { width: 483px; }

.summary__card {
  padding: 24px;
  border-radius: 24px;
  background: var(--color-surface);
}

.summary__title {
  margin: 0 0 16px;
  font: var(--type-section-title);
  color: var(--color-text);
}

.summary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 12px;
}

.summary__label {
  font-weight: 400;
  font-size: var(--text-base);
  line-height: 24px;
  color: var(--color-text-muted);
}

.summary__value {
  font-weight: 500;
  font-size: var(--text-base);
  line-height: 24px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.summary__value--discount { color: var(--color-brand-text); }

.summary__divider {
  margin: 16px 0;
  border: 0;
  border-top: 1px solid var(--color-line);
}

.summary__total-label {
  font-weight: 700;
  font-size: var(--text-xl);
  line-height: 32px;
  color: var(--color-text);
}

.summary__total-value {
  font-weight: 700;
  font-size: var(--text-7xl);
  line-height: 32px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.summary__submit:hover:not(:disabled) { background: var(--color-brand-dark); }
.summary__submit:disabled { background: var(--color-field); color: var(--color-text-muted); cursor: not-allowed; }

.summary__submit {
  width: 100%;
  margin-top: 8px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  transition: background 0.15s ease;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.summary__pay {
  margin: 12px 0 0;
  font-size: var(--text-sm);
  line-height: 20px;
  text-align: center;
  color: var(--color-text-muted);
}

.summary__note {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px 16px;
  background: var(--color-field);
  border-radius: 14px;
  font-weight: 400;
  font-size: var(--text-sm);
  line-height: 20px;
  color: var(--color-text);
}
</style>
