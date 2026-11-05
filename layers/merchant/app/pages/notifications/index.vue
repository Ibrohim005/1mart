<script setup lang="ts">
import type { NotificationItem } from '#shared/types/merchant'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const api = useApi()
const toast = useToast()
const localePath = useLocalePath()

const { data, status, refresh } = await useApiData<NotificationItem[]>('m:notifs', '/merchant/notifications')

// Иконка в кружке по типу уведомления.
const KIND_ICON: Record<string, string> = {
  order: 'receipt-item',
  finance: 'wallet',
  product: 'box',
  system: 'notification',
  support: 'message',
}
const kindIcon = (kind: string) => KIND_ICON[kind] ?? 'notification'

async function markAll() {
  try {
    await api.post('/merchant/notifications/read', {})
    toast.show(t('m.notifications.allRead'))
    refresh()
  }
  catch {
    toast.show(t('m.common.loadError'), 'error')
  }
}

async function open(item: NotificationItem) {
  if (!item.read) {
    try {
      await api.post('/merchant/notifications/read', { id: item.id })
      refresh()
    }
    catch { /* тихо: переход важнее отметки */ }
  }
  if (item.link) await navigateTo(localePath(item.link))
}

useSeoMeta({ title: () => `${t('m.notifications.title')} — 1mart Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.notifications.title')" :subtitle="$t('m.notifications.subtitle')">
      <UiButton variant="ghost" @click="markAll">{{ $t('m.notifications.markAllRead') }}</UiButton>
    </MPageHeader>

    <MCard flush>
      <div v-if="status === 'pending' && !data" class="notif__loading">
        <UiSkeleton v-for="n in 5" :key="n" height="64px" radius="10px" />
      </div>

      <ul v-else-if="data && data.length" class="notif__list">
        <li
          v-for="item in data"
          :key="item.id"
          class="notif__row"
          :class="{ 'notif__row--unread': !item.read, 'notif__row--link': item.link }"
          :tabindex="item.link || !item.read ? 0 : undefined"
          :role="item.link || !item.read ? 'button' : undefined"
          @click="open(item)"
          @keydown.enter="open(item)"
        >
          <span class="notif__icon" :class="`notif__icon--${item.kind}`">
            <UiIcon :name="kindIcon(item.kind)" :size="18" />
          </span>
          <span class="notif__body">
            <span class="notif__title">{{ item.title }}</span>
            <span class="notif__text">{{ item.text }}</span>
          </span>
          <span class="notif__meta">
            <span class="notif__date">{{ formatDate(new Date(item.createdAt)) }}</span>
            <span v-if="!item.read" class="notif__dot" />
          </span>
        </li>
      </ul>

      <MLoadError v-else-if="status === 'error'" @retry="refresh()" />
      <MEmpty v-else :title="$t('m.notifications.empty')" :text="$t('m.notifications.emptyText')" icon="notification-bing-fill" />
    </MCard>
  </div>
</template>

<style scoped>
.notif__loading { display: flex; flex-direction: column; gap: 8px; padding: 18px; }
.notif__list { margin: 0; padding: 0; list-style: none; }
.notif__row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-line);
}
.notif__row:last-child { border-bottom: 0; }
.notif__row--link { cursor: pointer; }
.notif__row--link:hover { background: var(--color-page); }
.notif__row--unread { background: var(--color-brand-tint); }
.notif__row--unread:hover { background: var(--color-brand-tint); }

.notif__icon {
  display: grid; width: 38px; height: 38px; flex: none;
  border-radius: 11px; background: var(--color-page); color: var(--color-text-muted);
  place-items: center;
}
.notif__icon--order { background: var(--m-info-bg); color: var(--m-info-fg); }
.notif__icon--finance { background: var(--m-brand-tint); color: var(--m-brand-strong); }
.notif__icon--product { background: var(--m-warning-bg); color: var(--m-warning-fg); }
.notif__icon--support { background: var(--m-violet-bg); color: var(--m-violet-fg); }

.notif__body { display: flex; flex: 1; flex-direction: column; gap: 3px; min-width: 0; }
.notif__title { font-weight: 600; font-size: var(--text-sm); color: var(--color-text); }
.notif__text { font-size: var(--text-sm); color: var(--color-text-muted); }
.notif__meta { display: flex; align-items: center; gap: 10px; white-space: nowrap; }
.notif__date { font-size: var(--text-xs); color: var(--color-text-muted); }
.notif__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-brand); }
</style>
