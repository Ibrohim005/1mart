<script setup lang="ts">
const { t } = useI18n()

/**
 * Форма обращения на страницах «Написать нам» и «Подать жалобу».
 * Отдельного макета нет — собрана на полях из «Настроек»:
 * заливка #EDF0EF, обводка #C6CECB, высота 53.3, r16.16.
 */
const props = defineProps<{ kind: 'contact' | 'complaint' }>()

// TODO: Connect to backend endpoint POST /support/requests
const form = reactive({ name: '', phone: '', order: '', message: '' })
const sending = ref(false)
const sent = ref(false)
const error = ref('')

const PHONE = /^\+?[\d\s()-]{9,20}$/

async function submit() {
  error.value = ''

  if (form.name.trim().length < 2) {
    error.value = t('ui.catalog.contactForm.errorName')
    return
  }
  if (!PHONE.test(form.phone.trim())) {
    error.value = t('ui.catalog.contactForm.errorPhone')
    return
  }
  if (form.message.trim().length < 10) {
    error.value = t('ui.catalog.contactForm.errorMessage')
    return
  }

  sending.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 400))
    sent.value = true
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <form v-if="!sent" class="request" @submit.prevent="submit">
    <h2 class="request__title">
      {{ props.kind === 'complaint' ? $t('ui.catalog.contactForm.titleComplaint') : $t('ui.catalog.contactForm.titleContact') }}
    </h2>

    <div class="request__row">
      <label class="request__field">
        <span class="request__label">{{ $t('ui.catalog.contactForm.name') }}</span>
        <input v-model="form.name" type="text" maxlength="120" autocomplete="name" :aria-invalid="!!error" :aria-describedby="error ? 'request-error' : undefined">
      </label>

      <label class="request__field">
        <span class="request__label">{{ $t('common.nomerTelefona') }}</span>
        <input v-model="form.phone" type="tel" maxlength="20" placeholder="+998" autocomplete="tel" :aria-invalid="!!error" :aria-describedby="error ? 'request-error' : undefined">
      </label>
    </div>

    <label class="request__field">
      <span class="request__label">{{ $t('ui.catalog.contactForm.order') }}</span>
      <input v-model="form.order" type="text" maxlength="20" placeholder="#120021">
    </label>

    <label class="request__field">
      <span class="request__label">{{ $t('ui.catalog.contactForm.message') }}</span>
      <textarea v-model="form.message" rows="5" maxlength="2000" :aria-invalid="!!error" :aria-describedby="error ? 'request-error' : undefined" />
    </label>

    <p v-if="error" id="request-error" class="request__error" role="alert">{{ error }}</p>

    <button type="submit" class="request__submit" :disabled="sending">
      {{ sending ? $t('ui.catalog.contactForm.sending') : $t('ui.catalog.contactForm.submit') }}
    </button>
  </form>

  <p v-else class="request__done" role="status">{{ $t('ui.catalog.contactForm.done') }}</p>
</template>

<style scoped>
.request {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 32px;
  padding-top: 28px;
  border-top: 1px solid #EDF0EF;
}

.request__title {
  margin: 0;
  font: var(--type-section-title);
  color: var(--color-text);
}

.request__row { display: flex; gap: 16px; }
.request__row .request__field { flex: 1; }

.request__field { display: flex; flex-direction: column; gap: 10px; }

.request__label {
  font: var(--type-label);
  color: var(--label-color);
}

.request__field input,
.request__field textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1.35px solid #C6CECB;
  border-radius: 16.16px;
  background: #EDF0EF;
  resize: vertical;
  font: var(--type-input);
  color: var(--input-color);
}

.request__field input { height: 53.3px; padding-block: 0; }

.request__field input:focus,
.request__field textarea:focus { outline: none; box-shadow: var(--focus-ring); }

.request__error {
  margin: 0;
  font-size: var(--text-base);
  color: var(--color-danger);
}

.request__submit {
  align-self: flex-start;
  padding-inline: 40px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.request__submit:hover { background: #097A24; }
.request__submit:disabled { opacity: 0.6; cursor: default; }

.request__done {
  margin: 32px 0 0;
  padding: 20px;
  border-radius: 16px;
  background: var(--color-field);
  font-weight: 500;
  font-size: var(--text-2xl);
  color: var(--color-text);
}
</style>
