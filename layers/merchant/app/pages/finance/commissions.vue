<script setup lang="ts">
import type { CommissionSummary } from '#shared/types/merchant'
import type { Money } from '#shared/types/catalog'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const { money } = useMoney()

const PER_PAGE = 10
const page = ref(1)

const { data, status, error, refresh } = await useApiData<CommissionSummary>(
  'm:commissions',
  '/merchant/finance/commissions',
  { query: () => ({ page: page.value, perPage: PER_PAGE }), watch: [page] },
)

const columns = [
  { key: 'orderNumber', label: t('m.commissions.colOrder') },
  { key: 'date', label: t('m.commissions.colDate') },
  { key: 'categoryName', label: t('m.commissions.colCategory') },
  { key: 'base', label: t('m.commissions.colBase'), align: 'right' as const },
  { key: 'rate', label: t('m.commissions.colRate'), align: 'right' as const },
  { key: 'amount', label: t('m.commissions.colAmount'), align: 'right' as const },
]

useSeoMeta({ title: () => `${t('m.commissions.title')} — spotshop Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.commissions.title')" :subtitle="$t('m.commissions.subtitle')" />

    <template v-if="data">
      <div class="com__tiles">
        <MStatTile :label="$t('m.commissions.baseRate')" :value="`${data.baseRate}%`" icon="percentage-square-fill" />
        <MStatTile :label="$t('m.commissions.periodTotal')" :value="money(data.periodTotal)" icon="wallet-money-fill" />
      </div>

      <MCard :title="$t('m.commissions.byCategory')" flush class="com__cats">
        <MTable
          :columns="[
            { key: 'categoryName', label: t('m.commissions.colCategory') },
            { key: 'rate', label: t('m.commissions.colRate'), align: 'right' },
            { key: 'amount', label: t('m.commissions.colAmount'), align: 'right' },
          ]"
          :rows="data.byCategory"
        >
          <template #cell-rate="{ value }">{{ value }}%</template>
          <template #cell-amount="{ value }">{{ money(value as Money) }}</template>
        </MTable>
      </MCard>

      <MCard flush>
        <template v-if="data.rows.items.length">
          <MTable :columns="columns" :rows="data.rows.items" row-key="id">
            <template #cell-date="{ value }">{{ formatDate(new Date(value as string)) }}</template>
            <template #cell-base="{ value }">{{ money(value as Money) }}</template>
            <template #cell-rate="{ value }">{{ value }}%</template>
            <template #cell-amount="{ value }">{{ money(value as Money) }}</template>
          </MTable>
          <div class="com__pag">
            <MPagination v-model:page="page" :per-page="PER_PAGE" :total="data.rows.total" />
          </div>
        </template>
        <MEmpty v-else :title="$t('m.commissions.empty')" icon="percentage-square-fill" />
      </MCard>
    </template>

    <div v-else-if="status === 'pending'" class="com__tiles">
      <UiSkeleton v-for="n in 2" :key="n" height="116px" radius="18px" />
    </div>
    <MCard v-else-if="error"><MLoadError @retry="refresh()" /></MCard>
  </div>
</template>

<style scoped>
.com__tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 320px)); gap: 16px; margin-bottom: 20px; }
.com__cats { margin-bottom: 20px; }
.com__pag { padding: 0 18px 16px; }
</style>
