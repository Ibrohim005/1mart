<script setup lang="ts">
import type { TicketDetail, TicketMessage } from '#shared/types/merchant'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const toast = useToast()
const localePath = useLocalePath()
const route = useRoute()
const sm = useStatusMeta()
const id = route.params.id as string

const { data, status, error, refresh } = await useApiData<TicketDetail>(`m:ticket:${id}`, `/merchant/support/${id}`)

// Лента сообщений держится локально: ответ продавца дописываем на клиенте
// (отдельного эндпоинта ответа пока нет — бэкенд добавит).
const messages = ref<TicketMessage[]>([])
watch(data, (value) => {
  if (value) messages.value = [...value.messages]
}, { immediate: true })

const reply = ref('')
function send() {
  const text = reply.value.trim()
  if (!text) return
  messages.value.push({
    id: `local-${Date.now().toString(36)}`,
    author: 'merchant',
    text,
    createdAt: new Date().toISOString(),
  })
  reply.value = ''
  toast.show(t('m.support.replySent'))
}

useSeoMeta({
  title: () => `${data.value ? data.value.number : t('m.support.title')} — 1mart Business`,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div>
    <template v-if="status === 'pending' && !data">
      <UiSkeleton height="40px" width="320px" radius="10px" />
      <UiSkeleton height="320px" radius="18px" style="margin-top: 20px;" />
    </template>

    <template v-else-if="data">
      <MPageHeader :title="$t('m.support.ticketTitle', { number: data.number })" :subtitle="data.subject">
        <MStatus :tone="sm.ticket(data.status).tone">{{ $t(sm.ticket(data.status).key) }}</MStatus>
      </MPageHeader>

      <NuxtLink :to="localePath('/support')" class="ticket__back">
        <UiIcon name="alt-arrow-right" :size="16" class="ticket__back-icon" />{{ $t('m.support.backToList') }}
      </NuxtLink>

      <MCard>
        <ul class="ticket__thread">
          <li
            v-for="msg in messages"
            :key="msg.id"
            class="ticket__msg"
            :class="msg.author === 'merchant' ? 'ticket__msg--mine' : 'ticket__msg--them'"
          >
            <div class="ticket__bubble">
              <p class="ticket__text">{{ msg.text }}</p>
              <span class="ticket__time">{{ formatDate(new Date(msg.createdAt)) }}</span>
            </div>
          </li>
        </ul>

        <form class="ticket__reply" @submit.prevent="send">
          <MTextarea v-model="reply" :placeholder="$t('m.support.replyPlaceholder')" :rows="3" />
          <UiButton type="submit" variant="primary">{{ $t('m.support.reply') }}</UiButton>
        </form>
      </MCard>
    </template>
    <MNotFound v-else-if="(error as { statusCode?: number } | null)?.statusCode === 404" to="/support" :back-label="$t('m.support.backToList')" />
    <MLoadError v-else-if="error" @retry="refresh()" />
  </div>
</template>

<style scoped>
.ticket__back {
  display: inline-flex; align-items: center; gap: 6px;
  margin-bottom: 18px;
  font-size: var(--text-sm); color: var(--color-text-muted); text-decoration: none;
}
.ticket__back:hover { color: var(--color-text); }
.ticket__back-icon { transform: rotate(180deg); }

.ticket__thread { display: flex; flex-direction: column; gap: 14px; margin: 0 0 20px; padding: 0; list-style: none; }
.ticket__msg { display: flex; }
.ticket__msg--mine { justify-content: flex-end; }
.ticket__bubble { max-width: 70%; padding: 12px 16px; border-radius: 16px; }
.ticket__msg--them .ticket__bubble { background: var(--color-page); border-bottom-left-radius: 4px; }
.ticket__msg--mine .ticket__bubble { background: var(--color-brand-tint); border-bottom-right-radius: 4px; }
.ticket__text { margin: 0; font-size: var(--text-sm); color: var(--color-text); }
.ticket__time { display: block; margin-top: 6px; font-size: var(--text-2xs); color: var(--color-text-muted); }

.ticket__reply { display: flex; flex-direction: column; gap: 12px; padding-top: 18px; border-top: 1px solid var(--color-line); }
.ticket__reply :deep(.btn) { align-self: flex-end; }
</style>
