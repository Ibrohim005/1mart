<script setup lang="ts">
/**
 * Логин и временный пароль сотрудника. SMS уже ушло ему на телефон; руководитель
 * может скопировать данные и переслать сам — например, если SMS не дошло.
 * Пароль показываем один раз: сервер его больше не отдаст, можно только выдать новый.
 */
import type { IssuedCredentials } from '#shared/types/company'

const props = defineProps<{ credentials: IssuedCredentials | null, fullName: string }>()
const open = defineModel<boolean>({ required: true })
const { t } = useI18n()
const toast = useToast()
const siteUrl = useSiteConfig().url.replace(/\/$/, '')

async function copy() {
  if (!props.credentials) return
  const text = t('org.credentials.message', { name: props.fullName, login: props.credentials.login, password: props.credentials.password, url: siteUrl })
  try {
    await navigator.clipboard.writeText(text)
    toast.show(t('org.credentials.copied'))
  }
  catch {
    toast.show(t('org.credentials.copyFailed'), 'error')
  }
}
</script>

<template>
  <UiModal v-model="open" :title="$t('org.credentials.title')" body-padding="8px 24px 24px">
    <div v-if="credentials" class="credentials">
      <p v-if="credentials.smsSent" class="credentials__sms">
        <UiIcon name="sms-fill" :size="20" color="currentColor" />
        {{ $t('org.credentials.smsSent', { phone: credentials.login }) }}
      </p>
      <dl class="credentials__list">
        <div class="credentials__row">
          <dt>{{ $t('org.credentials.login') }}</dt>
          <dd>{{ credentials.login }}</dd>
        </div>
        <div class="credentials__row">
          <dt>{{ $t('org.credentials.password') }}</dt>
          <dd class="credentials__password">{{ credentials.password }}</dd>
        </div>
      </dl>
      <p class="credentials__note">{{ $t('org.credentials.note') }}</p>
      <div class="credentials__actions">
        <UiButton variant="secondary" @click="copy">
          <UiIcon name="copy" :size="18" color="currentColor" />
          {{ $t('org.credentials.copy') }}
        </UiButton>
        <UiButton @click="open = false">{{ $t('org.credentials.done') }}</UiButton>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.credentials { display: flex; flex-direction: column; gap: 16px; }
.credentials__sms { display: flex; align-items: center; gap: 10px; margin: 0; padding: 12px 14px; border-radius: 10px; background: var(--color-field); font-size: var(--text-base); color: var(--color-text); }
.credentials__sms :deep(svg) { flex: none; color: var(--color-brand-text); }
.credentials__list { display: flex; flex-direction: column; gap: 0; margin: 0; border: 1px solid var(--color-line); border-radius: 10px; }
.credentials__row { display: flex; justify-content: space-between; gap: 16px; padding: 14px 16px; }
.credentials__row + .credentials__row { border-top: 1px solid var(--color-line); }
.credentials__row dt { font-size: var(--text-base); color: var(--color-text-muted); }
.credentials__row dd { margin: 0; font-weight: 600; font-size: var(--text-base); color: var(--color-text); }
.credentials__password { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0.06em; }
.credentials__note { margin: 0; font-size: var(--text-sm); line-height: 1.45; color: var(--color-text-muted); }
.credentials__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.credentials__actions :deep(.btn) { gap: 8px; }
</style>
