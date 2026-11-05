<script setup lang="ts">
/**
 * Первый шаг восстановления пароля: номер телефона.
 * Геометрия повторяет диалог регистрации — это тот же макет SIng 586×482.
 */
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean], submit: [string], login: [] }>()

const phone = ref('')
const digits = computed(() => phone.value.replace(/\D/g, ''))
const isValid = computed(() => digits.value.length === 9)

/**
 * Отказ показываем здесь, а не уводим молча на регистрацию: бэкенд отвечает
 * одним и тем же 400 и на «такого номера нет», и на превышенный лимит
 * отправок. Увод на регистрацию во втором случае был бы просто неправдой.
 */
const error = ref('')

function fail(message: string) {
  error.value = message
}

defineExpose({ fail })

watch(() => props.modelValue, (open) => {
  if (open) error.value = ''
})

function onPhoneInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 9)
  const parts = [raw.slice(0, 2), raw.slice(2, 5), raw.slice(5, 7), raw.slice(7, 9)].filter(Boolean)
  phone.value = parts.length > 2
    ? `${parts[0]} ${parts[1]}-${parts.slice(2).join('-')}`
    : parts.join(' ')
}
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('auth.recoverTitle')"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="recover__hint">{{ $t('auth.recoverHint') }}</p>

    <p class="recover__label">{{ $t('auth.phoneLabel') }}</p>

    <div class="recover__field">
      <span class="recover__code">+998</span>
      <input
        :value="phone"
        type="tel"
        inputmode="tel"
        autocomplete="tel-national"
        placeholder="00 000-00-00"
        :aria-label="$t('common.nomerTelefona')"
        :aria-invalid="!!error"
        :aria-describedby="error ? 'recover-error' : undefined"
        class="recover__input"
        @input="onPhoneInput"
        @keyup.enter="isValid && emit('submit', `+998 ${phone}`)"
      >
    </div>

    <p v-if="error" id="recover-error" class="recover__error" role="alert">{{ error }}</p>

    <p class="recover__login">
      {{ $t('auth.haveAccount') }}
      <button type="button" class="recover__login-link" @click="emit('login')">{{ $t('auth.signIn') }}</button>
    </p>

    <button
      type="button"
      class="recover__submit"
      :disabled="!isValid"
      @click="emit('submit', `+998 ${phone}`)"
    >{{ $t('auth.recoverSubmit') }}</button>
  </UiModal>
</template>

<style scoped>
/*
 * Типографика диалогов входа. В макете поле ввода набрано 38px, подпись 25px,
 * кнопка 24px — на экране это выглядело как надписи для слабовидящих:
 * окно небольшое, а текст в нём крупнее заголовков страницы.
 * Приведено к спокойной шкале, пропорции между элементами сохранены.
 */
.recover__hint {
  margin: 0 0 22px;
  font-weight: 400;
  font-size: var(--text-base);
  line-height: 26px;
  color: #676767;
}

.recover__label {
  margin: 0 0 18px;
  font: var(--type-label);
  color: var(--label-color);
}

.recover__field {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 49px;
  border-bottom: 1px solid #EDEFF2;
}

.recover__code {
  font: var(--type-input);
  color: var(--input-color);
}

.recover__input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: none;
  font: var(--type-input);
  color: var(--input-color);
}

.recover__input::placeholder { color: var(--input-placeholder); }

.recover__error {
  margin: 8px 0 0;
  font-size: var(--text-base);
  color: var(--color-danger);
}

.recover__login {
  margin: 24px 0 0;
  font-weight: 400;
  font-size: var(--text-xl);
  color: #676767;
}

.recover__login-link {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-weight: 500;
  color: var(--color-brand-text);
  cursor: pointer;
}

.recover__login-link:hover { text-decoration: underline; }

.recover__submit {
  width: 100%;
  margin-top: 28px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.recover__submit:disabled { background: #F0F0F0; color: #9A9A9A; cursor: not-allowed; }
</style>
