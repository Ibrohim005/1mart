<script setup lang="ts">
/** Подтверждение необратимого действия: удалить сотрудника, роль, отдел */
defineProps<{ title: string, text: string, actionLabel: string, busy?: boolean }>()
const open = defineModel<boolean>({ required: true })
const emit = defineEmits<{ confirm: [] }>()
</script>

<template>
  <UiModal v-model="open" :title="title" body-padding="8px 24px 24px">
    <p class="confirm__text">{{ text }}</p>
    <div class="confirm__actions">
      <UiButton variant="secondary" @click="open = false">{{ $t('org.common.cancel') }}</UiButton>
      <UiButton class="confirm__danger" :disabled="busy" @click="emit('confirm')">{{ actionLabel }}</UiButton>
    </div>
  </UiModal>
</template>

<style scoped>
.confirm__text { margin: 0 0 24px; font-size: var(--text-base); line-height: 1.5; color: var(--color-text-muted); }
.confirm__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.confirm__danger { background: var(--color-danger); }
.confirm__danger:hover:not(:disabled) { background: #A3231F; }
</style>
