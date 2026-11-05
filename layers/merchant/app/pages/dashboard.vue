<script setup lang="ts">
import type { DashboardSummary } from '#shared/types/merchant'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const { money } = useMoney()
const localePath = useLocalePath()
const statusMeta = useStatusMeta()

const { data, status, error, refresh } = await useApiData<DashboardSummary>('m:dashboard', '/merchant/dashboard')

const tiyinMoney = (amount: number) => money({ amount, currency: 'UZS' as const })

const kpis = computed(() => {
  const d = data.value
  if (!d) return []
  return [
    { label: t('m.dashboard.kpiRevenue'), value: tiyinMoney(d.revenue.value), delta: d.revenue.deltaPct, icon: 'wallet-money-fill', tone: 'brand' as const },
    { label: t('m.dashboard.kpiOrders'), value: String(d.orders.value), delta: d.orders.deltaPct, icon: 'bag-2-fill', tone: 'info' as const },
    { label: t('m.dashboard.kpiAvgCheck'), value: tiyinMoney(d.avgCheck.value), delta: d.avgCheck.deltaPct, icon: 'receipt-item-fill', tone: 'accent' as const },
    { label: t('m.dashboard.kpiConversion'), value: `${d.conversion.value}%`, delta: d.conversion.deltaPct, icon: 'status-up-fill', tone: 'success' as const },
  ]
})

/** Что требует действия сегодня: только то, где есть что делать */
const attention = computed(() => {
  const a = data.value?.attention
  if (!a) return []
  return [
    { key: 'newOrders', count: a.newOrders, icon: 'bag-2-fill', to: '/orders?status=new' },
    { key: 'moderation', count: a.moderation, icon: 'box-fill', to: '/products?status=moderation' },
    { key: 'outOfStock', count: a.outOfStock, icon: 'warning-2', to: '/products?status=active' },
    { key: 'unansweredReviews', count: a.unansweredReviews, icon: 'star-fill', to: '/reviews?status=unanswered' },
    { key: 'openTickets', count: a.openTickets, icon: 'headphone-fill', to: '/support' },
  ].filter(item => item.count > 0)
})

const chartPoints = computed(() =>
  (data.value?.salesSeries ?? []).map(p => ({
    label: p.date.slice(8, 10) + '.' + p.date.slice(5, 7),
    value: toSum(p.revenue),
  })))

const funnelLabels: Record<string, string> = {
  views: 'm.dashboard.funnelViews',
  cart: 'm.dashboard.funnelCart',
  checkout: 'm.dashboard.funnelCheckout',
  paid: 'm.dashboard.funnelPaid',
}
const funnelLabel = (code: string) => funnelLabels[code] ?? code
const funnelMax = computed(() => Math.max(1, ...(data.value?.funnel ?? []).map(f => f.value)))

const recentColumns = [
  { key: 'number', label: t('m.orders.colNumber') },
  { key: 'createdAt', label: t('m.orders.colDate') },
  { key: 'customerName', label: t('m.orders.colCustomer') },
  { key: 'total', label: t('m.orders.colTotal'), align: 'right' as const },
  { key: 'statusCode', label: t('m.orders.filterStatus') },
]

useSeoMeta({ title: () => `${t('m.dashboard.title')} — 1mart Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.dashboard.title')" :subtitle="$t('m.dashboard.subtitle')">
      <NuxtLink :to="localePath('/finance/balance')">
        <UiButton variant="primary">{{ $t('m.dashboard.requestPayout') }}</UiButton>
      </NuxtLink>
    </MPageHeader>

    <template v-if="status === 'pending' && !data">
      <div class="dash__kpis">
        <UiSkeleton v-for="n in 4" :key="n" height="116px" radius="18px" />
      </div>
    </template>

    <template v-else-if="data">
      <section v-if="attention.length" class="dash__attention" :aria-label="$t('m.dashboard.attentionTitle')">
        <h2 class="dash__attention-title">{{ $t('m.dashboard.attentionTitle') }}</h2>
        <NuxtLink v-for="item in attention" :key="item.key" :to="localePath(item.to)" class="dash__attention-item">
          <UiIcon :name="item.icon" :size="18" />
          <span>{{ $t(`m.dashboard.attention.${item.key}`) }}</span>
          <b class="m-tnum">{{ item.count }}</b>
        </NuxtLink>
      </section>

      <!-- KPI -->
      <div class="dash__kpis m-stagger">
        <MStatTile
          v-for="kpi in kpis"
          :key="kpi.label"
          :label="kpi.label"
          :value="kpi.value"
          :icon="kpi.icon"
          :tone="kpi.tone"
          :delta-pct="kpi.delta"
        />
      </div>

      <!-- Баланс + воронка -->
      <div class="dash__grid">
        <MCard :title="$t('m.dashboard.salesTitle')" class="dash__chart">
          <MBarChart :points="chartPoints" />
        </MCard>

        <MCard :title="$t('m.dashboard.funnelTitle')">
          <ul class="dash__funnel">
            <li v-for="stage in data.funnel" :key="stage.code" class="dash__funnel-row">
              <div class="dash__funnel-top">
                <span>{{ $t(funnelLabel(stage.code)) }}</span>
                <b>{{ groupDigits(stage.value) }}</b>
              </div>
              <div class="dash__funnel-bar">
                <span :style="{ width: `${(stage.value / funnelMax) * 100}%` }" />
              </div>
            </li>
          </ul>
        </MCard>
      </div>

      <!-- Баланс-плашки -->
      <div class="dash__balance">
        <div class="dash__balance-card dash__balance-card--primary">
          <div class="dash__balance-head">
            <span class="dash__balance-label">{{ $t('m.dashboard.balanceAvailable') }}</span>
            <UiIcon name="wallet-money-fill" :size="20" class="dash__balance-ic" />
          </div>
          <span class="dash__balance-value m-tnum">{{ money(data.balanceAvailable) }}</span>
          <NuxtLink :to="localePath('/finance/balance')" class="dash__balance-cta">
            {{ $t('m.dashboard.requestPayout') }}
            <UiIcon name="alt-arrow-right" :size="16" />
          </NuxtLink>
        </div>
        <div class="dash__balance-card">
          <div class="dash__balance-head">
            <span class="dash__balance-label dash__balance-label--muted">{{ $t('m.dashboard.balancePending') }}</span>
            <UiIcon name="clock-fill" :size="20" class="dash__balance-ic dash__balance-ic--muted" />
          </div>
          <span class="dash__balance-value dash__balance-value--muted m-tnum">{{ money(data.balancePending) }}</span>
        </div>
      </div>

      <!-- Топ товаров + последние заказы -->
      <div class="dash__grid dash__grid--bottom">
        <MCard :title="$t('m.dashboard.topProducts')">
          <ul class="dash__top">
            <li v-for="(p, i) in data.topProducts" :key="p.id" class="dash__top-row">
              <span class="dash__top-rank">{{ i + 1 }}</span>
              <span class="dash__top-name">{{ p.title }}</span>
              <span class="dash__top-sold">{{ $t('m.dashboard.soldUnits', { count: p.sold }) }}</span>
            </li>
          </ul>
        </MCard>

        <MCard :title="$t('m.dashboard.recentOrders')" flush>
          <MTable :columns="recentColumns" :rows="data.recentOrders" row-key="id">
            <template #cell-number="{ row }">
              <NuxtLink :to="localePath(`/orders/${row.id}`)" class="dash__link dash__nowrap">{{ row.number }}</NuxtLink>
            </template>
            <template #cell-createdAt="{ value }">{{ formatDate(new Date(value as string)) }}</template>
            <template #cell-total="{ value }"><span class="dash__nowrap">{{ money(value as Money) }}</span></template>
            <template #cell-statusCode="{ value }">
              <MStatus :tone="statusMeta.order(value as string).tone">{{ $t(statusMeta.order(value as string).key) }}</MStatus>
            </template>
          </MTable>
        </MCard>
      </div>
    </template>
    <MCard v-else-if="error"><MLoadError @retry="refresh()" /></MCard>
  </div>
</template>

<style scoped>
.dash__attention {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 16px;
  border: 1px solid var(--m-line, var(--color-line));
  border-radius: 16px;
  background: var(--color-surface);
}

.dash__attention-title { margin: 0 8px 0 0; font-weight: 600; font-size: var(--text-sm); color: var(--m-ink); }

.dash__attention-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding-inline: 12px;
  border-radius: 10px;
  background: var(--color-page);
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--m-ink);
}

.dash__attention-item:hover { background: var(--color-brand-tint); }
.dash__attention-item:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.dash__attention-item b { font-weight: 700; }

.dash__nowrap { white-space: nowrap; }
.dash__grid--bottom { grid-template-columns: 1fr 1.6fr; }

.dash__kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.dash__grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; margin-bottom: 16px; }
.dash__chart :deep(.mcard__body) { padding-bottom: 10px; }

.dash__funnel { display: flex; flex-direction: column; gap: 18px; margin: 0; padding: 0; list-style: none; }
.dash__funnel-top { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: var(--text-sm); color: var(--m-slate); }
.dash__funnel-top b { font-weight: 700; color: var(--m-ink); font-variant-numeric: tabular-nums; }
.dash__funnel-bar { height: 8px; border-radius: var(--m-radius-pill); background: var(--m-surface-sunken); overflow: hidden; }
.dash__funnel-bar span {
  display: block; height: 100%;
  border-radius: var(--m-radius-pill);
  background: var(--m-brand-gradient);
  transition: width var(--m-dur-slow) var(--m-ease);
}

.dash__balance { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
.dash__balance-card {
  display: flex; flex-direction: column; gap: 10px;
  padding: 24px;
  border: 1px solid var(--m-line);
  border-radius: var(--m-radius-lg);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-sm);
}
.dash__balance-card--primary {
  position: relative;
  overflow: hidden;
  border: 0;
  background: var(--m-hero-gradient);
  box-shadow: var(--m-shadow-brand);
  color: var(--m-on-dark);
}
.dash__balance-head { display: flex; align-items: center; justify-content: space-between; }
.dash__balance-label { font-size: var(--text-sm); font-weight: 500; opacity: 0.9; }
.dash__balance-label--muted { color: var(--m-slate); opacity: 1; }
.dash__balance-ic { opacity: 0.8; }
.dash__balance-ic--muted { color: var(--m-slate-soft); }
.dash__balance-value {
  font-family: var(--font-display); font-weight: 700;
  font-size: var(--text-8xl); letter-spacing: -0.02em; line-height: 1;
}
.dash__balance-value--muted { color: var(--m-ink); }
.dash__balance-cta {
  display: inline-flex; align-items: center; gap: 4px;
  margin-top: 4px;
  font-size: var(--text-sm); font-weight: 600;
  color: var(--m-on-dark);
  text-decoration: none;
  opacity: 0.95;
  transition: gap var(--m-dur-fast) var(--m-ease);
}
.dash__balance-cta:hover { gap: 8px; }

.dash__top { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }
.dash__top-row { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--m-line-soft); }
.dash__top-row:last-child { border-bottom: 0; }
.dash__top-rank {
  display: grid; width: 26px; height: 26px; flex: none;
  border-radius: 8px; background: var(--m-brand-tint);
  font-size: var(--text-xs); font-weight: 700; color: var(--m-brand-strong);
  font-variant-numeric: tabular-nums;
  place-items: center;
}
.dash__top-name { flex: 1; font-size: var(--text-sm); font-weight: 500; color: var(--m-ink-soft); }
.dash__top-sold { font-size: var(--text-xs); color: var(--m-slate); white-space: nowrap; }

.dash__link { color: var(--m-brand-strong); font-weight: 600; text-decoration: none; font-variant-numeric: tabular-nums; }
.dash__link:hover { text-decoration: underline; }
</style>
