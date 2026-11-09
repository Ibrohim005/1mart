<script setup lang="ts">
import type { PayoutRow } from '#shared/types/merchant'
import type { Money, Paged } from '#shared/types/catalog'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const { money } = useMoney()
const localePath = useLocalePath()
const sm = useStatusMeta()

const PER_PAGE = 10
const page = ref(1)

const { data, status, error, refresh } = await useApiData<Paged<PayoutRow>>(
  'm:payouts',
  '/merchant/finance/payouts',
  { query: () => ({ page: page.value, perPage: PER_PAGE }), watch: [page] },
)

const columns = [
  { key: 'requestedAt', label: t('m.payouts.colRequested') },
  { key: 'amount', label: t('m.payouts.colAmount'), align: 'right' as const },
  { key: 'destination', label: t('m.payouts.colDestination') },
  { key: 'paidAt', label: t('m.payouts.colPaid') },
  { key: 'status', label: t('m.payouts.colStatus') },
]

useSeoMeta({ title: () => `${t('m.payouts.title')} — spotshop Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.payouts.title')" :subtitle="$t('m.payouts.subtitle')">
      <NuxtLink :to="localePath('/finance/balance')">
        <UiButton variant="primary">{{ $t('m.payouts.request') }}</UiButton>
      </NuxtLink>
    </MPageHeader>

    <MCard flush>
      <div v-if="status === 'pending' && !data" class="pay__loading">
        <UiSkeleton v-for="n in 6" :key="n" height="52px" radius="10px" />
      </div>

      <template v-else-if="data && data.items.length">
        <MTable :columns="columns" :rows="data.items" row-key="id">
          <template #cell-requestedAt="{ value }">{{ formatDate(new Date(value as string)) }}</template>
          <template #cell-amount="{ value }">{{ money(value as Money) }}</template>
          <template #cell-paidAt="{ value }">{{ value ? formatDate(new Date(value as string)) : '—' }}</template>
          <template #cell-status="{ value }">
            <MStatus :tone="sm.payout(value as string).tone">{{ $t(sm.payout(value as string).key) }}</MStatus>
          </template>
        </MTable>
        <div class="pay__pag">
          <MPagination v-model:page="page" :per-page="PER_PAGE" :total="data.total" />
        </div>
      </template>

      <MLoadError v-else-if="status === 'error'" @retry="refresh()" />
      <MEmpty v-else :title="$t('m.payouts.empty')" icon="money-recive-fill" />
    </MCard>
  </div>
</template>

<style scoped>
.pay__loading { display: flex; flex-direction: column; gap: 8px; padding: 18px; }
.pay__pag { padding: 0 18px 16px; }
</style>
