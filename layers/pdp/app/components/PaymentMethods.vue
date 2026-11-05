<script setup lang="ts">
/**
 * Блок «Способы оплаты» на карточке товара. 1mart — только B2B: баланс компании
 * или корпоративная карта. `options` из каталога не рисуются, проп остаётся
 * ради совместимости со страницей товара.
 */
import type { PaymentOption } from '#shared/types/catalog'

defineProps<{ options?: PaymentOption[] }>()

const networks = CARD_NETWORKS
const { networkLogo, networkTitle } = use1mart()
</script>

<template>
  <section class="payments">
    <h2 class="payments__title">{{ $t('pay.pdp.title') }}</h2>

    <div class="payments__row">
      <span class="payments__icon"><UiIcon name="wallet-3-fill" :size="22" /></span>
      <div class="payments__info">
        <p class="payments__name">{{ $t('pay.payment.balance') }}</p>
        <p class="payments__note">{{ $t('pay.pdp.balanceNote') }}</p>
      </div>
    </div>

    <div class="payments__row">
      <span class="payments__icon"><UiIcon name="card-fill" :size="22" /></span>
      <div class="payments__info">
        <p class="payments__name">{{ $t('pay.payment.card') }}</p>
        <ul class="payments__logos">
          <li v-for="network in networks" :key="network" class="payments__network">
            <img :src="networkLogo(network)" :alt="networkTitle(network)" width="133" height="56">
          </li>
        </ul>
      </div>
    </div>

    <p class="payments__hint">
      <UiIcon name="info-circle" :size="18" class="payments__hint-icon" />
      {{ $t('pay.pdp.hint') }}
    </p>
  </section>
</template>

<style scoped>
.payments {
  padding: 20px;
  border-radius: 22.4px;
  background: var(--color-surface);
}

.payments__title {
  margin: 0 0 8px;
  color: var(--color-text);
  font: var(--type-card-title);
}

.payments__row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-block: 16px;
  border-bottom: 1px solid var(--color-line);
}

.payments__icon {
  display: grid;
  place-items: center;
  flex: 0 0 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-field);
  color: var(--color-text);
}

.payments__info { flex: 1; min-width: 0; }
.payments__name { margin: 0; font-weight: 600; font-size: var(--text-lg); line-height: 22px; color: var(--color-text); }
.payments__note { margin: 4px 0 0; font-size: var(--text-sm); line-height: 18px; color: var(--color-text-muted); }

/* Логотипы платёжных систем: одинаковые плитки, сами логотипы цветные, как в оригинале. */
.payments__logos { display: grid; grid-template-columns: repeat(4, 104px); gap: 8px; margin: 12px 0 0; padding: 0; list-style: none; }
.payments__network {
  display: grid;
  height: 52px;
  border-radius: 10px;
  background: var(--color-field);
  place-items: center;
}
.payments__network img { display: block; width: 104px; height: 44px; }

.payments__hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 16px 0 0;
  font-size: var(--text-sm);
  line-height: 18px;
  color: var(--color-text-muted);
}
.payments__hint-icon { flex: none; }
</style>
