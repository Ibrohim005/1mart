<script setup lang="ts">
/**
 * А1 «Товара нет в наличии» (ТЗ UC-FL-10): при повторной проверке остатка
 * позиция закончилась у продавца — предлагаем убрать её из заказа.
 */
export interface StockIssueView { skuId: number | string, title: string, image: string, requested: number }

defineProps<{ modelValue: boolean, items: StockIssueView[], busy: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean], remove: [StockIssueView['skuId']], removeAll: [] }>()
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('pay.stock.title')"
    body-padding="20px 24px 24px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="stock__text">{{ $t('pay.stock.text') }}</p>

    <ul class="stock__list">
      <li v-for="item in items" :key="item.skuId" class="stock__item">
        <UiImage :src="item.image" :alt="item.title" width="56" height="56" class="stock__image" />
        <span class="stock__info">
          <span class="stock__title">{{ item.title }}</span>
          <span class="stock__note">{{ $t('pay.stock.itemNote', { n: item.requested }) }}</span>
        </span>
        <button type="button" class="stock__remove" :disabled="busy" @click="emit('remove', item.skuId)">
          {{ $t('pay.stock.remove') }}
        </button>
      </li>
    </ul>

    <UiButton block :disabled="busy" @click="emit('removeAll')">{{ $t('pay.stock.removeAll') }}</UiButton>
  </UiModal>
</template>

<style scoped>
.stock__text { margin: 0 0 14px; font-size: var(--text-lg); line-height: 23px; color: var(--color-text); }
.stock__list { display: flex; flex-direction: column; gap: 10px; margin: 0 0 18px; padding: 0; list-style: none; }

.stock__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1.5px solid #F5C2C0;
  border-radius: 14px;
  background: #FFF5F5;
}

.stock__image { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; }
.stock__info { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.stock__title { font-weight: 600; font-size: var(--text-lg); color: var(--color-text); }
.stock__note { font-size: var(--text-base); color: #C02A26; }

.stock__remove {
  flex: none;
  padding: 8px 12px;
  border: 1px solid rgb(192 42 38 / 35%);
  border-radius: 10px;
  background: var(--color-surface);
  color: #C02A26;
  cursor: pointer;
  font: var(--type-button-sm);
}
</style>
