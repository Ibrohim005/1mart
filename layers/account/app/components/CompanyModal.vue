<script setup lang="ts">
/** Реквизиты компании-покупателя: от неё приходят переводы на баланс. */
import type { BankDetails } from '#shared/types/order'

const props = defineProps<{ modelValue: boolean, company: BankDetails }>()
const emit = defineEmits<{ 'update:modelValue': [boolean], saved: [BankDetails] }>()

const api = useApi()
const toast = useToast()
const { t } = useI18n()

const form = reactive<BankDetails>({ ...props.company })
const errors = ref<Partial<Record<keyof BankDetails, string>>>({})
const busy = ref(false)

watch(() => props.modelValue, (open) => {
  if (!open) return
  Object.assign(form, props.company)
  errors.value = {}
})

const fields: Array<{ key: keyof BankDetails, numeric?: boolean, maxlength?: number }> = [
  { key: 'name' },
  { key: 'inn', numeric: true, maxlength: 9 },
  { key: 'bank' },
  { key: 'mfo', numeric: true, maxlength: 5 },
  { key: 'account', numeric: true, maxlength: 20 },
]

async function save() {
  if (busy.value) return
  busy.value = true
  errors.value = {}
  try {
    emit('saved', await api.patch<BankDetails>('/user/company', { ...form }))
  }
  catch (err) {
    const list = (err as { data?: Array<{ field?: keyof BankDetails }> }).data ?? []
    if (!list.length) toast.show(t('pay.balance.createError'), 'error')
    errors.value = Object.fromEntries(list
      .filter(item => item.field)
      .map(item => [item.field, t(`pay.company.error.${item.field}`)]))
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('pay.company.title')"
    body-padding="20px 24px 24px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="company" @submit.prevent="save">
      <label v-for="field in fields" :key="field.key" class="company__field">
        <span class="company__label">{{ $t(`pay.company.${field.key}`) }}</span>
        <input
          v-model.trim="form[field.key]"
          class="company__input"
          :inputmode="field.numeric ? 'numeric' : 'text'"
          :maxlength="field.maxlength"
          :aria-invalid="!!errors[field.key]"
        >
        <span v-if="errors[field.key]" class="company__error" role="alert">{{ errors[field.key] }}</span>
      </label>

      <UiButton type="submit" block :disabled="busy">{{ $t('pay.company.save') }}</UiButton>
    </form>
  </UiModal>
</template>

<style scoped>
.company { display: flex; flex-direction: column; gap: 12px; }
.company__field { display: flex; flex-direction: column; gap: 6px; }
.company__label { font: var(--type-label); color: var(--label-color); }

.company__input {
  width: 100%;
  height: var(--control-height, 52px);
  padding-inline: 16px;
  border: 1px solid var(--color-line);
  border-radius: var(--control-radius, 14px);
  background: var(--color-page);
  font-variant-numeric: tabular-nums;
  font: var(--type-input);
  color: var(--input-color);
}

.company__input:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.company__input[aria-invalid="true"] { border-color: var(--color-danger); }

.company__error { font-size: var(--text-sm); color: var(--color-danger); }
</style>
