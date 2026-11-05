<script setup lang="ts">
import type { DocumentRow } from '#shared/types/merchant'
import type { Money } from '#shared/types/catalog'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const { money } = useMoney()
const toast = useToast()
const sm = useStatusMeta()

const typeFilter = ref('all')

const { data, status, refresh } = await useApiData<DocumentRow[]>(
  'm:docs',
  '/merchant/documents',
  { query: () => ({ type: typeFilter.value }) },
)

watch(typeFilter, () => refresh())

const typeOptions = computed(() => [
  { value: 'all', label: t('m.common.all') },
  ...(['invoice', 'act', 'report', 'contract', 'reconciliation'] as const)
    .map(dt => ({ value: dt, label: t(`m.docType.${dt}`) })),
])

const columns = [
  { key: 'title', label: t('m.documents.colTitle') },
  { key: 'period', label: t('m.documents.colPeriod') },
  { key: 'date', label: t('m.documents.colDate') },
  { key: 'amount', label: t('m.documents.colAmount'), align: 'right' as const },
  { key: 'status', label: t('m.common.status') },
  { key: 'actions', label: '', align: 'right' as const, width: '150px' },
]

/** Файлы и подпись приходят с бэкенда; пока честно говорим, что документ не готов */
function act() {
  toast.show(t('m.documents.notReady'), 'error')
}

useSeoMeta({ title: () => `${t('m.documents.title')} — 1mart Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.documents.title')" :subtitle="$t('m.documents.subtitle')" />

    <MCard flush>
      <div class="doc__toolbar">
        <MSelect v-model="typeFilter" :options="typeOptions" class="doc__sel" />
      </div>

      <div v-if="status === 'pending' && !data" class="doc__loading">
        <UiSkeleton v-for="n in 5" :key="n" height="52px" radius="10px" />
      </div>

      <template v-else-if="data && data.length">
        <MTable :columns="columns" :rows="data" row-key="id">
          <template #cell-title="{ row }">
            <div class="doc__title">
              <span class="doc__ic"><UiIcon name="copy" :size="18" /></span>
              <span class="doc__title-text">
                <span class="doc__name">{{ row.title }}</span>
                <span class="doc__type">{{ $t(`m.docType.${row.type}`) }}</span>
              </span>
            </div>
          </template>
          <template #cell-date="{ value }">{{ formatDate(new Date(value as string)) }}</template>
          <template #cell-amount="{ value }">{{ value ? money(value as Money) : '—' }}</template>
          <template #cell-status="{ value }">
            <MStatus :tone="sm.document(value as string).tone">{{ $t(sm.document(value as string).key) }}</MStatus>
          </template>
          <template #cell-actions="{ row }">
            <div class="doc__actions">
              <button
                v-if="row.status === 'signRequired'"
                type="button"
                class="doc__btn doc__btn--primary"
                @click="act()"
              >{{ $t('m.documents.sign') }}</button>
              <button
                type="button"
                class="doc__btn"
                :disabled="row.status === 'generating'"
                @click="act()"
              >
                <UiIcon name="export-fill" :size="16" />{{ $t('m.common.download') }}
              </button>
            </div>
          </template>
        </MTable>
      </template>

      <MLoadError v-else-if="status === 'error'" @retry="refresh()" />
      <MEmpty v-else :title="$t('m.documents.empty')" icon="document-text-fill" />
    </MCard>
  </div>
</template>

<style scoped>
.doc__toolbar { padding: 16px 18px; border-bottom: 1px solid var(--color-line); }
.doc__sel { width: 220px; }
.doc__loading { display: flex; flex-direction: column; gap: 8px; padding: 18px; }

.doc__title { display: flex; align-items: center; gap: 12px; }
.doc__ic {
  display: grid; width: 38px; height: 38px; flex: none;
  border-radius: 10px; background: var(--color-page); color: var(--color-text-muted);
  place-items: center;
}
.doc__title-text { display: flex; flex-direction: column; }
.doc__name { font-weight: 500; color: var(--color-text); }
.doc__type { font-size: var(--text-xs); color: var(--color-text-muted); }

.doc__actions { display: inline-flex; gap: 6px; justify-content: flex-end; }
.doc__btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 34px; padding-inline: 12px;
  border: 1px solid var(--color-line); border-radius: 9px; background: var(--color-surface);
  font-size: var(--text-sm); color: var(--color-text); cursor: pointer; white-space: nowrap;
}
.doc__btn:hover:not(:disabled) { background: var(--color-page); }
.doc__btn:disabled { opacity: 0.5; cursor: default; }
.doc__btn--primary { border-color: var(--color-brand); background: var(--color-brand); color: var(--m-on-brand); }
.doc__btn--primary:hover { background: var(--color-brand-dark); }
</style>
