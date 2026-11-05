<script setup lang="ts">
/**
 * Диалог «Оставить отзыв». Макет: Ad Card 586×835 —
 * три ряда оценок по 5 звёзд 41.2, два поля и чекбокс анонимности.
 */

defineProps<{ modelValue: boolean }>()

const { t } = useI18n()
const emit = defineEmits<{ 'update:modelValue': [boolean], submit: [] }>()

const criteria = [
  { code: 'quality', label: t('ui.appshell.reviewModal.quality') },
  { code: 'service', label: t('ui.appshell.reviewModal.service') },
  { code: 'speed', label: t('ui.appshell.reviewModal.speed') },
]

const ratings = reactive<Record<string, number>>({ quality: 0, service: 0, speed: 0 })
// Подсветка при наведении: звёзды заливаются до той, на которую навели
const hovered = reactive<Record<string, number>>({ quality: 0, service: 0, speed: 0 })
const pros = ref('')
const cons = ref('')
const anonymous = ref(true)

const canSubmit = computed(() => Object.values(ratings).every(value => value > 0))
</script>

<template>
  <UiModal :model-value="modelValue" :title="$t('ui.appshell.reviewModal.ostavitOtzyv')" @update:model-value="emit('update:modelValue', $event)">
    <section v-for="item in criteria" :key="item.code" class="review__section">
      <p class="review__label">{{ item.label }}</p>
      <div class="review__stars">
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          class="review__star"
          :aria-label="$t('ui.appshell.reviewModal.ratingOf5', { rating: n })"
          :aria-pressed="(ratings[item.code] ?? 0) >= n"
          @click="ratings[item.code] = n"
          @mouseenter="hovered[item.code] = n"
          @mouseleave="hovered[item.code] = 0"
        >
          <UiIcon
            :name="(hovered[item.code] || ratings[item.code] || 0) >= n ? 'star-fill' : 'star'"
            :size="41.2"
            :color="(hovered[item.code] || ratings[item.code] || 0) >= n ? '#FF9F0A' : 'var(--color-gray)'"
          />
        </button>
      </div>
    </section>

    <p class="review__hint">
      {{ $t('ui.appshell.reviewModal.drugimPokupatelyamOchenNuzhen') }}
    </p>

    <input v-model="pros" type="text" :placeholder="$t('ui.appshell.reviewModal.preimuschestva')" class="review__field">
    <input v-model="cons" type="text" :placeholder="$t('ui.appshell.reviewModal.nedostatki')" class="review__field">

    <button
      type="button"
      class="review__anonymous"
      :aria-pressed="anonymous"
      @click="anonymous = !anonymous"
    >
      <span>{{ $t('ui.appshell.reviewModal.anonimnyyOtzyv') }}</span>
      <span class="review__check" :class="{ 'review__check--on': anonymous }">
        <UiIcon v-if="anonymous" name="tick-square-fill" :size="20.6" />
      </span>
    </button>

    <button type="button" class="review__submit" :disabled="!canSubmit" @click="emit('submit')">
      {{ $t('ui.appshell.reviewModal.otpravitOtzyv') }}
    </button>

    <p class="review__note">
      {{ $t('ui.appshell.reviewModal.obyazatelnoUchtemOcenkuDostavki') }}
    </p>
  </UiModal>
</template>

<style scoped>
.review__section { margin-bottom: 15px; }

.review__label {
  margin: 0 0 7px;
  font: var(--type-label);
  color: var(--label-color);
}

.review__stars { display: flex; gap: 13.3px; }

.review__star {
  display: grid;
  place-items: center;
  flex: 0 0 41.2px;
  width: 41.2px;
  height: 41.2px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}
.review__star:disabled { cursor: default; }

.review__hint {
  margin: 18px 0 12px;
  font-weight: 400;
  font-size: var(--text-5xl);
  line-height: 31px;
  color: #5C5757;
}

.review__field {
  display: block;
  width: 100%;
  margin-bottom: 15.5px;
  padding-inline: 23px;
  border: 0;
  outline: none;
  font: var(--type-input);
  color: var(--input-color);
  height: var(--control-height);
  background: var(--color-field);
  border-radius: var(--field-radius);
}

.review__field::placeholder { color: var(--input-placeholder); }

.review__anonymous {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 48px;
  padding-inline: 16px;
  border: 0;
  border-radius: 11.4px;
  background: none;
  font-weight: 500;
  font-size: var(--text-lg);
  color: #5C5757;
  cursor: pointer;
}

.review__check {
  display: grid;
  place-items: center;
  width: 20.6px;
  height: 20.6px;
  border: 1px solid #DDDDDD;
  border-radius: 6.1px;
  font-size: var(--text-xs);
  color: transparent;
}

.review__check--on { border-width: 0; background: transparent; color: var(--color-brand); }

.review__submit {
  width: 100%;
  margin-top: 14px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.review__submit:disabled { background: #F0F0F0; color: #9A9A9A; cursor: not-allowed; }

.review__note {
  margin: 20px 0 0;
  font-weight: 400;
  font-size: var(--text-xl);
  line-height: 23px;
  color: #676767;
}
</style>
