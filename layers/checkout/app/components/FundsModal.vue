<script setup lang="ts">
/**
 * А3 «Недостаточно средств» (ТЗ UC-FL-10). На балансе показываем, сколько не
 * хватает, и ведём на пополнение. Остаток карты знает только банк, поэтому там
 * лишь сумма к оплате и другие способы заплатить.
 */
import type { PaymentMethod } from '#shared/types/order'

const props = defineProps<{
  modelValue: boolean
  method: PaymentMethod
  /** Сумма к оплате, тийины */
  required: number
  /** Доступно на балансе, тийины */
  available: number
  topUpLink: string
  /** Есть ли ещё привязанная карта, на которую можно переключиться */
  hasOtherCard: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [boolean], otherCard: [], addCard: [], useCard: [], useBalance: [] }>()

const { sum } = useMoney()

const shortage = computed(() => Math.max(props.required - props.available, 0))
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('pay.funds.title')"
    body-padding="20px 24px 24px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="funds">
      <p class="funds__text">{{ $t(method === 'balance' ? 'pay.funds.balanceText' : 'pay.funds.cardText') }}</p>

      <dl class="funds__rows">
        <div class="funds__row">
          <dt>{{ $t('pay.funds.required') }}</dt>
          <dd>{{ sum(required) }}</dd>
        </div>
        <template v-if="method === 'balance'">
          <div class="funds__row">
            <dt>{{ $t('pay.funds.available') }}</dt>
            <dd>{{ sum(available) }}</dd>
          </div>
          <div class="funds__row">
            <dt>{{ $t('pay.funds.short') }}</dt>
            <dd class="funds__short">{{ sum(shortage) }}</dd>
          </div>
        </template>
      </dl>

      <div v-if="method === 'balance'" class="funds__actions">
        <NuxtLink :to="topUpLink" class="funds__link">{{ $t('pay.funds.topUp') }}</NuxtLink>
        <UiButton block variant="secondary" @click="emit('useCard')">{{ $t('pay.funds.payByCard') }}</UiButton>
      </div>

      <div v-else class="funds__actions">
        <UiButton v-if="!shortage" block @click="emit('useBalance')">{{ $t('pay.funds.payByBalance') }}</UiButton>
        <UiButton v-if="hasOtherCard" block variant="secondary" @click="emit('otherCard')">{{ $t('pay.funds.otherCard') }}</UiButton>
        <UiButton block variant="secondary" @click="emit('addCard')">{{ $t('pay.payment.addCard') }}</UiButton>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.funds { display: flex; flex-direction: column; gap: 16px; }
.funds__text { margin: 0; font-size: var(--text-lg); line-height: 23px; color: var(--color-text); }
.funds__rows { margin: 0; }

.funds__row {
  display: flex;
  justify-content: space-between;
  padding-block: 10px;
  border-bottom: 1px solid var(--color-line);
  font-size: var(--text-lg);
}

.funds__row:last-child { border-bottom: 0; }
.funds__row dt { color: var(--color-text-muted); }
.funds__row dd { margin: 0; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--color-text); }
.funds__row .funds__short { color: var(--color-danger); }

.funds__actions { display: flex; flex-direction: column; gap: 10px; }

.funds__link {
  display: grid;
  place-items: center;
  background: var(--color-brand);
  color: var(--color-on-brand);
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.funds__link:hover { background: var(--color-brand-dark); }
</style>
