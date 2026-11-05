<script setup lang="ts">
/** Подтверждение необратимого действия. Заменяет системное окно браузера. */
defineProps<{ title: string, text: string, confirmLabel: string, busy?: boolean }>()
const open = defineModel<boolean>({ required: true })
defineEmits<{ confirm: [] }>()
</script>

<template>
  <UiModal v-model="open" :title="title">
    <div class="mconfirm">
      <p class="mconfirm__text">{{ text }}</p>
      <slot />
      <div class="mconfirm__actions">
        <UiButton variant="secondary" block :disabled="busy" @click="open = false">{{ $t('m.common.cancel') }}</UiButton>
        <UiButton variant="primary" block :disabled="busy" @click="$emit('confirm')">{{ confirmLabel }}</UiButton>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.mconfirm { display: flex; flex-direction: column; gap: 16px; }
.mconfirm__text { margin: 0; font-size: var(--text-md); line-height: 22px; color: var(--m-slate); }
.mconfirm__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
</style>
