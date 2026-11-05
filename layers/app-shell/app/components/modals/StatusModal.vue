<script setup lang="ts">
/**
 * Диалог результата оплаты: успех, ожидание, ошибка.
 * Макет: Ad Card 586×473 — круг с иконкой, заголовок 31.3,
 * пояснение 18.8 и две кнопки 259.1×83, r23.5.
 */
defineProps<{
  modelValue: boolean
  kind: 'success' | 'pending' | 'error'
  title: string
  text: string
  primaryLabel: string
  secondaryLabel: string
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  'primary': []
  'secondary': []
}>()
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="title"
    hide-header
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="status">
      <UiSuccessMark v-if="kind === 'success'" :size="121" />
      <span v-else class="status__mark" :class="`status__mark--${kind}`" aria-hidden="true">
        {{ kind === 'pending' ? '◷' : '!' }}
      </span>

      <h3 class="status__title">{{ title }}</h3>
      <p class="status__text">{{ text }}</p>

      <div class="status__actions">
        <button type="button" class="status__button" @click="emit('secondary')">{{ secondaryLabel }}</button>
        <button type="button" class="status__button status__button--primary" @click="emit('primary')">
          {{ primaryLabel }}
        </button>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.status {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 25px;
  text-align: center;
}

.status__mark {
  display: grid;
  place-items: center;
  width: 121px;
  height: 121px;
  border-radius: 50%;
  font-size: 56px;
  line-height: 1;
  color: var(--color-surface);
}

.status__mark--pending { background: #FFC107; }
.status__mark--error { background: #E5322D; }

.status__title {
  margin: 25px 0 0;
  font: var(--type-page-title);
  color: var(--color-text);
}

.status__text {
  margin: 12.5px 0 0;
  font-weight: 500;
  font-size: var(--text-xl);
  line-height: 24px;
  color: #7C8A94;
}

.status__actions { display: flex; gap: 18.7px; margin-top: 24px; }

.status__button {
  width: 259.1px;
  border: 0;
  background: #F1F1F1;
  color: #000000;
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.status__button--primary { background: var(--color-brand); color: var(--color-on-brand); }
</style>
