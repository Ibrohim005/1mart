<script setup lang="ts">
/**
 * Последний шаг восстановления: новый пароль и его повтор.
 * Поля повторяют вход — те же подчёркнутые строки 49px.
 */
const props = defineProps<{
  modelValue: boolean
  /** Заголовок и подсказка для первого входа сотрудника; по умолчанию — восстановление */
  title?: string
  hint?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [boolean], submit: [string] }>()

const { t } = useI18n()
const password = ref('')
const repeat = ref('')
const error = ref('')
const busy = ref(false)

/**
 * Минимум восемь символов — требование бэкенда (`min_length=8` у обоих
 * полей смены пароля). С прежними четырьмя короткий пароль доезжал до
 * бэкенда и возвращался отказом на последнем шаге, уже после кода из SMS.
 */
const MIN_LENGTH = 8
const isValid = computed(() => password.value.length >= MIN_LENGTH && repeat.value.length >= MIN_LENGTH)

// Диалог живёт в шапке и не размонтируется — чистим его при каждом открытии
watch(() => props.modelValue, (open) => {
  if (!open) return
  password.value = ''
  repeat.value = ''
  error.value = ''
})

/**
 * `fail()` вызывает родитель: просроченный токен или отказ бэкенда — это его
 * ответ. Без этого окно застывало бы, а пароль оставался прежним.
 */
function fail(message: string) {
  error.value = message
  busy.value = false
}

defineExpose({ fail })

async function submit() {
  if (!isValid.value) {
    error.value = t('auth.errorPasswordShort')
    return
  }
  if (password.value !== repeat.value) {
    error.value = t('auth.errorPasswordMatch')
    return
  }

  error.value = ''
  busy.value = true
  try {
    emit('submit', password.value)
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="title ?? $t('auth.newPasswordTitle')"
    body-padding="30px 25px 25px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p v-if="hint" class="password__hint">{{ hint }}</p>
    <section class="password__section">
      <p class="password__label">{{ $t('auth.newPasswordLabel') }}</p>
      <div class="password__field">
        <input
          v-model="password"
          class="password__input"
          type="password"
          autocomplete="new-password"
          placeholder="*** *** ***"
          :aria-label="$t('auth.newPasswordLabel')"
          :aria-invalid="!!error"
          :aria-describedby="error ? 'password-error' : undefined"
        >
      </div>
    </section>

    <section class="password__section">
      <p class="password__label">{{ $t('auth.repeatPasswordLabel') }}</p>
      <div class="password__field">
        <input
          v-model="repeat"
          class="password__input"
          type="password"
          autocomplete="new-password"
          placeholder="*** *** ***"
          :aria-label="$t('auth.repeatPasswordLabel')"
          :aria-invalid="!!error"
          :aria-describedby="error ? 'password-error' : undefined"
          @keyup.enter="submit"
        >
      </div>
    </section>

    <p v-if="error" id="password-error" class="password__error" role="alert">{{ error }}</p>

    <button type="button" class="password__submit" :disabled="busy" @click="submit">
      {{ $t('auth.savePassword') }}
    </button>
  </UiModal>
</template>

<style scoped>
/*
 * Типографика диалогов входа. В макете поле ввода набрано 38px, подпись 25px,
 * кнопка 24px — на экране это выглядело как надписи для слабовидящих:
 * окно небольшое, а текст в нём крупнее заголовков страницы.
 * Приведено к спокойной шкале, пропорции между элементами сохранены.
 */
.password__section { margin-bottom: 18px; }

.password__label {
  margin: 0 0 19px;
  font: var(--type-label);
  color: var(--label-color);
}

.password__field {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 49px;
  border-bottom: 1px solid #EDEFF2;
}

.password__input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: none;
  font: var(--type-input);
  color: var(--input-color);
}

.password__input::placeholder { color: var(--input-placeholder); }

.password__error {
  margin: 0 0 12px;
  font-size: var(--text-xl);
  color: #E23D3D;
}

.password__submit {
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

.password__submit:disabled { background: #F0F0F0; color: #9A9A9A; cursor: not-allowed; }

.password__hint { margin: 0 0 20px; font-size: var(--text-base); line-height: 1.45; color: var(--color-text-muted); }
</style>
