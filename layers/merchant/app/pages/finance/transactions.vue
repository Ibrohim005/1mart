<script setup lang="ts">
import type { TransactionRow } from '#shared/types/merchant'
import type { Money, Paged } from '#shared/types/catalog'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const { money } = useMoney()

const PER_PAGE = 12
const { filters, signature } = useUrlFilters({ type: 'all', page: '1' })
const typeFilter = filters.type
const page = computed({ get: () => Number(filters.page.value) || 1, set: (value: number) => { filters.page.value = String(value) } })

const { data, status, refresh } = await useApiData<Paged<TransactionRow>>(
  'm:tx',
  '/merchant/finance/transactions',
  { query: () => ({ type: typeFilter.value, page: page.value, perPage: PER_PAGE }), watch: [signature] },
)


const typeOptions = computed(() => [
  { value: 'all', label: t('m.common.all') },
  ...(['sale', 'commission', 'payout', 'refund', 'adjustment'] as const)
    .map(ttype => ({ value: ttype, label: t(`m.txType.${ttype}`) })),
])

const columns = [
  { key: 'date', label: t('m.transactions.colDate') },
  { key: 'type', label: t('m.transactions.colType') },
  { key: 'description', label: t('m.transactions.colDescription') },
  { key: 'amount', label: t('m.transactions.colAmount'), align: 'right' as const },
  { key: 'balanceAfter', label: t('m.transactions.colBalance'), align: 'right' as const },
]

const sign = (m: Money) => (m.amount >= 0 ? 'tx__pos' : 'tx__neg')

useSeoMeta({ title: () => `${t('m.transactions.title')} — spotshop Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.transactions.title')" :subtitle="$t('m.transactions.subtitle')" />

    <MCard flush>
      <div class="tx__toolbar">
        <MSelect v-model="typeFilter" :label="''" :options="typeOptions" class="tx__sel" />
      </div>

      <div v-if="status === 'pending' && !data" class="tx__loading">
        <UiSkeleton v-for="n in 8" :key="n" height="48px" radius="10px" />
      </div>

      <template v-else-if="data && data.items.length">
        <MTable :columns="columns" :rows="data.items" row-key="id">
          <template #cell-date="{ value }">{{ formatDate(new Date(value as string)) }}</template>
          <template #cell-type="{ value }">{{ $t(`m.txType.${value}`) }}</template>
          <template #cell-amount="{ value }">
            <span :class="sign(value as Money)">{{ money(value as Money) }}</span>
          </template>
          <template #cell-balanceAfter="{ value }">{{ money(value as Money) }}</template>
        </MTable>
        <div class="tx__pag">
          <MPagination v-model:page="page" :per-page="PER_PAGE" :total="data.total" />
        </div>
      </template>

      <MLoadError v-else-if="status === 'error'" @retry="refresh()" />
      <MEmpty v-else :title="$t('m.transactions.empty')" icon="receipt-item-fill" />
    </MCard>
  </div>
</template>

<style scoped>
.tx__toolbar { padding: 16px 18px; border-bottom: 1px solid var(--m-line); }
.tx__sel { width: 220px; }
.tx__loading { display: flex; flex-direction: column; gap: 8px; padding: 18px; }
.tx__pag { padding: 0 18px 16px; }
.tx__pos { color: var(--m-success-fg); font-weight: 600; }
.tx__neg { color: var(--m-danger-fg); font-weight: 600; }
</style>
