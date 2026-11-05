<script setup lang="ts">
/**
 * Оформление возврата (ТЗ UC-58): после доставки, с причиной и по желанию
 * до 5 фото. Фото в демо никуда не загружаются — сервер получает их число.
 */
const props = defineProps<{ modelValue: boolean, busy: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean], submit: [{ reason: string, photos: number }] }>()

const { t } = useI18n()

const REASONS = ['defect', 'notAsDescribed', 'wrongItem', 'changedMind'] as const
const reason = ref<typeof REASONS[number] | ''>('')
const details = ref('')
const photos = ref<File[]>([])

watch(() => props.modelValue, (open) => {
  if (!open) return
  reason.value = ''
  details.value = ''
  photos.value = []
})

function onFiles(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files ?? [])
    .filter(file => file.type.startsWith('image/'))
  photos.value = [...photos.value, ...files].slice(0, 5)
}

const text = computed(() => {
  if (!reason.value) return ''
  const label = t(`pay.return.reasons.${reason.value}`)
  return details.value.trim() ? `${label}: ${details.value.trim()}` : label
})

function submit() {
  if (!reason.value || props.busy) return
  emit('submit', { reason: text.value, photos: photos.value.length })
}
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('pay.return.title')"
    body-padding="20px 24px 24px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="ret" @submit.prevent="submit">
      <fieldset class="ret__reasons">
        <legend class="ret__label">{{ $t('pay.return.reason') }}</legend>
        <label v-for="code in REASONS" :key="code" class="ret__reason" :class="{ 'ret__reason--active': reason === code }">
          <input v-model="reason" type="radio" name="return-reason" :value="code" class="ret__radio">
          {{ $t(`pay.return.reasons.${code}`) }}
        </label>
      </fieldset>

      <label class="ret__field">
        <span class="ret__label">{{ $t('pay.return.details') }}</span>
        <textarea v-model="details" rows="3" maxlength="400" class="ret__textarea" :placeholder="$t('pay.return.detailsPlaceholder')" />
      </label>

      <div class="ret__field">
        <span class="ret__label">{{ $t('pay.return.photos') }}</span>
        <label class="ret__upload">
          <UiIcon name="camera" :size="22" />
          {{ $t('pay.return.addPhotos', { n: photos.length }) }}
          <input type="file" accept="image/*" multiple class="visually-hidden" @change="onFiles">
        </label>
        <ul v-if="photos.length" class="ret__files">
          <li v-for="(file, index) in photos" :key="index">{{ file.name }}</li>
        </ul>
      </div>

      <p class="ret__note">{{ $t('pay.return.note') }}</p>

      <UiButton block type="submit" :disabled="!reason || busy">{{ $t('pay.return.submit') }}</UiButton>
    </form>
  </UiModal>
</template>

<style scoped>
.ret { display: flex; flex-direction: column; gap: 16px; }
.ret__reasons { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; border: 0; }
.ret__label { margin-bottom: 4px; font-weight: 600; font-size: var(--text-lg); color: var(--color-text); }

.ret__reason {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1.5px solid #E4E7EC;
  border-radius: 12px;
  font-size: var(--text-lg);
  cursor: pointer;
}

.ret__reason--active { border-color: var(--color-brand); background: var(--color-brand-tint); }
.ret__radio { accent-color: var(--color-brand); }
.ret__field { display: flex; flex-direction: column; gap: 6px; }

.ret__textarea {
  padding: 12px 14px;
  border: 1.5px solid #E4E7EC;
  border-radius: 12px;
  font: inherit;
  resize: vertical;
  font: var(--type-input);
  color: var(--input-color);
}

.ret__upload {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1.5px dashed #C9D1DA;
  border-radius: 12px;
  font-weight: 600;
  font-size: var(--text-lg);
  cursor: pointer;
}

.ret__upload:focus-within { box-shadow: var(--focus-ring); }
.ret__files { margin: 0; padding-left: 18px; font-size: var(--text-base); color: var(--color-text-muted); }
.ret__note { margin: 0; font-size: var(--text-base); line-height: 20px; color: var(--color-text-muted); }
</style>
