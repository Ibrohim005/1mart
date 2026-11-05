<script setup lang="ts">
/** Диалог «Промокоды». Макет: Procode 586×478. */
interface Promo {
  id: string
  code: string
  description: string
  /** Срок действия. С сервера приходит ISO-дата, показываем дд.мм.гггг */
  until?: string
}

const props = defineProps<{ modelValue: boolean, promos: Promo[] }>()
const emit = defineEmits<{ 'update:modelValue': [boolean], apply: [string] }>()

const selected = ref(props.promos[0]?.id ?? '')
const codeWord = ref('')

// Применяем либо выбранный из списка промокод, либо введённое кодовое слово
const appliedCode = computed(() =>
  codeWord.value.trim() || props.promos.find(promo => promo.id === selected.value)?.code || '',
)

/** Сервер отдаёт дату в ISO — приводим к общему для проекта виду дд.мм.гггг */
function untilLabel(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : formatDate(parsed)
}

// TODO: Connect to backend endpoint POST /cart/promo
function apply() {
  if (!appliedCode.value) return
  emit('apply', appliedCode.value)
  emit('update:modelValue', false)
}
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('common.promokody')"
    body-padding="21px 25px 28px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <ul class="promo__list">
      <li v-for="promo in promos" :key="promo.id">
        <button
          type="button"
          class="promo__row"
          :class="{ 'promo__row--selected': selected === promo.id }"
          @click="selected = promo.id"
        >
          <UiIcon name="discount-shape" :size="29" class="promo__seal" />

          <span class="promo__text">
            <span class="promo__head">
              <span class="promo__code">{{ promo.code }}</span>
              <span v-if="promo.until" class="promo__until">{{ $t('ui.appshell.promoModal.until', { date: untilLabel(promo.until) }) }}</span>
            </span>
            <span class="promo__description">{{ promo.description }}</span>
          </span>

          <span class="promo__radio" :class="{ 'promo__radio--on': selected === promo.id }" aria-hidden="true" />
        </button>
      </li>
    </ul>

    <label class="promo__field">
      <input v-model="codeWord" type="text" :placeholder="$t('common.vvediteKodovoeSlovo')">
    </label>

    <button type="button" class="promo__apply" :disabled="!appliedCode" @click="apply">{{ $t('common.apply') }}</button>
  </UiModal>
</template>

<style scoped>
.promo__seal { flex: none; }

.promo__head {
  display: flex;
  gap: 12px;
  align-items: baseline;
  justify-content: space-between;
}

.promo__until {
  flex: none;
  font-weight: 400;
  font-size: var(--text-md);
  color: var(--color-text-muted);
}

.promo__list { display: flex; flex-direction: column; gap: 18.8px; margin: 0; padding: 0; list-style: none; }

.promo__row {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 90.6px;
  padding-inline: 18.8px;
  border: 1px solid rgb(124 138 148 / 20%);
  border-radius: 18.8px;
  background: none;
  cursor: pointer;
}

.promo__row--selected { border-color: var(--color-brand); }

.promo__text { display: flex; flex: 1; flex-direction: column; gap: 4px; min-width: 0; text-align: left; }

.promo__code {
  font: var(--type-card-title);
  color: var(--color-text);
}

.promo__description {
  font-weight: 400;
  font-size: var(--text-base);
  line-height: 20px;
  color: var(--color-text-muted);
}

.promo__radio {
  width: 35px;
  height: 35px;
  border: 2px solid #E5E7EB;
  border-radius: 50%;
}

.promo__radio--on { border-color: var(--color-brand); border-width: 10px; }

.promo__field {
  display: block;
  margin-top: 20px;
  height: var(--control-height);
  border-radius: var(--field-radius);
  background: var(--color-field);
}

.promo__field input {
  width: 100%;
  height: 100%;
  padding-inline: 24px;
  border: 0;
  background: none;
  outline: none;
  font: var(--type-input);
  color: var(--input-color);
  text-align: left;
}

.promo__field input::placeholder { color: var(--input-placeholder); }

.promo__apply:disabled { opacity: 0.5; cursor: default; }

.promo__apply {
  width: 100%;
  margin-top: 15.6px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}
</style>
