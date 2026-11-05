<script setup lang="ts">
/**
 * Привязка корпоративной карты на оформлении: UzCard, Humo, Visa, Mastercard.
 * Личную карту сервер отклоняет: он видит эмитента, браузер нет.
 * Полный номер уходит один раз в запросе и дальше нигде не хранится —
 * сервер возвращает карту уже замаскированной.
 */
import type { PaymentCardInfo } from '#shared/types/order'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean], saved: [PaymentCardInfo] }>()

const api = useApi()
const { t } = useI18n()

const number = ref('')
const expires = ref('')
const error = ref('')
const busy = ref(false)

watch(() => props.modelValue, (open) => {
  if (!open) return
  number.value = ''
  expires.value = ''
  error.value = ''
})

function onNumber(event: Event) {
  const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16)
  number.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function onExpires(event: Event) {
  const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
  expires.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

const network = computed(() => {
  const pan = number.value.replace(/\D/g, '')
  if (pan.startsWith('8600') || pan.startsWith('5614')) return 'UzCard'
  if (pan.startsWith('9860')) return 'Humo'
  if (pan.startsWith('4')) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(pan)) return 'Mastercard'
  return ''
})

const ready = computed(() => number.value.replace(/\D/g, '').length === 16 && /^\d{2}\/\d{2}$/.test(expires.value))

const ADD_CARD_ERRORS: Record<string, string> = {
  card_expires: 'pay.addCard.errorExpires',
  card_not_corporate: 'pay.addCard.errorCorporate',
}

async function save() {
  if (!ready.value || busy.value) return
  busy.value = true
  error.value = ''
  try {
    const card = await api.post<PaymentCardInfo>('/user/cards', { number: number.value.replace(/\D/g, ''), expires: expires.value })
    number.value = ''
    emit('saved', card)
  }
  catch (err) {
    const code = ((err as { data?: Array<{ code: string }> }).data ?? [])[0]?.code
    error.value = t(ADD_CARD_ERRORS[code ?? ''] ?? 'pay.addCard.errorNumber')
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('pay.addCard.title')"
    body-padding="20px 24px 24px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="add-card" @submit.prevent="save">
      <label class="add-card__field">
        <span class="add-card__label">{{ $t('pay.addCard.number') }}</span>
        <span class="add-card__input-wrap">
          <input
            :value="number"
            class="add-card__input"
            type="text"
            inputmode="numeric"
            autocomplete="cc-number"
            placeholder="0000 0000 0000 0000"
            @input="onNumber"
          >
          <span v-if="network" class="add-card__network">{{ network }}</span>
        </span>
      </label>

      <label class="add-card__field add-card__field--short">
        <span class="add-card__label">{{ $t('pay.addCard.expires') }}</span>
        <input
          :value="expires"
          class="add-card__input"
          type="text"
          inputmode="numeric"
          autocomplete="cc-exp"
          placeholder="MM/YY"
          @input="onExpires"
        >
      </label>

      <p class="add-card__note">{{ $t('pay.addCard.note') }}</p>
      <p v-if="error" class="add-card__error" role="alert">{{ error }}</p>

      <UiButton block type="submit" :disabled="!ready || busy">{{ $t('pay.addCard.save') }}</UiButton>
    </form>
  </UiModal>
</template>

<style scoped>
.add-card { display: flex; flex-direction: column; gap: 16px; }
.add-card__field { display: flex; flex-direction: column; gap: 8px; }
.add-card__field--short { width: 160px; }
.add-card__label { font: var(--type-label); color: var(--label-color); }
.add-card__input-wrap { position: relative; display: block; }

.add-card__input {
  width: 100%;
  height: 56px;
  padding-inline: 16px;
  border: 1.5px solid #E4E7EC;
  border-radius: 12px;
  background: #F9FAFB;
  outline: none;
  letter-spacing: 1px;
  font: var(--type-input);
  color: var(--input-color);
}

.add-card__input:focus { border-color: var(--color-brand); background: var(--color-surface); }

.add-card__network {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  font-weight: 700;
  font-size: var(--text-base);
  color: var(--color-text-muted);
}

.add-card__note { margin: 0; font-size: var(--text-base); line-height: 20px; color: var(--color-text-muted); }
.add-card__error { margin: 0; font-size: var(--text-base); color: var(--color-danger, #E53935); }
</style>
