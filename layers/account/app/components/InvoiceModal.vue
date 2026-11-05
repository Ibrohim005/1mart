<script setup lang="ts">
/**
 * Счёт на пополнение: куда перевести, сколько и с каким назначением.
 * Номер счёта в назначении связывает перевод с компанией.
 */
import type { BalanceInvoice, BankDetails } from '#shared/types/order'

const props = defineProps<{
  invoice: BalanceInvoice | null
  requisites: BankDetails
  company: BankDetails
  /** Реквизиты тестовые: предупреждаем и даём сымитировать поступление */
  demo?: boolean
  busy?: boolean
}>()
const emit = defineEmits<{ close: [], credit: [BalanceInvoice] }>()

const { t } = useI18n()
const { money } = useMoney()
const toast = useToast()

const purpose = computed(() => (props.invoice
  ? t('pay.invoice.purposeText', { number: props.invoice.number, inn: props.company.inn })
  : ''))

const rows = computed(() => [
  { label: t('pay.invoice.recipient'), value: props.requisites.name },
  { label: t('pay.company.inn'), value: props.requisites.inn },
  { label: t('pay.company.bank'), value: props.requisites.bank },
  { label: t('pay.company.mfo'), value: props.requisites.mfo },
  { label: t('pay.company.account'), value: props.requisites.account },
  { label: t('pay.invoice.purpose'), value: purpose.value },
])

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.show(t('pay.invoice.copied'))
  }
  catch {
    toast.show(t('pay.invoice.copyError'), 'error')
  }
}

const copyAll = () => copy(rows.value.map(row => `${row.label}: ${row.value}`).join('\n'))
</script>

<template>
  <UiModal
    :model-value="!!invoice"
    :title="invoice ? $t('pay.balance.invoiceNumber', { number: invoice.number }) : ''"
    body-padding="20px 24px 24px"
    @update:model-value="!$event && emit('close')"
  >
    <div v-if="invoice" class="invoice">
      <p v-if="demo" class="invoice__demo" role="note">{{ $t('pay.invoice.demoNotice') }}</p>

      <div class="invoice__total">
        <span class="invoice__total-label">{{ $t('pay.invoice.amount') }}</span>
        <span class="invoice__total-value">{{ money(invoice.amount) }}</span>
      </div>

      <dl class="invoice__rows">
        <div v-for="row in rows" :key="row.label" class="invoice__row">
          <div class="invoice__row-text">
            <dt>{{ row.label }}</dt>
            <dd>{{ row.value }}</dd>
          </div>
          <button type="button" class="invoice__copy" :aria-label="$t('pay.invoice.copyField', { field: row.label })" @click="copy(row.value)">
            <UiIcon name="copy" color="currentColor" :size="20" />
          </button>
        </div>
      </dl>

      <p class="invoice__note">{{ $t('pay.invoice.note', { company: company.name }) }}</p>

      <UiButton block variant="secondary" @click="copyAll">{{ $t('pay.invoice.copyAll') }}</UiButton>
      <UiButton v-if="demo && invoice.status === 'awaiting'" block :disabled="busy" @click="emit('credit', invoice)">
        {{ $t('pay.invoice.demoCredit') }}
      </UiButton>
    </div>
  </UiModal>
</template>

<style scoped>
.invoice { display: flex; flex-direction: column; gap: 12px; }

.invoice__demo {
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--color-field);
  font-weight: 500;
  font-size: var(--text-base);
  line-height: 20px;
  color: var(--color-danger);
}

.invoice__total { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
.invoice__total-label { font-size: var(--text-lg); color: var(--color-text-muted); }
.invoice__total-value { font-weight: 700; font-size: var(--text-7xl); line-height: 32px; font-variant-numeric: tabular-nums; color: var(--color-text); }

.invoice__rows { margin: 0; }

.invoice__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-block: 10px;
  border-top: 1px solid var(--color-line);
}

.invoice__row-text { flex: 1; min-width: 0; }
.invoice__row dt { font-size: var(--text-sm); line-height: 18px; color: var(--color-text-muted); }
.invoice__row dd { margin: 2px 0 0; font-weight: 500; font-size: var(--text-base); line-height: 20px; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; color: var(--color-text); }

.invoice__copy {
  display: grid;
  flex: none;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 10px;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
}

.invoice__copy:hover { background: var(--color-field); color: var(--color-text); }

.invoice__note { margin: 0; font-size: var(--text-sm); line-height: 18px; color: var(--color-text-muted); }
</style>
