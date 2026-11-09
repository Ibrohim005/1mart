<script setup lang="ts">
import type { MerchantCategory } from '#shared/types/merchant'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const { data, status, error, refresh } = await useApiData<MerchantCategory[]>('m:cats', '/merchant/categories')

const leaves = computed(() => (data.value ?? []).filter(item => !(data.value ?? []).some(other => other.parentId === item.id)))

const columns = [
  { key: 'name', label: t('m.categories.colName') },
  { key: 'productCount', label: t('m.categories.colProducts'), align: 'right' as const, width: '160px' },
  { key: 'commissionRate', label: t('m.categories.colCommission'), align: 'right' as const, width: '160px' },
]

useSeoMeta({ title: () => `${t('m.categories.title')} — spotshop Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.categories.title')" :subtitle="$t('m.categories.subtitle')" />

    <div v-if="status === 'pending' && !data" class="cats__loading">
      <UiSkeleton height="240px" radius="18px" />
    </div>

    <template v-else-if="data && data.length">
      <MCard flush>
        <MTable :columns="columns" :rows="leaves" row-key="id">
          <template #cell-name="{ row }">
            <span class="cats__name">
              <UiIcon name="category" :size="18" class="cats__icon" />{{ row.name }}
            </span>
          </template>
          <template #cell-commissionRate="{ value }">{{ value }}%</template>
        </MTable>
      </MCard>

      <p class="cats__note">
        <UiIcon name="info-circle" :size="18" />{{ $t('m.categories.note') }}
      </p>
    </template>

    <MCard v-else-if="status === 'error'"><MLoadError @retry="refresh()" /></MCard>
    <MCard v-else>
      <MEmpty :title="$t('m.categories.empty')" icon="category-2-fill" />
    </MCard>
  </div>
</template>

<style scoped>
.cats__loading { display: flex; flex-direction: column; gap: 16px; }
.cats__name { display: inline-flex; align-items: center; gap: 10px; font-weight: 500; }
.cats__icon { color: var(--color-text-muted); }
.cats__note {
  display: flex; align-items: center; gap: 10px;
  margin: 16px 2px 0;
  font-size: var(--text-sm); color: var(--color-text-muted);
}
</style>
