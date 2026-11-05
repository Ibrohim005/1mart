<script setup lang="ts">
/** Диалог «Добавить промокод». Макет: Add Procode 586×313. */
defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean], apply: [string] }>()

const code = ref('')
</script>

<template>
  <UiModal :model-value="modelValue" :title="$t('ui.appshell.addPromoModal.dobavitPromokod')" @update:model-value="emit('update:modelValue', $event)">
    <p class="add-promo__title">{{ $t('common.vvediteKodovoeSlovo') }}</p>

    <input v-model="code" type="text" :placeholder="$t('common.kodovoeSlovo')" class="add-promo__field">

    <button type="button" class="add-promo__submit" @click="emit('apply', code)">{{ $t('common.apply') }}</button>
  </UiModal>
</template>

<style scoped>
.add-promo__title {
  margin: 0 0 6px;
  font-weight: 500;
  font-size: var(--text-3xl);
  line-height: 32px;
  color: #000000;
}

.add-promo__field {
  display: block;
  width: 100%;
  padding-inline: 18.8px;
  border: 0;
  outline: none;
  font: var(--type-input);
  color: var(--input-color);
  height: var(--control-height);
  background: var(--color-field);
  border-radius: var(--field-radius);
  text-align: left;
}

.add-promo__field::placeholder { color: var(--input-placeholder); }

.add-promo__submit {
  width: 100%;
  margin-top: 21px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}
</style>
