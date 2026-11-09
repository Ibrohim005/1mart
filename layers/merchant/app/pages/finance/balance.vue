<script setup lang="ts">
import type { BalanceState, CompanyProfile } from '#shared/types/merchant'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const { money } = useMoney()
const localePath = useLocalePath()
const api = useApi()
const toast = useToast()

const { data, status, error: loadError, refresh } = await useApiData<BalanceState>('m:balance', '/merchant/finance/balance')

/** Счёт зачисления - расчётный счёт из профиля компании */
const { data: company } = await useApiData<CompanyProfile>('m:company', '/merchant/company', { lazy: true })
const destination = computed(() => {
  const requisites = company.value?.requisites
  if (!requisites) return ''
  return `${requisites.bankName} · **** ${requisites.bankAccount.replace(/\D/g, '').slice(-4)}`
})

const payoutOpen = ref(false)
const amount = ref('')
const error = ref('')
const submitting = ref(false)

const maxSum = computed(() => (data.value ? toSum(data.value.available) : 0))

// Доступно — крупная градиентная плашка; остальные — светлые с иконкой-чипом.
const secondary = computed(() => {
  const d = data.value
  if (!d) return []
  return [
    { key: 'pending', label: t('m.finance.pending'), value: money(d.pending), icon: 'clock-fill', tone: 'accent' },
    { key: 'hold', label: t('m.finance.hold'), value: money(d.hold), icon: 'security-fill', tone: 'violet' },
    { key: 'lifetime', label: t('m.finance.lifetime'), value: money(d.lifetimeEarned), icon: 'status-up-fill', tone: 'success' },
  ]
})

function openPayout() {
  amount.value = ''
  error.value = ''
  payoutOpen.value = true
}
function fillMax() {
  amount.value = String(Math.floor(maxSum.value))
  error.value = ''
}

async function submitPayout() {
  // Разделители разрядов не считаем ошибкой, а копейки принимать незачем: сумма - целые сумы
  const value = Number(amount.value.replace(/\s/g, ''))
  if (!value || value <= 0) { error.value = t('m.payout.errAmount'); return }
  if (!Number.isInteger(value)) { error.value = t('m.payout.errInteger'); return }
  if (value > maxSum.value) { error.value = t('m.payout.errTooMuch'); return }
  submitting.value = true
  try {
    await api.post('/merchant/finance/payouts', { amount: value })
    payoutOpen.value = false
    toast.show(t('m.payout.requested'))
    await refresh()
    await navigateTo(localePath('/finance/payouts'))
  }
  catch {
    error.value = t('m.common.loadError')
  }
  finally {
    submitting.value = false
  }
}

useSeoMeta({ title: () => `${t('m.balance.title')} — spotshop Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.balance.title')" :subtitle="$t('m.balance.subtitle')">
      <UiButton variant="primary" :disabled="!data || maxSum <= 0" @click="openPayout">
        {{ $t('m.balance.requestPayout') }}
      </UiButton>
    </MPageHeader>

    <div v-if="status === 'pending' && !data" class="bal__cards">
      <UiSkeleton v-for="n in 4" :key="n" height="150px" radius="18px" />
    </div>

    <template v-else-if="data">
      <div class="bal__cards">
        <div class="bal__available">
          <div class="bal__available-bg" aria-hidden="true"><span class="bal__available-grid" /></div>
          <div class="bal__available-head">
            <span class="bal__available-label">{{ $t('m.finance.available') }}</span>
            <UiIcon name="wallet-money-fill" :size="22" class="bal__available-ic" />
          </div>
          <span class="bal__available-value m-tnum">{{ money(data.available) }}</span>
          <UiButton variant="secondary" :disabled="maxSum <= 0" class="bal__available-cta" @click="openPayout">
            {{ $t('m.balance.requestPayout') }}
          </UiButton>
        </div>

        <div v-for="card in secondary" :key="card.key" class="bal__card">
          <span class="bal__card-ic" :class="`bal__card-ic--${card.tone}`"><UiIcon :name="card.icon" :size="20" /></span>
          <span class="bal__card-label">{{ card.label }}</span>
          <span class="bal__card-value m-tnum">{{ card.value }}</span>
        </div>
      </div>

      <MCard :title="$t('m.balance.howItWorks')" class="bal__how">
        <ol class="bal__steps">
          <li><span class="bal__step-num">1</span>{{ $t('m.balance.step1') }}</li>
          <li><span class="bal__step-num">2</span>{{ $t('m.balance.step2') }}</li>
          <li><span class="bal__step-num">3</span>{{ $t('m.balance.step3') }}</li>
        </ol>
      </MCard>
    </template>

    <MCard v-if="!data && loadError"><MLoadError @retry="refresh()" /></MCard>

    <UiModal v-model="payoutOpen" :title="$t('m.payout.dialogTitle')">
      <form class="bal__form" @submit.prevent="submitPayout">
        <div class="bal__amount">
          <MField
            v-model="amount"
            :label="$t('m.payout.amount')"
            type="text"
            inputmode="numeric"
            :hint="$t('m.payout.amountHint', { max: money(data!.available) })"
            :error="error"
            class="bal__amount-field"
          />
          <button type="button" class="bal__max" @click="fillMax">{{ $t('m.payout.max') }}</button>
        </div>
        <div class="bal__dest">
          <span class="bal__dest-ic"><UiIcon name="building-fill" :size="20" /></span>
          <span class="bal__dest-text">
            <span class="bal__dest-label">{{ $t('m.payout.destination') }}</span>
            <span class="bal__dest-value m-tnum">{{ destination }}</span>
          </span>
        </div>
        <UiButton type="submit" variant="primary" size="lg" block :disabled="submitting">
          {{ $t('m.payout.submit') }}
        </UiButton>
      </form>
    </UiModal>
  </div>
</template>

<style scoped>
.bal__cards { display: grid; grid-template-columns: 1.3fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px; align-items: stretch; }

/* Доступно к выводу — крупная фирменная плашка */
.bal__available {
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; gap: 10px;
  padding: 24px; border-radius: var(--m-radius-lg);
  background: var(--m-hero-gradient); box-shadow: var(--m-shadow-brand); color: var(--m-on-dark);
}
.bal__available-bg { position: absolute; inset: 0; pointer-events: none; }
.bal__available-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgb(255 255 255 / 6%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 6%) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(120% 120% at 100% 0%, #000 20%, transparent 70%);
}
.bal__available-head { position: relative; display: flex; align-items: center; justify-content: space-between; }
.bal__available-label { font-size: var(--text-sm); font-weight: 500; opacity: 0.9; }
.bal__available-ic { opacity: 0.85; }
.bal__available-value { position: relative; font-family: var(--font-display); font-weight: 700; font-size: var(--text-9xl); letter-spacing: -0.02em; line-height: 1.05; }
.bal__available-cta { position: relative; margin-top: auto; }

/* Остальные плашки — светлые с иконкой-чипом */
.bal__card {
  display: flex; flex-direction: column; gap: 10px;
  padding: 22px; border: 1px solid var(--m-line); border-radius: var(--m-radius-lg);
  background: var(--m-surface); box-shadow: var(--m-shadow-sm);
}
.bal__card-ic { display: grid; width: 38px; height: 38px; border-radius: var(--m-radius-sm); place-items: center; }
.bal__card-ic--accent { background: var(--m-accent-bg); color: var(--m-accent-fg); }
.bal__card-ic--violet { background: var(--m-violet-bg); color: var(--m-violet-fg); }
.bal__card-ic--success { background: var(--m-success-bg); color: var(--m-success-fg); }
.bal__card-label { font-size: var(--text-sm); color: var(--m-slate); }
.bal__card-value { margin-top: auto; font-family: var(--font-display); font-weight: 700; font-size: var(--text-6xl); letter-spacing: -0.01em; color: var(--m-ink); }

.bal__how { max-width: 760px; }
.bal__steps { display: flex; flex-direction: column; gap: 14px; margin: 0; padding: 0; list-style: none; }
.bal__steps li { display: flex; align-items: flex-start; gap: 12px; font-size: var(--text-md); color: var(--m-ink-soft); }
.bal__step-num {
  display: grid; width: 26px; height: 26px; flex: none;
  border-radius: 8px; background: var(--m-brand-tint);
  font-size: var(--text-xs); font-weight: 700; color: var(--m-brand-strong);
  font-variant-numeric: tabular-nums;
  place-items: center;
}

.bal__form { display: flex; flex-direction: column; gap: 18px; }
.bal__amount { position: relative; }
.bal__max {
  position: absolute; top: 34px; right: 10px;
  height: 30px; padding-inline: 12px; border: 0; border-radius: var(--m-radius-sm);
  background: var(--m-brand-tint); font-size: var(--text-xs); font-weight: 600; color: var(--m-brand-strong); cursor: pointer;
}
.bal__max:hover { background: var(--m-brand-tint-2); }
.bal__dest {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border: 1px solid var(--m-line); border-radius: var(--m-radius); background: var(--m-surface-sunken);
}
.bal__dest-ic { display: grid; width: 40px; height: 40px; flex: none; border-radius: var(--m-radius-sm); background: var(--m-surface); color: var(--m-brand-strong); place-items: center; }
.bal__dest-text { display: flex; flex-direction: column; }
.bal__dest-label { font-size: var(--text-xs); color: var(--m-slate); }
.bal__dest-value { font-weight: 600; color: var(--m-ink); }
</style>
