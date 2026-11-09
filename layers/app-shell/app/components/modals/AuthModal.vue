<script setup lang="ts">
/**
 * Вход. Макет: SIng → Tab Bar 586×469, r30.
 * Два поля — телефон с префиксом +998 и пароль, зелёная кнопка 536×68.8
 * r21.9 с иконкой замка и ссылка на регистрацию.
 */
defineProps<{ modelValue: boolean }>()

const { t } = useI18n()
const emit = defineEmits<{
  'update:modelValue': [boolean]
  register: []
  recover: []
  submit: [{ phone: string, password: string }]
}>()

const phone = ref('')
const password = ref('')
const error = ref('')

const digits = computed(() => phone.value.replace(/\D/g, ''))
const canSubmit = computed(() => digits.value.length === 9 && password.value.length >= 4)

/** Маска 00 000-00-00 — как в плейсхолдере макета */
function onPhoneInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 9)
  const parts = [raw.slice(0, 2), raw.slice(2, 5), raw.slice(5, 7), raw.slice(7, 9)].filter(Boolean)
  phone.value = parts.length > 2
    ? `${parts[0]} ${parts[1]}-${parts.slice(2).join('-')}`
    : parts.join(' ')
}

/**
 * Пароль раньше набирался, но никуда не уходил: наружу отдавался один
 * телефон, и вход открывался кому угодно. Теперь уходит пара, а проверяет
 * её сервер.
 *
 * `fail()` вызывает родитель, когда бэкенд отверг данные, — текст ошибки
 * знает только он, а показать её нужно здесь, под полями.
 */
function submit() {
  if (!canSubmit.value) {
    error.value = digits.value.length === 9
      ? t('auth.errorPassword')
      : t('auth.errorPhone')
    return
  }
  error.value = ''
  emit('submit', { phone: `+998 ${phone.value}`, password: password.value })
}

function fail(message: string) {
  error.value = message
}

defineExpose({ fail })
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('auth.needAccount')"
    body-padding="30px 25px 25px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <section class="auth__section">
      <p class="auth__label">{{ $t('auth.phoneLabel') }}</p>
      <div class="auth__field">
        <span class="auth__code">+998</span>
        <input
          :value="phone"
          class="auth__input"
          type="tel"
          inputmode="tel"
          autocomplete="tel-national"
          placeholder="00 000-00-00"
          :aria-label="$t('common.nomerTelefona')"
          :aria-invalid="!!error"
          :aria-describedby="error ? 'auth-error' : undefined"
          @input="onPhoneInput"
        >
      </div>
    </section>

    <section class="auth__section">
      <p class="auth__label">{{ $t('auth.passwordLabel') }}</p>
      <div class="auth__field">
        <input
          v-model="password"
          class="auth__input"
          type="password"
          autocomplete="current-password"
          placeholder="*** *** ***"
          :aria-label="$t('ui.appshell.authModal.parol')"
          :aria-invalid="!!error"
        :aria-describedby="error ? 'auth-error' : undefined"
        @keyup.enter="submit"
      >
      </div>
    </section>

    <p class="auth__forgot-line">
      <button type="button" class="auth__forgot" @click="emit('recover')">{{ $t('auth.forgotPassword') }}</button>
    </p>

    <p v-if="error" :id="'auth-error'" class="auth__error" role="alert">{{ error }}</p>

    <!-- В узле кнопки есть иконка замка, но она из внешней библиотеки
         и на отрисовке макета не видна — кнопка текстовая. -->
    <button type="button" class="auth__submit" @click="submit">{{ $t('common.login') }}</button>

    <p class="auth__register-line">
      {{ $t('auth.noAccount') }}
      <button type="button" class="auth__register" @click="emit('register')">{{ $t('auth.register') }}</button>
    </p>
  </UiModal>
</template>

<style scoped>
/*
 * Типографика диалогов входа. В макете поле ввода набрано 38px, подпись 25px,
 * кнопка 24px — на экране это выглядело как надписи для слабовидящих:
 * окно небольшое, а текст в нём крупнее заголовков страницы.
 * Приведено к спокойной шкале, пропорции между элементами сохранены.
 */
/* Панель в макете 586×469 — зазоры добирают её высоту */
/* Макет SIng: между блоками 18px, метка отстоит от поля на 19px */
.auth__section { margin-bottom: 18px; }

.auth__label {
  margin: 0 0 19px;
  font: var(--type-label);
  color: var(--label-color);
}

.auth__forgot-line {
  margin: -4px 0 14px;
  text-align: right;
}

.auth__forgot {
  padding: 0;
  border: 0;
  background: none;
  color: #676767;
  cursor: pointer;
  font: var(--type-label);
}

.auth__forgot:hover { color: var(--color-brand-text); }

.auth__field {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 49px;
  border-bottom: 1px solid #EDEFF2;
}

.auth__field:focus-within { border-bottom-color: var(--color-brand); }

.auth__code {
  font: var(--type-input);
  color: var(--input-color);
}

/* В макете курсор нарисован красной чертой — делаем его настоящим,
   чтобы он мигал и стоял там, где идёт ввод */
.auth__input {
  flex: 1;
  width: 100%;
  border: 0;
  background: none;
  caret-color: #ED2020;
  font: var(--type-input);
  color: var(--input-color);
}

.auth__input::placeholder { color: var(--input-placeholder); }
.auth__input:focus { outline: none; }

.auth__error {
  margin: 4px 0 0;
  font-size: var(--text-base);
  color: var(--color-danger);
}

.auth__submit {
  display: grid;
  grid-auto-flow: column;
  gap: 10px;
  place-items: center;
  width: 100%;
  margin-top: 24px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.auth__submit:hover { background: #0BC525; }
.auth__submit:active { background: #009317; }
.auth__submit:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.auth__register-line {
  margin: 16px 0 0;
  font-weight: 500;
  font-size: var(--text-base);
  line-height: 24px;
  color: #101010;
  text-align: center;
}

.auth__register {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: var(--color-brand-text);
  cursor: pointer;
}

.auth__register:hover { text-decoration: underline; }
.auth__register:focus-visible { outline: none; box-shadow: var(--focus-ring); }
</style>
