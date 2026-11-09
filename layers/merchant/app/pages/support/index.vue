<script setup lang="ts">
import type { TicketDetail, TicketListItem } from '#shared/types/merchant'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const api = useApi()
const toast = useToast()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const sm = useStatusMeta()

const { data, status, refresh } = await useApiData<TicketListItem[]>('m:tickets', '/merchant/support')

const columns = [
  { key: 'number', label: t('m.support.colNumber'), width: '140px' },
  { key: 'subject', label: t('m.support.colSubject') },
  { key: 'status', label: t('m.common.status') },
  { key: 'updatedAt', label: t('m.support.colUpdated'), align: 'right' as const },
]

const open = ref(false)
// priority — строковая модель MSelect; значения из priorityOptions.
const form = reactive({ subject: '', text: '', priority: 'normal' })
const errSubject = ref('')
const errText = ref('')
const sending = ref(false)

const priorityOptions = computed(() => ([
  { value: 'low', label: t('m.support.priorityLow') },
  { value: 'normal', label: t('m.support.priorityNormal') },
  { value: 'high', label: t('m.support.priorityHigh') },
]))

async function submit() {
  errSubject.value = ''
  errText.value = ''
  if (form.subject.trim().length < 3) { errSubject.value = t('m.support.subject'); return }
  if (form.text.trim().length < 3) { errText.value = t('m.support.message'); return }
  sending.value = true
  try {
    const ticket = await api.post<TicketDetail>('/merchant/support', { ...form })
    toast.show(t('m.support.created'))
    open.value = false
    form.subject = ''
    form.text = ''
    form.priority = 'normal'
    refresh()
    if (ticket?.id) await navigateTo(localePath(`/support/${ticket.id}`))
  }
  catch {
    toast.show(t('m.common.loadError'), 'error')
  }
  finally {
    sending.value = false
  }
}

useSeoMeta({ title: () => `${t('m.support.title')} — spotshop Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.support.title')" :subtitle="$t('m.support.subtitle')">
      <UiButton variant="primary" @click="open = true">
        <UiIcon name="plus" :size="18" />{{ $t('m.support.newTicket') }}
      </UiButton>
    </MPageHeader>

    <div class="sup__grid">
      <MCard flush>
        <div v-if="status === 'pending' && !data" class="sup__loading">
          <UiSkeleton v-for="n in 4" :key="n" height="52px" radius="10px" />
        </div>

        <MTable v-else-if="data && data.length" :columns="columns" :rows="data" row-key="id">
          <template #cell-number="{ row }">
            <NuxtLink :to="localePath(`/support/${row.id}`)" class="sup__link">{{ row.number }}</NuxtLink>
          </template>
          <template #cell-subject="{ row }">
            <span class="sup__subject">
              <span class="sup__subject-title">{{ row.subject }}</span>
              <span class="sup__subject-last">{{ row.lastMessage }}</span>
            </span>
          </template>
          <template #cell-status="{ value }">
            <MStatus :tone="sm.ticket(value as string).tone">{{ $t(sm.ticket(value as string).key) }}</MStatus>
          </template>
          <template #cell-updatedAt="{ value }">{{ formatDate(new Date(value as string)) }}</template>
        </MTable>

        <MLoadError v-else-if="status === 'error'" @retry="refresh()" />
        <MEmpty v-else :title="$t('m.support.empty')" :text="$t('m.support.emptyText')" icon="messages-2-fill" />
      </MCard>

      <MCard :title="$t('m.support.contactsTitle')" class="sup__contacts">
        <ul class="sup__contacts-list">
          <li>
            <UiIcon name="call-fill" :size="18" />
            <a :href="`tel:${config.public.supportPhone}`">{{ config.public.supportPhone }}</a>
          </li>
          <li>
            <UiIcon name="messages-2-fill" :size="18" />
            <a :href="`mailto:${config.public.supportEmail}`">{{ config.public.supportEmail }}</a>
          </li>
          <li class="sup__hours">
            <UiIcon name="calendar" :size="18" />
            <span>{{ $t('m.support.workHours') }}</span>
          </li>
        </ul>
      </MCard>
    </div>

    <UiModal v-model="open" :title="$t('m.support.newTicket')">
      <form class="sup__form" @submit.prevent="submit">
        <MField v-model="form.subject" :label="$t('m.support.subject')" :error="errSubject" required />
        <MTextarea v-model="form.text" :label="$t('m.support.message')" :rows="5" :error="errText" />
        <MSelect v-model="form.priority" :label="$t('m.support.priority')" :options="priorityOptions" />
        <UiButton type="submit" variant="primary" size="lg" block :disabled="sending">{{ $t('m.support.send') }}</UiButton>
      </form>
    </UiModal>
  </div>
</template>

<style scoped>
.sup__grid { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
.sup__loading { display: flex; flex-direction: column; gap: 8px; padding: 18px; }
.sup__link { color: var(--m-brand-strong); font-weight: 600; text-decoration: none; }
.sup__link:hover { text-decoration: underline; }
.sup__subject { display: flex; flex-direction: column; }
.sup__subject-title { font-weight: 500; color: var(--color-text); }
.sup__subject-last { font-size: var(--text-xs); color: var(--color-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 360px; }

.sup__contacts-list { display: flex; flex-direction: column; gap: 14px; margin: 0; padding: 0; list-style: none; }
.sup__contacts-list li { display: flex; align-items: center; gap: 10px; color: var(--color-text); font-size: var(--text-sm); }
.sup__contacts-list a { color: var(--m-brand-strong); text-decoration: none; }
.sup__contacts-list a:hover { text-decoration: underline; }
.sup__hours { color: var(--color-text-muted); }

.sup__form { display: flex; flex-direction: column; gap: 16px; }
</style>
