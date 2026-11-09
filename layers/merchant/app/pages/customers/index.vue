<script setup lang="ts">
import type { CustomerListItem } from '#shared/types/merchant'
import type { Money, Paged } from '#shared/types/catalog'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const { money } = useMoney()
const localePath = useLocalePath()

const PER_PAGE = 10
const { filters, signature } = useUrlFilters({ q: '', page: '1' })
const search = useDebouncedSearch(filters.q)
const page = computed({ get: () => Number(filters.page.value) || 1, set: (value: number) => { filters.page.value = String(value) } })

const { data, status, refresh } = await useApiData<Paged<CustomerListItem>>(
  'm:customers',
  '/merchant/customers',
  { query: () => ({ q: filters.q.value, page: page.value, perPage: PER_PAGE }), watch: [signature] },
)


const columns = [
  { key: 'name', label: t('m.customers.colName') },
  { key: 'phone', label: t('m.customers.colPhone') },
  { key: 'ordersCount', label: t('m.customers.colOrders'), align: 'right' as const },
  { key: 'totalSpent', label: t('m.customers.colSpent'), align: 'right' as const },
  { key: 'lastOrderAt', label: t('m.customers.colLast') },
]

useSeoMeta({ title: () => `${t('m.customers.title')} — spotshop Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.customers.title')" :subtitle="$t('m.customers.subtitle')" />

    <MCard flush>
      <div class="clist__toolbar">
        <MField v-model="search" icon="search-normal" :placeholder="$t('m.customers.searchPlaceholder')" class="clist__search" />
      </div>

      <div v-if="status === 'pending' && !data" class="clist__loading">
        <UiSkeleton v-for="n in 6" :key="n" height="52px" radius="10px" />
      </div>

      <template v-else-if="data && data.items.length">
        <MTable :columns="columns" :rows="data.items" row-key="id">
          <template #cell-name="{ row }">
            <NuxtLink :to="localePath(`/customers/${row.id}`)" class="clist__cust">
              <span class="clist__avatar">{{ row.name.charAt(0) }}</span>
              <span class="clist__cust-text">
                <span class="clist__name">{{ row.name }}</span>
                <span class="clist__sub">{{ row.company || $t('m.customers.person') }}</span>
              </span>
            </NuxtLink>
          </template>
          <template #cell-totalSpent="{ value }">{{ money(value as Money) }}</template>
          <template #cell-lastOrderAt="{ value }">{{ formatDate(new Date(value as string)) }}</template>
        </MTable>

        <div class="clist__pag">
          <MPagination v-model:page="page" :per-page="PER_PAGE" :total="data.total" />
        </div>
      </template>

      <MLoadError v-else-if="status === 'error'" @retry="refresh()" />
      <MEmpty v-else :title="$t('m.customers.empty')" icon="profile-2user-fill" />
    </MCard>
  </div>
</template>

<style scoped>
.clist__toolbar { padding: 16px 18px; border-bottom: 1px solid var(--color-line); }
.clist__search { max-width: 420px; }
.clist__loading { display: flex; flex-direction: column; gap: 8px; padding: 18px; }
.clist__pag { padding: 0 18px 16px; }
.clist__cust { display: flex; align-items: center; gap: 12px; text-decoration: none; }
.clist__avatar {
  display: grid; width: 38px; height: 38px; flex: none;
  border-radius: 10px; background: var(--color-brand-tint);
  font-weight: 600; color: var(--color-brand-darker); place-items: center;
}
.clist__cust-text { display: flex; flex-direction: column; }
.clist__name { font-weight: 500; color: var(--color-text); }
.clist__cust:hover .clist__name { color: var(--m-brand-strong); }
.clist__sub { font-size: var(--text-xs); color: var(--color-text-muted); }
</style>
