<script setup lang="ts">
import type { CustomerDetail } from '#shared/types/merchant'
import type { Money } from '#shared/types/catalog'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const { money } = useMoney()
const localePath = useLocalePath()
const sm = useStatusMeta()
const route = useRoute()
const id = route.params.id as string

const { data, status, error, refresh } = await useApiData<CustomerDetail>(`m:customer:${id}`, `/merchant/customers/${id}`)

const recentColumns = [
  { key: 'number', label: t('m.orders.colNumber') },
  { key: 'createdAt', label: t('m.orders.colDate') },
  { key: 'total', label: t('m.orders.colTotal'), align: 'right' as const },
  { key: 'statusCode', label: t('m.common.status') },
]

useSeoMeta({ title: () => `${t('m.customers.detailTitle')} — spotshop Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <div v-if="status === 'pending' && !data" class="cdet__loading">
      <UiSkeleton height="56px" radius="14px" />
      <UiSkeleton height="300px" radius="18px" />
    </div>

    <template v-else-if="data">
      <MPageHeader :title="data.name" :subtitle="data.company || $t('m.customers.person')">
        <NuxtLink :to="localePath('/customers')">
          <UiButton variant="ghost">{{ $t('m.customers.backToList') }}</UiButton>
        </NuxtLink>
      </MPageHeader>

      <div class="cdet__stats">
        <MStatTile :label="$t('m.customers.colOrders')" :value="String(data.ordersCount)" icon="bag-2-fill" />
        <MStatTile :label="$t('m.customers.colSpent')" :value="money(data.totalSpent)" icon="wallet-money-fill" />
        <MStatTile :label="$t('m.customers.avgCheck')" :value="money(data.avgCheck)" icon="receipt-item-fill" />
      </div>

      <div class="cdet__grid">
        <MCard :title="$t('m.customers.detailTitle')">
          <ul class="cdet__kv">
            <li><span class="cdet__k">{{ $t('m.company.phone') }}</span><a :href="`tel:${data.phone}`" class="cdet__link">{{ data.phone }}</a></li>
            <li v-if="data.email"><span class="cdet__k">{{ $t('m.company.email') }}</span><span>{{ data.email }}</span></li>
            <li><span class="cdet__k">{{ $t('m.customers.firstOrder') }}</span><span>{{ formatDate(new Date(data.firstOrderAt)) }}</span></li>
            <li><span class="cdet__k">{{ $t('m.customers.lastOrder') }}</span><span>{{ formatDate(new Date(data.lastOrderAt)) }}</span></li>
          </ul>
        </MCard>

        <MCard :title="$t('m.customers.recentOrders')" flush>
          <MTable v-if="data.recentOrders.length" :columns="recentColumns" :rows="data.recentOrders" row-key="id">
            <template #cell-number="{ row }">
              <NuxtLink :to="localePath(`/orders/${row.id}`)" class="cdet__link">{{ row.number }}</NuxtLink>
            </template>
            <template #cell-createdAt="{ value }">{{ formatDate(new Date(value as string)) }}</template>
            <template #cell-total="{ value }">{{ money(value as Money) }}</template>
            <template #cell-statusCode="{ value }">
              <MStatus :tone="sm.order(value as string).tone">{{ $t(sm.order(value as string).key) }}</MStatus>
            </template>
          </MTable>
          <MEmpty v-else :title="$t('m.orders.empty')" icon="bag-2-fill" />
        </MCard>
      </div>
    </template>
    <MNotFound v-else-if="(error as { statusCode?: number } | null)?.statusCode === 404" to="/customers" :back-label="$t('m.customers.backToList')" />
    <MLoadError v-else-if="error" @retry="refresh()" />
  </div>
</template>

<style scoped>
.cdet__loading { display: flex; flex-direction: column; gap: 16px; }
.cdet__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
.cdet__grid { display: grid; grid-template-columns: 340px 1fr; gap: 20px; align-items: start; }
.cdet__kv { display: flex; flex-direction: column; gap: 12px; margin: 0; padding: 0; list-style: none; }
.cdet__kv li { display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: var(--text-sm); }
.cdet__k { color: var(--color-text-muted); }
.cdet__link { color: var(--m-brand-strong); font-weight: 600; text-decoration: none; }
.cdet__link:hover { text-decoration: underline; }
</style>
