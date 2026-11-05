<script setup lang="ts">
/** Сбой загрузки. Без него пустой ответ и упавший сервер выглядели одинаково: «Заказов пока нет». */
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="merror" role="alert">
    <span class="merror__icon"><UiIcon name="warning-2" :size="24" /></span>
    <p class="merror__title">{{ $t('m.common.loadError') }}</p>
    <p class="merror__text">{{ $t('m.common.loadErrorText') }}</p>
    <UiButton variant="secondary" @click="$emit('retry')">{{ $t('m.common.retry') }}</UiButton>
  </div>
</template>

<style scoped>
.merror {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 48px 24px;
  text-align: center;
}

.merror__icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin-bottom: 4px;
  border-radius: 50%;
  background: var(--color-field);
  color: var(--color-danger);
}

.merror__title { margin: 0; font: var(--type-card-title); color: var(--m-ink); }
.merror__text { margin: 0 0 8px; font-size: var(--text-sm); line-height: 20px; color: var(--m-slate); }
</style>
