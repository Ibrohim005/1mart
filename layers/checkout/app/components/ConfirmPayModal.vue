<script setup lang="ts">
/** Подтверждение оплаты с баланса: сколько спишется и сколько останется. */
const props = defineProps<{
  modelValue: boolean
  /** Сумма заказа, тийины */
  amount: number
  /** Доступно на балансе, тийины */
  available: number
  busy?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [boolean], confirm: [] }>()

const { sum } = useMoney()
const left = computed(() => props.available - props.amount)
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('pay.confirm.title')"
    body-padding="20px 24px 24px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="confirm">
      <dl class="confirm__rows">
        <div class="confirm__row">
          <dt>{{ $t('pay.confirm.amount') }}</dt>
          <dd>{{ sum(amount) }}</dd>
        </div>
        <div class="confirm__row">
          <dt>{{ $t('pay.confirm.left') }}</dt>
          <dd>{{ sum(left) }}</dd>
        </div>
      </dl>

      <p class="confirm__note">{{ $t('pay.summary.holdNote') }}</p>

      <UiButton block :disabled="busy" @click="emit('confirm')">
        {{ busy ? $t('pay.summary.processing') : $t('pay.confirm.submit') }}
      </UiButton>
    </div>
  </UiModal>
</template>

<style scoped>
.confirm { display: flex; flex-direction: column; gap: 16px; }
.confirm__rows { margin: 0; }

.confirm__row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-block: 10px;
  border-bottom: 1px solid var(--color-line);
  font-size: var(--text-lg);
}

.confirm__row:last-child { border-bottom: 0; }
.confirm__row dt { color: var(--color-text-muted); }
.confirm__row dd { margin: 0; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--color-text); }
.confirm__note { margin: 0; font-size: var(--text-base); line-height: 20px; color: var(--color-text-muted); }
</style>
