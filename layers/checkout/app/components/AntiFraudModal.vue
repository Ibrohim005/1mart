<script setup lang="ts">
/**
 * Предупреждение перед КАЖДОЙ финансовой операцией (ТЗ п.4.1.6.11 п.9):
 * покупатель подтверждает, что действует сам, без указаний третьих лиц.
 * «Продолжить» недоступна, пока галочка не стоит.
 */
const props = defineProps<{
  modelValue: boolean
  /** Сумма операции, тийины — чтобы человек видел, что подтверждает */
  amount: number
}>()
const emit = defineEmits<{ 'update:modelValue': [boolean], confirm: [] }>()

const { sum } = useMoney()
const agreed = ref(false)

// Галочка не переживает закрытие: следующая операция — новое подтверждение
watch(() => props.modelValue, (open) => {
  if (open) agreed.value = false
})
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('pay.antifraud.title')"
    body-padding="20px 24px 24px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="fraud">
      <span class="fraud__mark" aria-hidden="true">!</span>
      <p class="fraud__lead">{{ $t('pay.antifraud.lead') }}</p>
      <ul class="fraud__list">
        <li>{{ $t('pay.antifraud.point1') }}</li>
        <li>{{ $t('pay.antifraud.point2') }}</li>
        <li>{{ $t('pay.antifraud.point3') }}</li>
      </ul>

      <p class="fraud__amount">
        {{ $t('pay.antifraud.purchaseAmount') }}
        <strong>{{ sum(amount) }}</strong>
      </p>

      <label class="fraud__check">
        <input v-model="agreed" type="checkbox" class="fraud__input">
        <span>{{ $t('pay.antifraud.checkbox') }}</span>
      </label>

      <div class="fraud__actions">
        <UiButton variant="secondary" @click="emit('update:modelValue', false)">{{ $t('pay.common.cancel') }}</UiButton>
        <UiButton :disabled="!agreed" @click="emit('confirm')">{{ $t('pay.common.continue') }}</UiButton>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.fraud { display: flex; flex-direction: column; gap: 14px; }

.fraud__mark {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #FFF1E6;
  font-weight: 800;
  font-size: var(--text-5xl);
  color: #D9480F;
}

.fraud__lead { margin: 0; font-weight: 600; font-size: var(--text-xl); line-height: 26px; color: var(--color-text); }

.fraud__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding-left: 20px;
  font-size: var(--text-lg);
  line-height: 22px;
  color: var(--color-text);
}

.fraud__amount {
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: #F4F6F8;
  font-size: var(--text-lg);
  color: var(--color-text-muted);
}

.fraud__amount strong { color: var(--color-text); }

.fraud__check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-weight: 500;
  font-size: var(--text-lg);
  line-height: 22px;
  color: var(--color-text);
  cursor: pointer;
}

.fraud__input { flex: none; width: 20px; height: 20px; margin-top: 1px; accent-color: var(--color-brand); }

.fraud__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px; }
</style>
