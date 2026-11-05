<script setup lang="ts">
/**
 * Баланс компании (B2B). Компания выставляет себе счёт, переводит деньги со своего
 * расчётного счёта на реквизиты 1mart и платит за заказы с баланса.
 */
import type { BalanceInvoice, BalanceOverview, BankDetails } from '#shared/types/order'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { money, sum } = useMoney()
const route = useRoute()
const localePath = useLocalePath()
const api = useApi()
const toast = useToast()

const { data, refresh } = await useApiData<BalanceOverview>('account:balance', '/balance')

const fromCheckout = computed(() => route.query.from === 'checkout')

/** Сумма в сумах, с разрядами: «1 500 000» */
const amountText = ref('')

function formatAmount(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 12).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const prefilled = Number(route.query.amount)
if (Number.isInteger(prefilled) && prefilled > 0) amountText.value = formatAmount(String(prefilled))

const amountSum = computed(() => Number(amountText.value.replace(/\D/g, '')))

const creating = ref(false)
const amountError = ref('')
const openInvoice = ref<BalanceInvoice | null>(null)
const crediting = ref(false)
const companyOpen = ref(false)

async function createInvoice() {
  if (creating.value) return
  if (!amountSum.value) {
    amountError.value = t('pay.balance.amountError')
    return
  }
  amountError.value = ''
  creating.value = true
  try {
    openInvoice.value = await api.post<BalanceInvoice>('/balance/invoices', { amount: amountSum.value * 100 })
    amountText.value = ''
    await refresh()
  }
  catch {
    toast.show(t('pay.balance.createError'), 'error')
  }
  finally {
    creating.value = false
  }
}

async function creditDemo(invoice: BalanceInvoice) {
  crediting.value = true
  try {
    await api.post(`/balance/invoices/${invoice.id}/credit`)
    openInvoice.value = null
    await refresh()
    toast.show(t('pay.invoice.credited'))
  }
  catch {
    toast.show(t('pay.balance.createError'), 'error')
  }
  finally {
    crediting.value = false
  }
}

function onCompanySaved(company: BankDetails) {
  if (data.value) data.value.company = company
  companyOpen.value = false
  toast.show(t('pay.company.saved'))
}

useSeoMeta({ title: () => t('pay.balance.seoTitle'), robots: 'noindex, nofollow' })
</script>

<template>
  <AccountLayout :title="$t('pay.balance.title')">
    <div v-if="data" class="balance">
      <section class="balance__hero">
        <div class="balance__funds">
          <p class="balance__label">{{ $t('pay.balance.available') }}</p>
          <p class="balance__amount">{{ money(data.available) }}</p>
          <p v-if="data.reserved.amount" class="balance__reserved">
            {{ $t('pay.balance.reserved', { sum: money(data.reserved) }) }}
          </p>
          <NuxtLink v-if="fromCheckout" :to="localePath('/checkout')" class="balance__back">
            {{ $t('pay.balance.backToCheckout') }}
          </NuxtLink>
        </div>

        <div class="balance__company">
          <p class="balance__label">{{ $t('pay.balance.company') }}</p>
          <p class="balance__company-name">{{ data.company.name }}</p>
          <p class="balance__company-inn">{{ $t('pay.company.inn') }} {{ data.company.inn }}</p>
          <button type="button" class="balance__edit" @click="companyOpen = true">{{ $t('pay.balance.editCompany') }}</button>
        </div>
      </section>

      <section class="balance__card">
        <h2 class="balance__title">{{ $t('pay.balance.topUpTitle') }}</h2>
        <form class="balance__form" @submit.prevent="createInvoice">
          <label class="balance__field">
            <span class="balance__field-label">{{ $t('pay.balance.amount') }}</span>
            <input
              :value="amountText"
              inputmode="numeric"
              autocomplete="off"
              class="balance__input"
              :aria-invalid="!!amountError"
              @input="amountText = formatAmount(($event.target as HTMLInputElement).value); ($event.target as HTMLInputElement).value = amountText"
            >
          </label>
          <UiButton type="submit" :disabled="creating">{{ $t('pay.balance.createInvoice') }}</UiButton>
        </form>
        <p v-if="amountError" class="balance__error" role="alert">{{ amountError }}</p>
        <p class="balance__hint">{{ $t('pay.balance.topUpHint') }}</p>
      </section>

      <section class="balance__card">
        <h2 class="balance__title">{{ $t('pay.balance.invoicesTitle') }}</h2>
        <ul v-if="data.invoices.length" class="balance__list">
          <li v-for="invoice in data.invoices" :key="invoice.id" class="balance__row">
            <span class="balance__row-main">
              <span class="balance__row-title">{{ $t('pay.balance.invoiceNumber', { number: invoice.number }) }}</span>
              <span class="balance__row-date">{{ invoice.createdAt }}</span>
            </span>
            <span class="balance__chip" :class="`balance__chip--${invoice.status}`">{{ $t(`pay.balance.status.${invoice.status}`) }}</span>
            <span class="balance__row-sum">{{ money(invoice.amount) }}</span>
            <button type="button" class="balance__open" @click="openInvoice = invoice">{{ $t('pay.balance.view') }}</button>
          </li>
        </ul>
        <p v-else class="balance__empty">{{ $t('pay.balance.invoicesEmpty') }}</p>
      </section>

      <section class="balance__card">
        <h2 class="balance__title">{{ $t('pay.balance.operationsTitle') }}</h2>
        <ul v-if="data.operations.length" class="balance__list">
          <li v-for="item in data.operations" :key="item.id" class="balance__row">
            <span class="balance__row-main">
              <span class="balance__row-title">{{ $t(`pay.balance.op.${item.kind}`, { reference: item.reference }) }}</span>
              <span class="balance__row-date">{{ item.date }}</span>
            </span>
            <span class="balance__row-sum" :class="{ 'balance__row-sum--in': item.amount.amount > 0 }">
              {{ item.amount.amount > 0 ? '+' : '-' }} {{ sum(Math.abs(item.amount.amount)) }}
            </span>
          </li>
        </ul>
        <p v-else class="balance__empty">{{ $t('pay.balance.operationsEmpty') }}</p>
      </section>

      <AccountInvoiceModal
        :invoice="openInvoice"
        :requisites="data.requisites"
        :company="data.company"
        :demo="data.demo"
        :busy="crediting"
        @close="openInvoice = null"
        @credit="creditDemo"
      />

      <AccountCompanyModal
        v-model="companyOpen"
        :company="data.company"
        @saved="onCompanySaved"
      />
    </div>
  </AccountLayout>
</template>

<style scoped>
.balance { display: flex; flex-direction: column; gap: 16px; }

.balance__hero {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  padding: 24px;
  border-radius: 20px;
  background: var(--color-surface);
}

.balance__label { margin: 0 0 8px; font-size: var(--text-base); line-height: 20px; color: var(--color-text-muted); }

.balance__amount {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-9xl);
  line-height: 40px;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.balance__reserved { margin: 8px 0 0; font-size: var(--text-base); font-variant-numeric: tabular-nums; color: var(--color-text-muted); }

.balance__back {
  display: inline-block;
  margin-top: 16px;
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--color-brand-text);
  text-decoration: underline;
}

.balance__company { padding-left: 24px; border-left: 1px solid var(--color-line); }
.balance__company-name { margin: 0; font-weight: 600; font-size: var(--text-lg); line-height: 22px; color: var(--color-text); }
.balance__company-inn { margin: 4px 0 0; font-size: var(--text-sm); font-variant-numeric: tabular-nums; color: var(--color-text-muted); }

.balance__edit {
  margin-top: 8px;
  padding: 0;
  border: 0;
  background: none;
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--color-brand-text);
  text-decoration: underline;
  cursor: pointer;
}

.balance__card { padding: 24px; border-radius: 20px; background: var(--color-surface); }

.balance__title {
  margin: 0 0 16px;
  font: var(--type-section-title);
  color: var(--color-text);
}

.balance__form { display: flex; align-items: flex-end; gap: 12px; }
.balance__field { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.balance__field-label { font: var(--type-label); color: var(--label-color); }

.balance__input {
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

.balance__input:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.balance__error { margin: 8px 0 0; font-size: var(--text-base); color: var(--color-danger); }
.balance__hint { margin: 12px 0 0; font-size: var(--text-base); line-height: 20px; color: var(--color-text-muted); }

.balance__list { margin: 0; padding: 0; list-style: none; }

.balance__row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-block: 14px;
  border-top: 1px solid var(--color-line);
}

.balance__row:first-child { border-top: 0; padding-top: 0; }
.balance__row:last-child { padding-bottom: 0; }

.balance__row-main { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.balance__row-title { font-weight: 600; font-size: var(--text-lg); line-height: 20px; color: var(--color-text); }
.balance__row-date { font-size: var(--text-sm); color: var(--color-text-muted); }
.balance__row-sum { font-weight: 600; font-size: var(--text-lg); font-variant-numeric: tabular-nums; color: var(--color-text); }
.balance__row-sum--in { color: var(--color-brand-text); }

.balance__chip { padding: 4px 10px; border-radius: 8px; font-weight: 500; font-size: var(--text-sm); }
.balance__chip--awaiting { background: var(--color-field); color: var(--color-text); }
.balance__chip--credited { background: var(--badge-cheaper-bg); color: var(--color-brand-text-hover); }

.balance__open {
  padding: 8px 12px;
  border: 1px solid var(--color-line);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  font: var(--type-button-sm);
}

.balance__open:hover { background: var(--color-field); }

.balance__empty { margin: 0; font-size: var(--text-base); color: var(--color-text-muted); }
</style>
