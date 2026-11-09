<script setup lang="ts">
import type { MerchantCategory, ProductListItem } from '#shared/types/merchant'
import type { Money, Paged } from '#shared/types/catalog'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const { money } = useMoney()
const localePath = useLocalePath()
const api = useApi()
const toast = useToast()
const statusMeta = useStatusMeta()

type ProductsPage = Paged<ProductListItem> & { statusCounts: Record<string, number> }

const PER_PAGE = 10
const { filters, signature } = useUrlFilters({ q: '', status: 'all', category: 'all', sort: 'default', page: '1' })
const statusFilter = filters.status
const categoryFilter = filters.category
const sort = filters.sort
const search = useDebouncedSearch(filters.q)
const page = computed({ get: () => Number(filters.page.value) || 1, set: (value: number) => { filters.page.value = String(value) } })

const { data: categories } = await useApiData<MerchantCategory[]>('m:categories', '/merchant/categories')

const { data, status, refresh } = await useApiData<ProductsPage>(
  'm:products',
  '/merchant/products',
  {
    query: () => ({
      q: filters.q.value,
      status: statusFilter.value,
      categoryId: categoryFilter.value,
      sort: sort.value,
      page: page.value,
      perPage: PER_PAGE,
    }),
    watch: [signature],
  },
)


const statusTabs = computed(() => {
  const c = data.value?.statusCounts ?? {}
  return [
    { value: 'all', label: t('m.common.all'), count: c.all },
    ...(['active', 'draft', 'moderation', 'archived', 'rejected'] as const)
      .map(s => ({ value: s, label: t(`m.productStatus.${s}`), count: c[s] })),
  ]
})
const categoryOptions = computed(() => [
  { value: 'all', label: t('m.common.all') },
  ...(categories.value ?? []).map(c => ({ value: c.id, label: c.name })),
])
const sortOptions = computed(() => ([
  { value: 'default', label: t('m.products.sortDefault') },
  { value: 'priceAsc', label: t('m.products.sortPriceAsc') },
  { value: 'priceDesc', label: t('m.products.sortPriceDesc') },
  { value: 'stock', label: t('m.products.sortStock') },
  { value: 'sold', label: t('m.products.sortSold') },
]))

const columns = [
  { key: 'title', label: t('m.products.colProduct') },
  { key: 'categoryName', label: t('m.products.colCategory') },
  { key: 'price', label: t('m.products.colPrice'), align: 'right' as const },
  { key: 'stock', label: t('m.products.colStock'), align: 'right' as const },
  { key: 'sold', label: t('m.products.colSold'), align: 'right' as const },
  { key: 'status', label: t('m.products.colStatus') },
  { key: 'actions', label: '', align: 'right' as const, width: '96px' },
]

const removing = ref<ProductListItem | null>(null)
const removeOpen = computed({ get: () => removing.value !== null, set: (value: boolean) => { if (!value) removing.value = null } })
const busy = ref(false)

function remove(product: ProductListItem) {
  removing.value = product
}

async function confirmRemove() {
  if (!removing.value) return
  busy.value = true
  try {
    await api.delete(`/merchant/products/${removing.value.id}`)
    toast.show(t('m.common.saved'))
    removing.value = null
    refresh()
  }
  catch {
    toast.show(t('m.common.loadError'), 'error')
  }
  finally {
    busy.value = false
  }
}

useSeoMeta({ title: () => `${t('m.products.title')} — spotshop Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.products.title')" :subtitle="$t('m.products.subtitle')">
      <NuxtLink :to="localePath('/products/new')">
        <UiButton variant="primary"><UiIcon name="add" :size="18" />{{ $t('m.products.add') }}</UiButton>
      </NuxtLink>
    </MPageHeader>

    <MCard flush>
      <div class="plist__tabs">
        <MTabs v-model="statusFilter" :tabs="statusTabs" />
      </div>
      <div class="plist__toolbar">
        <MField v-model="search" icon="search-normal" :placeholder="$t('m.products.searchPlaceholder')" class="plist__search" />
        <MSelect v-model="categoryFilter" :options="categoryOptions" class="plist__sel" />
        <MSelect v-model="sort" :options="sortOptions" class="plist__sel" />
      </div>

      <div v-if="status === 'pending' && !data" class="plist__loading">
        <UiSkeleton v-for="n in 6" :key="n" height="56px" radius="12px" />
      </div>

      <template v-else-if="data && data.items.length">
        <MTable :columns="columns" :rows="data.items" row-key="id">
          <template #cell-title="{ row }">
            <div class="plist__prod">
              <span class="plist__thumb">
                <img v-if="row.image" :src="row.image" alt="" class="plist__thumb-img">
                <UiIcon v-else name="box-fill" :size="20" />
              </span>
              <span class="plist__prod-text">
                <NuxtLink :to="localePath(`/products/${row.id}`)" class="plist__name">{{ row.title }}</NuxtLink>
                <span class="plist__sku m-tnum">{{ row.sku }}</span>
              </span>
            </div>
          </template>
          <template #cell-price="{ value }"><span class="m-tnum">{{ money(value as Money) }}</span></template>
          <template #cell-stock="{ value }">
            <span class="m-tnum" :class="{ 'plist__out': (value as number) === 0 }">
              {{ (value as number) === 0 ? $t('m.products.outOfStock') : $t('m.products.inStock', { count: value }) }}
            </span>
          </template>
          <template #cell-sold="{ value }"><span class="m-tnum">{{ value }}</span></template>
          <template #cell-status="{ value }">
            <MStatus :tone="statusMeta.product(value as string).tone">{{ $t(statusMeta.product(value as string).key) }}</MStatus>
          </template>
          <template #cell-actions="{ row }">
            <div class="plist__actions">
              <NuxtLink :to="localePath(`/products/${row.id}`)" class="plist__act" :aria-label="$t('m.common.edit')">
                <UiIcon name="edit" :size="18" />
              </NuxtLink>
              <button type="button" class="plist__act plist__act--danger" :aria-label="$t('m.common.delete')" @click="remove(row)">
                <UiIcon name="trash" :size="18" />
              </button>
            </div>
          </template>
        </MTable>

        <div class="plist__pag">
          <MPagination v-model:page="page" :per-page="PER_PAGE" :total="data.total" />
        </div>
      </template>

      <MLoadError v-else-if="status === 'error'" @retry="refresh()" />

      <MEmpty v-else :title="$t('m.products.empty')" :text="$t('m.products.emptyText')" icon="box-fill">
        <NuxtLink :to="localePath('/products/new')">
          <UiButton variant="primary">{{ $t('m.products.add') }}</UiButton>
        </NuxtLink>
      </MEmpty>
    </MCard>

    <MConfirm
      v-model="removeOpen"
      :title="$t('m.common.delete')"
      :text="$t('m.products.confirmDelete')"
      :confirm-label="$t('m.common.delete')"
      :busy="busy"
      @confirm="confirmRemove"
    />
  </div>
</template>

<style scoped>
.plist__tabs { padding: 16px 18px 0; }
.plist__toolbar { display: flex; gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--m-line); }
.plist__search { flex: 1; }
.plist__sel { width: 190px; }
.plist__loading { display: flex; flex-direction: column; gap: 8px; padding: 18px; }
.plist__pag { padding: 0 18px 16px; }

.plist__prod { display: flex; align-items: center; gap: 12px; }
.plist__thumb {
  display: grid; width: 40px; height: 40px; flex: none; overflow: hidden;
  border-radius: var(--m-radius-sm); background: var(--m-surface-sunken); color: var(--m-slate-soft);
  place-items: center;
}
.plist__thumb-img { width: 100%; height: 100%; object-fit: cover; }
.plist__prod-text { display: flex; flex-direction: column; min-width: 0; }
.plist__name { font-weight: 500; color: var(--m-ink); text-decoration: none; }
.plist__name:hover { color: var(--m-brand-strong); }
.plist__sku { font-size: var(--text-xs); color: var(--m-slate); }
.plist__out { color: var(--m-danger-fg); font-weight: 600; }

.plist__actions { display: inline-flex; gap: 6px; }
.plist__act {
  display: grid; width: 34px; height: 34px;
  border: 1px solid var(--m-line); border-radius: var(--m-radius-sm); background: var(--m-surface);
  color: var(--m-slate); cursor: pointer; place-items: center;
  transition: background var(--m-dur-fast) var(--m-ease), color var(--m-dur-fast) var(--m-ease), border-color var(--m-dur-fast) var(--m-ease);
}
.plist__act:hover { background: var(--m-surface-sunken); color: var(--m-ink); border-color: var(--m-line-strong); }
.plist__act--danger:hover { color: var(--m-danger-fg); border-color: var(--m-danger); }
</style>
