<script setup lang="ts">
/**
 * Сводка «Ваш заказ» (ТЗ UC-FL-10: итоги — товары + доставка + комиссия).
 * Все суммы считает сервер; здесь только показ и кнопка «Оплатить».
 */
import type { Cart } from '#shared/types/cart'

const props = defineProps<{
  cart: Cart
  /** Что заказано: фото выбранных товаров */
  thumbnails?: string[]
  promos?: { id: string }[]
  promo?: { code: string, percent: number, freeDelivery?: boolean } | null
  promoAmount?: number
  /** Цена доставки выбранным способом, тийины */
  delivery?: number
  /** «Express 24», «Пункт выдачи» — чем везём */
  deliveryLabel?: string
  /** Комиссия платежа — у 1mart 0, но строку показываем всегда */
  commission?: number
  /** Продавцы, которым доставку посчитать не удалось */
  deliveryBlocked?: Array<{ sellerId: string, sellerTitle: string, reason: string }>
  payable?: number
  /** Заказ уже уходит на сервер — кнопку блокируем, чтобы не создать два заказа */
  busy?: boolean
  /** Сервер пересчитывает сумму — вместо старого числа показываем скелетон */
  quoting?: boolean
  /** А1: в заказе есть товар, которого нет в наличии */
  stockBlocked?: boolean
}>()

const { money, sum } = useMoney()
const { t } = useI18n()

const blocked = computed(() => (props.deliveryBlocked ?? []).length > 0)
const blockedNames = computed(() =>
  (props.deliveryBlocked ?? []).map(item => item.sellerTitle).filter(Boolean).join(', '))
const promoCount = computed(() => props.promos?.length ?? 0)

/** «1 промокод», «3 промокода», «5 промокодов» */
const promoWord = computed(() => {
  const n = promoCount.value % 100
  if (n >= 11 && n <= 14) return t('ui.checkout.orderSummary.promokodov')
  const last = n % 10
  if (last === 1) return t('ui.checkout.orderSummary.promokod')
  if (last >= 2 && last <= 4) return t('ui.checkout.orderSummary.promokoda')
  return t('ui.checkout.orderSummary.promokodov')
})

const emit = defineEmits<{ pay: [], promo: [] }>()
</script>

<template>
  <aside class="summary">
    <div class="summary__card">
      <h2 class="summary__title">{{ $t('common.vashZakaz') }}</h2>

      <div v-if="thumbnails?.length" class="summary__thumbs">
        <span v-for="(thumb, index) in thumbnails" :key="index" class="summary__thumb">
          <UiImage :src="thumb" alt="" width="56" height="56" class="summary__thumb-image" />
        </span>
      </div>

      <p class="summary__row">
        <span class="summary__label">{{ $t('common.itemsCount', { count: cart.selectedCount, word: $t('common.tovar', cart.selectedCount) }) }}</span>
        <span class="summary__value">{{ money(cart.subtotal) }}</span>
      </p>

      <p v-if="cart.discount.amount" class="summary__row">
        <span class="summary__label">{{ $t('common.skidka') }}</span>
        <span class="summary__value summary__value--discount">– {{ money(cart.discount) }}</span>
      </p>

      <p v-if="promoAmount" class="summary__row">
        <span class="summary__label">{{ $t('ui.checkout.orderSummary.promoLabel', { code: promo?.code }) }}</span>
        <span class="summary__value summary__value--discount">– {{ sum(promoAmount ?? 0) }}</span>
      </p>

      <p class="summary__row">
        <span class="summary__label">
          {{ $t('pay.summary.delivery') }}
          <span v-if="deliveryLabel" class="summary__sub">{{ deliveryLabel }}</span>
        </span>
        <span class="summary__value" :class="{ 'summary__value--blocked': blocked }">
          <template v-if="blocked">{{ $t('ui.checkout.orderSummary.deliveryUnavailable') }}</template>
          <template v-else>{{ delivery ? sum(delivery) : $t('pay.summary.free') }}</template>
        </span>
      </p>

      <p v-if="blocked" class="summary__blocked-note">
        {{ $t('ui.checkout.orderSummary.deliveryBlockedNote', { sellers: blockedNames }) }}
      </p>

      <p class="summary__row">
        <span class="summary__label">{{ $t('pay.summary.commission') }}</span>
        <span class="summary__value">{{ sum(commission ?? 0) }}</span>
      </p>

      <!-- Промокод до суммы и кнопки: под кнопкой оплаты его легко не заметить -->
      <button type="button" class="summary__promo" @click="emit('promo')">
        <span class="summary__promo-icon"><UiIcon name="tag" :size="22" /></span>
        <span class="summary__promo-text">
          <span class="summary__promo-title">{{ promo?.code ?? $t('ui.checkout.orderSummary.promokod') }}</span>
          <span v-if="!promo" class="summary__promo-note">{{ $t('ui.checkout.orderSummary.youHavePromos', { count: promoCount, word: promoWord }) }}</span>
        </span>
        <UiIcon name="alt-arrow-right" color="currentColor" :size="20" class="summary__promo-chevron" />
      </button>

      <hr class="summary__divider">

      <p class="summary__row summary__row--total" :aria-busy="quoting">
        <span class="summary__total-label">{{ $t('pay.summary.total') }}</span>
        <UiSkeleton v-if="quoting" width="150px" height="26px" />
        <span v-else class="summary__total-value">{{ sum(payable ?? cart.total.amount) }}</span>
      </p>

      <button type="button" class="summary__pay" :class="{ 'summary__pay--blocked': blocked }" :disabled="busy || blocked || quoting" @click="emit('pay')">
        {{ busy ? $t('pay.summary.processing') : $t('pay.summary.pay', { sum: sum(payable ?? cart.total.amount) }) }}
      </button>

      <p v-if="stockBlocked" class="summary__blocked-note">{{ $t('pay.stock.summaryNote') }}</p>

      <p class="summary__legal">{{ $t('pay.summary.holdNote') }}</p>
      <p class="summary__legal">{{ $t('pay.summary.legal') }}</p>
    </div>

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

.summary__thumbs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }

.summary__thumb {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #F4F5F7;
  overflow: hidden;
}

.summary__thumb-image { width: 100%; height: 100%; padding: 4px; object-fit: contain; mix-blend-mode: multiply; }

.summary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0 0 12px;
}

.summary__label { font-weight: 400; font-size: var(--text-base); line-height: 24px; color: var(--color-text-muted); }
.summary__value { font-weight: 500; font-size: var(--text-base); line-height: 24px; font-variant-numeric: tabular-nums; color: var(--color-text); }
.summary__value--discount { color: var(--color-brand-text); }
.summary__value--blocked { color: var(--color-danger); }

.summary__sub {
  display: block;
  font-size: var(--text-sm);
  line-height: 20px;
  color: var(--color-text-muted);
}

.summary__divider { margin: 16px 0; border: 0; border-top: 1px solid var(--color-line); }

.summary__total-label { font-weight: 700; font-size: var(--text-xl); line-height: 32px; color: var(--color-text); }
.summary__total-value { font-weight: 700; font-size: var(--text-7xl); line-height: 32px; font-variant-numeric: tabular-nums; color: var(--color-text); }

.summary__blocked-note {
  margin: 4px 0 8px;
  font-size: var(--text-xs);
  line-height: 16px;
  color: var(--color-danger);
}

.summary__pay {
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

.summary__pay:hover:not(:disabled) { background: var(--color-brand-dark); }
.summary__pay[disabled] { opacity: 0.6; cursor: progress; }
.summary__pay--blocked[disabled] { background: var(--color-field); color: var(--color-text-muted); opacity: 1; cursor: not-allowed; }

.summary__legal {
  margin: 12px 0 0;
  font-weight: 400;
  font-size: var(--text-sm);
  line-height: 20px;
  color: var(--color-text-muted);
}

.summary__promo {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: 4px;
  padding: 10px 12px;
  border: 0;
  border-radius: 14px;
  background: var(--color-brand-tint);
  cursor: pointer;
  transition: background 0.15s ease;
}

.summary__promo:hover { background: var(--color-line); }

.summary__promo-icon { display: grid; flex: none; place-items: center; color: var(--color-brand-text); }

.summary__promo-text { flex: 1; display: flex; flex-direction: column; text-align: left; }

.summary__promo-title { font-weight: 600; font-size: var(--text-sm); line-height: 20px; color: var(--color-text); }
.summary__promo-title::first-letter { text-transform: uppercase; }
.summary__promo-note { font-weight: 400; font-size: var(--text-xs); line-height: 16px; color: var(--color-text-muted); }

.summary__promo-chevron { color: var(--color-text-muted); }
</style>
