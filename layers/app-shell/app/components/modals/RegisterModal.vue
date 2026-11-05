<script setup lang="ts">
/** Диалог регистрации. Макет: SIng 586×482. */
const props = defineProps<{ modelValue: boolean }>()

const { t } = useI18n()
const emit = defineEmits<{
  'update:modelValue': [boolean]
  submit: [{ phone: string, password: string, name: string }]
  login: []
}>()

const phone = ref('')
const name = ref('')
const password = ref('')
const error = ref('')

// Номер в Узбекистане — 9 цифр после +998; кнопка до этого неактивна
const digits = computed(() => phone.value.replace(/\D/g, ''))
const isValid = computed(() => digits.value.length === 9 && password.value.length >= 4)

function onPhoneInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 9)
  const parts = [raw.slice(0, 2), raw.slice(2, 5), raw.slice(5, 7), raw.slice(7, 9)].filter(Boolean)
  phone.value = parts.length > 2
    ? `${parts[0]} ${parts[1]}-${parts.slice(2).join('-')}`
    : parts.join(' ')
}

/*
 * Имя спрашивается здесь же и необязательно: `send-otp` принимает
 * `full_name`, а больше его ввести негде — без этого поля покупатель
 * навсегда оставался бы в шапке и в заказах своим телефоном. Пустое имя
 * бэкенд принимает (`allow_blank`), поэтому кнопку оно не блокирует.
 */
/**
 * Пароль спрашивается сразу, вместе с номером: заявку на код бэкенд
 * принимает только с ним (`send-otp` требует пароль и хранит его хеш до
 * подтверждения кода). Диалог отдавал один телефон — при живом бэкенде
 * регистрация с него не начиналась бы вовсе.
 *
 * `fail()` вызывает родитель: занятый номер или лимит отправок — это ответ
 * сервера, и знает его только он, а показать надо здесь, под полями.
 */
function submit() {
  if (!isValid.value) {
    error.value = digits.value.length === 9 ? t('auth.errorPassword') : t('auth.errorPhone')
    return
  }
  error.value = ''
  emit('submit', { phone: `+998 ${phone.value}`, password: password.value, name: name.value.trim() })
}

function fail(message: string) {
  error.value = message
}

// Диалог живёт в шапке и не размонтируется — прошлая ошибка иначе встретит
// пользователя при следующем открытии уже неуместной.
watch(() => props.modelValue, (open) => {
  if (open) error.value = ''
})

defineExpose({ fail })
</script>

<template>
  <UiModal :model-value="modelValue" :title="$t('auth.registerTitle')" @update:model-value="emit('update:modelValue', $event)">
    <p class="register__label">{{ $t('auth.phoneLabel') }}</p>

    <div class="register__field">
      <span class="register__code">+998</span>
      <input
        :value="phone"
        type="tel"
        inputmode="tel"
        autocomplete="tel-national"
        placeholder="00 000-00-00"
        :aria-label="$t('common.nomerTelefona')"
        :aria-invalid="!!error"
        :aria-describedby="error ? 'register-error' : undefined"
        class="register__input"
        @input="onPhoneInput"
      >
    </div>

    <p class="register__label">{{ $t('auth.nameLabel') }}</p>

    <div class="register__field">
      <input
        v-model="name"
        type="text"
        autocomplete="name"
        :placeholder="$t('auth.namePlaceholder')"
        :aria-label="$t('auth.nameLabel')"
        class="register__input"
        @keyup.enter="submit"
      >
    </div>

    <p class="register__label">{{ $t('auth.passwordLabel') }}</p>

    <div class="register__field">
      <input
        v-model="password"
        type="password"
        autocomplete="new-password"
        placeholder="*** *** ***"
        :aria-label="$t('auth.passwordLabel')"
        :aria-invalid="!!error"
        :aria-describedby="error ? 'register-error' : undefined"
        class="register__input"
        @keyup.enter="submit"
      >
    </div>

    <p v-if="error" id="register-error" class="register__error" role="alert">{{ error }}</p>

    <p class="register__login">
      {{ $t('auth.haveAccount') }}
      <button type="button" class="register__login-link" @click="emit('login')">{{ $t('auth.signIn') }}</button>
    </p>

    <button type="button" class="register__submit" :disabled="!isValid" @click="submit">{{ $t('auth.continue') }}</button>

    <p class="register__terms">
      {{ $t('ui.appshell.registerModal.prodolzhayaYaSoglashayusPolitikoy') }}
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
.register__label {
  margin: 9px 0 18px;
  font: var(--type-label);
  color: var(--label-color);
}

.register__field {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 49px;
  border-bottom: 1px solid #E5E7EB;
}

.register__code {
  font: var(--type-input);
  color: var(--input-color);
}

.register__input {
  flex: 1;
  border: 0;
  background: none;
  outline: none;
  font: var(--type-input);
  color: var(--input-color);
}

.register__input::placeholder { color: var(--input-placeholder); }

.register__error {
  margin: 8px 0 0;
  font-size: var(--text-base);
  color: var(--color-danger);
}

.register__login {
  margin: 18px 0 0;
  font-weight: 500;
  font-size: var(--text-2xl);
  line-height: 35px;
  color: #101010;
  text-align: center;
}

.register__login-link {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: var(--color-brand-text);
  cursor: pointer;
}

.register__submit {
  width: 100%;
  margin-top: 18px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.register__submit:disabled { background: #F0F0F0; color: #9A9A9A; cursor: not-allowed; }

.register__terms {
  margin: 14px 0 0;
  font-weight: 500;
  font-size: var(--text-md);
  line-height: 19px;
  color: #1F1F24;
  text-align: center;
}
</style>
