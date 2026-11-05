<script setup lang="ts">
/**
 * Диалог выбора из списка: карты оплаты (Card 586×527)
 * и адреса доставки (Location 586×330). Строка 64.2 с радио 35.
 */
interface ChoiceOption {
  id: string
  title: string
  subtitle?: string
}

const props = defineProps<{
  modelValue: boolean
  title: string
  hint?: string
  options: ChoiceOption[]
  /** Что выбрано сейчас. Без этого окно всегда показывало первую строку */
  value?: string
  actionLabel: string
}>()

const emit = defineEmits<{ 'update:modelValue': [boolean], add: [], select: [string] }>()

const selected = ref(props.value ?? props.options[0]?.id ?? '')

/*
 * При открытии показываем то, что выбрано на странице. Раньше отметка
 * всегда стояла на первой строке: человек выбирал третий адрес, открывал
 * окно снова — и видел отмеченным первый.
 */
watch(() => props.modelValue, (open) => {
  if (open) selected.value = props.value ?? props.options[0]?.id ?? ''
})

// Выбор строки сразу отдаём наружу — родитель обновляет адрес/карту
watch(selected, value => emit('select', value))
</script>

<template>
  <UiModal :model-value="modelValue" :title="title" @update:model-value="$emit('update:modelValue', $event)">
    <p v-if="hint" class="choice__hint">{{ hint }}</p>

    <ul class="choice__list">
      <li v-for="option in options" :key="option.id" class="choice__item">
        <button type="button" class="choice__row" @click="selected = option.id">
          <span class="choice__text">
            <span class="choice__title">{{ option.title }}</span>
            <span v-if="option.subtitle" class="choice__subtitle">{{ option.subtitle }}</span>
          </span>

          <span class="choice__radio" :class="{ 'choice__radio--on': selected === option.id }" aria-hidden="true" />
        </button>
      </li>
    </ul>

    <template #footer>
      <button type="button" class="choice__action" @click="emit('add')">
        <UiIcon name="plus" :size="24" class="choice__action-plus" />
        {{ actionLabel }}
      </button>
    </template>
  </UiModal>
</template>

<style scoped>
.choice__hint {
  margin: 0 0 10px;
  font-family: var(--font-ui);
  font-weight: 500;
  font-size: var(--text-2xl);
  line-height: 29.2px;
  color: #8F8F8F;
}

.choice__list { margin: 0; padding: 0; list-style: none; }

.choice__item + .choice__item { border-top: 1.5px solid #F2F2F2; }

.choice__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 64.2px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.choice__text { display: flex; flex-direction: column; gap: 2px; text-align: left; }

.choice__title {
  font-weight: 600;
  font-size: var(--text-xl);
  line-height: 22px;
  color: #101010;
}

.choice__subtitle {
  font-weight: 400;
  font-size: var(--text-md);
  line-height: 19px;
  color: var(--color-text-muted);
}

.choice__radio {
  width: 35px;
  height: 35px;
  border: 2px solid #E5E7EB;
  border-radius: 50%;
}

.choice__radio--on {
  border-color: var(--color-brand);
  border-width: 10px;
}

.choice__action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 555px;
  border: 0;
  background: #E5E6E7;
  color: #242424;
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.choice__action-plus { font-size: var(--text-4xl); line-height: 1; }
</style>
