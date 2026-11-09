<script setup lang="ts">
import type { FinanceOverview } from '#shared/types/merchant'
import type { Money } from '#shared/types/catalog'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const { money } = useMoney()
const localePath = useLocalePath()

const { data, status, error, refresh } = await useApiData<FinanceOverview>('m:finance', '/merchant/finance/overview')

const tiles = computed(() => {
  const d = data.value
  if (!d) return []
  return [
    { label: t('m.finance.available'), value: money(d.balance.available), icon: 'wallet-money-fill', tone: 'brand' as const },
    { label: t('m.finance.pending'), value: money(d.balance.pending), icon: 'clock-fill', tone: 'accent' as const },
    { label: t('m.finance.periodRevenue'), value: money(d.periodRevenue), icon: 'receipt-item-fill', tone: 'info' as const },
    { label: t('m.finance.periodCommission'), value: money(d.periodCommission), icon: 'percentage-square-fill', tone: 'violet' as const },
  ]
})

const recentColumns = [
  { key: 'date', label: t('m.transactions.colDate') },
  { key: 'type', label: t('m.transactions.colType') },
  { key: 'description', label: t('m.transactions.colDescription') },
  { key: 'amount', label: t('m.transactions.colAmount'), align: 'right' as const },
  { key: 'balanceAfter', label: t('m.transactions.colBalance'), align: 'right' as const },
]

const sign = (m: Money) => (m.amount >= 0 ? 'fin__pos' : 'fin__neg')

useSeoMeta({ title: () => `${t('m.finance.title')} — spotshop Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.finance.title')" :subtitle="$t('m.finance.subtitle')">
      <NuxtLink :to="localePath('/finance/balance')">
        <UiButton variant="primary">{{ $t('m.finance.requestPayout') }}</UiButton>
      </NuxtLink>
    </MPageHeader>

    <div v-if="status === 'pending' && !data" class="fin__tiles">
      <UiSkeleton v-for="n in 4" :key="n" height="116px" radius="18px" />
    </div>

    <template v-else-if="data">
      <div class="fin__tiles m-stagger">
        <MStatTile v-for="tile in tiles" :key="tile.label" :label="tile.label" :value="tile.value" :icon="tile.icon" :tone="tile.tone" />
      </div>

      <div v-if="data.nextPayout" class="fin__next">
        <span class="fin__next-ic"><UiIcon name="money-recive-fill" :size="22" /></span>
        <div class="fin__next-text">
          <span class="fin__next-label">{{ $t('m.finance.nextPayout') }}</span>
          <span class="fin__next-value m-tnum">{{ money(data.nextPayout.amount) }}</span>
        </div>
        <span class="fin__next-date m-tnum">{{ formatDate(new Date(data.nextPayout.date)) }}</span>
      </div>

      <MCard :title="$t('m.finance.recent')" flush>
        <template #actions>
          <NuxtLink :to="localePath('/finance/transactions')" class="fin__link">{{ $t('m.finance.viewTransactions') }}</NuxtLink>
        </template>
        <MTable :columns="recentColumns" :rows="data.recentTransactions" row-key="id">
          <template #cell-date="{ value }"><span class="m-tnum">{{ formatDate(new Date(value as string)) }}</span></template>
          <template #cell-type="{ value }">{{ $t(`m.txType.${value}`) }}</template>
          <template #cell-amount="{ value }">
            <span class="m-tnum" :class="sign(value as Money)">{{ money(value as Money) }}</span>
          </template>
          <template #cell-balanceAfter="{ value }"><span class="m-tnum">{{ money(value as Money) }}</span></template>
        </MTable>
      </MCard>
    </template>
    <MCard v-else-if="error"><MLoadError @retry="refresh()" /></MCard>
  </div>
</template>

<style scoped>
.fin__tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.fin__next {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: 16px; padding: 18px 22px;
  border: 1px solid var(--m-brand-tint-2); border-radius: var(--m-radius-lg);
  background: var(--m-brand-tint);
}
.fin__next-ic {
  display: grid; width: 44px; height: 44px; flex: none;
  border-radius: var(--m-radius); background: var(--m-surface); color: var(--m-brand-strong);
  place-items: center;
}
.fin__next-text { display: flex; flex-direction: column; gap: 2px; }
.fin__next-label { font-size: var(--text-sm); color: var(--m-brand-ink); }
.fin__next-value { font-family: var(--font-display); font-weight: 700; font-size: var(--text-6xl); letter-spacing: -0.01em; color: var(--m-ink); }
.fin__next-date { margin-left: auto; font-size: var(--text-md); color: var(--m-slate); }
.fin__link { color: var(--m-brand-strong); font-weight: 600; font-size: var(--text-sm); text-decoration: none; }
.fin__link:hover { text-decoration: underline; }
.fin__pos { color: var(--m-success-fg); font-weight: 600; }
.fin__neg { color: var(--m-danger-fg); font-weight: 600; }
</style>
