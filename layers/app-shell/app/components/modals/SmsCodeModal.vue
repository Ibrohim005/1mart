<script setup lang="ts">
/**
 * Диалог ввода кода из SMS. Макет: SIng 586×462 —
 * пять ячеек 94.9×100.7 с фоном #6BF57C 8%, цифра 50.1.
 */
const props = defineProps<{
  modelValue: boolean
  phone: string
  /** Один и тот же экран обслуживает регистрацию и восстановление пароля */
  title?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [boolean], submit: [string], resend: [] }>()

/**
 * Ячеек шесть, а не пять: столько цифр в коде у бэкенда
 * (`generate_otp_code`, `max_length=6`). С пятью ввести настоящий код было
 * невозможно в принципе — кнопка включалась на заведомо неполном коде.
 */
const EMPTY = ['', '', '', '', '', '']
const digits = ref<string[]>([...EMPTY])
const filled = computed(() => digits.value.every(d => d !== ''))
const code = computed(() => digits.value.join(''))

/** Текст отказа знает только сервер: код неверный, просрочен, лимит попыток. */
const error = ref('')

function fail(message: string) {
  error.value = message
}

defineExpose({ fail })

/**
 * Отсчёт до повторной отправки. В макете подпись 01:30 — это стартовое
 * значение, дальше таймер идёт вниз. Своего срока до повторной отправки
 * бэкенд не сообщает, поэтому число остаётся фронтовым.
 */
const RESEND_SECONDS = 90
const left = ref(RESEND_SECONDS)
let ticker: ReturnType<typeof setInterval> | undefined

const timer = computed(() => {
  const m = Math.floor(left.value / 60).toString().padStart(2, '0')
  const sec = (left.value % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
})

function start() {
  clearInterval(ticker)
  left.value = RESEND_SECONDS
  ticker = setInterval(() => {
    if (left.value > 0) left.value -= 1
    else clearInterval(ticker)
  }, 1000)
}

/**
 * Повторная отправка. Раньше кнопка только перезапускала таймер: нового кода
 * никто не просил, и пользователь, не получивший SMS, оставался в тупике
 * навсегда. Теперь запрос делает родитель — он же знает, регистрация это
 * или восстановление, и обновляет заявку.
 */
function resend() {
  if (left.value > 0) return
  digits.value = [...EMPTY]
  error.value = ''
  start()
  emit('resend')
}

// Код одноразовый: оставшиеся в ячейках цифры и прошлая ошибка при
// следующем открытии только мешают.
watch(() => props.modelValue, (open) => {
  if (!open) {
    clearInterval(ticker)
    return
  }
  digits.value = [...EMPTY]
  error.value = ''
  start()
})

onUnmounted(() => clearInterval(ticker))

function onInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  digits.value[index] = input.value.replace(/\D/g, '').slice(-1)
  const next = input.nextElementSibling as HTMLInputElement | null
  if (digits.value[index] && next) next.focus()
}
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="title ?? $t('auth.registerTitle')"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="sms__hint">{{ $t('auth.smsHint') }}</p>

    <div class="sms__code">
      <input
        v-for="(digit, index) in digits"
        :key="index"
        :value="digit"
        class="sms__digit"
        inputmode="numeric"
        maxlength="1"
        :aria-invalid="!!error"
        :aria-describedby="error ? 'sms-error' : undefined"
        @input="onInput(index, $event)"
      >
    </div>

    <p v-if="error" id="sms-error" class="sms__error" role="alert">{{ error }}</p>

    <div class="sms__row">
      <span class="sms__phone">
        {{ phone }}
        <UiIcon name="edit" :size="20" class="sms__edit" />
      </span>

      <button
        type="button"
        class="sms__resend"
        :disabled="left > 0"
        @click="resend"
      >
        {{ $t('auth.resend') }}
        <span v-if="left > 0" class="sms__timer">{{ timer }}</span>
      </button>
    </div>

    <button type="button" class="sms__submit" :disabled="!filled" @click="emit('submit', code)">{{ $t('auth.continue') }}</button>
  </UiModal>
</template>

<style scoped>
/*
 * Типографика диалогов входа. В макете поле ввода набрано 38px, подпись 25px,
 * кнопка 24px — на экране это выглядело как надписи для слабовидящих:
 * окно небольшое, а текст в нём крупнее заголовков страницы.
 * Приведено к спокойной шкале, пропорции между элементами сохранены.
 */
.sms__hint {
  margin: 0 0 18px;
  font-weight: 400;
  font-size: var(--text-base);
  line-height: 26px;
  color: #676767;
}

.sms__code { display: flex; gap: 12.5px; }

/*
 * В макете ячейка 94.9×100.7, но их там пять. Шесть таких же в ширину
 * панели (586) не влезают, поэтому ячейка тянется сама, а пропорции и
 * кегль сохранены относительно макетных.
 */
.sms__digit {
  flex: 1;
  min-width: 0;
  aspect-ratio: 94.9 / 100.7;
  border: 0;
  border-radius: 18.8px;
  background: rgb(20 164 99 / 8%);
  outline: none;
  font-weight: 600;
  font-size: 41.6px;
  color: #0A0A0A;
  text-align: center;
}

.sms__error {
  margin: 12px 0 0;
  font-size: var(--text-base);
  color: var(--color-danger);
}

.sms__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 19px;
}

.sms__phone {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  height: 56.4px;
  padding-inline: 15.7px;
  border-radius: 18.8px;
  background: #F0F0F0;
  font-weight: 500;
  font-size: var(--text-base);
  color: #7C7C7C;
}

.sms__resend {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  border: 0;
  background: none;
  color: #0A0A0A;
  cursor: pointer;
  font: var(--type-button-sm);
}

.sms__resend:disabled { color: #676767; cursor: default; }
.sms__resend:not(:disabled):hover { color: var(--color-brand-text); }

.sms__timer {
  display: inline-flex;
  align-items: center;
  height: 36.5px;
  padding-inline: 12.5px;
  border-radius: 78.3px;
  background: #F0F0F0;
  color: #676767;
}

.sms__submit {
  width: 100%;
  margin-top: 33px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.sms__submit:disabled { background: #F0F0F0; color: #9A9A9A; cursor: not-allowed; }
</style>
