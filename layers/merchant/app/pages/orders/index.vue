<script setup lang="ts">
import type { OrderListItem } from '#shared/types/merchant'
import type { Money, Paged } from '#shared/types/catalog'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const { money } = useMoney()
const localePath = useLocalePath()
const sm = useStatusMeta()

const PER_PAGE = 10
const { filters, signature } = useUrlFilters({ q: '', status: 'all', page: '1' })
const statusFilter = filters.status
const search = useDebouncedSearch(filters.q)
const page = computed({ get: () => Number(filters.page.value) || 1, set: (value: number) => { filters.page.value = String(value) } })

const { data, status, refresh } = await useApiData<Paged<OrderListItem>>(
  'm:orders',
  '/merchant/orders',
  {
    query: () => ({ q: filters.q.value, status: statusFilter.value, page: page.value, perPage: PER_PAGE }),
    watch: [signature],
  },
)


const statusOptions = computed(() => [
  { value: 'all', label: t('m.common.all') },
  ...(['new', 'confirmed', 'packing', 'shipped', 'delivered', 'completed', 'cancelled', 'returned'] as const)
    .map(s => ({ value: s, label: t(`m.orderStatus.${s}`) })),
])

const columns = [
  { key: 'number', label: t('m.orders.colNumber') },
  { key: 'createdAt', label: t('m.orders.colDate') },
  { key: 'itemsCount', label: t('m.orders.colItems'), align: 'right' as const },
  { key: 'total', label: t('m.orders.colTotal'), align: 'right' as const },
  { key: 'paymentMethod', label: t('m.orders.colPayment') },
  { key: 'statusCode', label: t('m.orders.filterStatus') },
]

useSeoMeta({ title: () => `${t('m.orders.title')} — spotshop Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.orders.title')" :subtitle="$t('m.orders.subtitle')" />

    <MCard flush>
      <div class="ord__toolbar">
        <MField v-model="search" icon="search-normal" :placeholder="$t('m.orders.searchPlaceholder')" class="ord__search" />
        <MSelect v-model="statusFilter" :options="statusOptions" class="ord__sel" />
      </div>

      <div v-if="status === 'pending' && !data" class="ord__loading">
        <UiSkeleton v-for="n in 6" :key="n" height="52px" radius="10px" />
      </div>

      <template v-else-if="data && data.items.length">
        <MTable :columns="columns" :rows="data.items" row-key="id">
          <template #cell-number="{ row }">
            <NuxtLink :to="localePath(`/orders/${row.id}`)" class="ord__link m-tnum">{{ row.number }}</NuxtLink>
          </template>
          <template #cell-createdAt="{ value }"><span class="m-tnum">{{ formatDate(new Date(value as string)) }}</span></template>
          <template #cell-itemsCount="{ value }"><span class="m-tnum">{{ value }}</span></template>
          <template #cell-total="{ value }"><span class="m-tnum">{{ money(value as Money) }}</span></template>
          <template #cell-paymentMethod="{ value }">{{ $t(`m.payment.${value}`) }}</template>
          <template #cell-statusCode="{ value }">
            <MStatus :tone="sm.order(value as string).tone">{{ $t(sm.order(value as string).key) }}</MStatus>
          </template>
        </MTable>
        <div class="ord__pag">
          <MPagination v-model:page="page" :per-page="PER_PAGE" :total="data.total" />
        </div>
      </template>

      <MLoadError v-else-if="status === 'error'" @retry="refresh()" />
      <MEmpty v-else :title="$t('m.orders.empty')" :text="$t('m.orders.emptyText')" icon="bag-2-fill" />
    </MCard>
  </div>
</template>

<style scoped>
.ord__toolbar { display: flex; gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--m-line); }
.ord__search { flex: 1; }
.ord__sel { width: 220px; }
.ord__loading { display: flex; flex-direction: column; gap: 8px; padding: 18px; }
.ord__pag { padding: 0 18px 16px; }
.ord__link { color: var(--m-brand-strong); font-weight: 600; text-decoration: none; }
.ord__link:hover { text-decoration: underline; }
</style>
