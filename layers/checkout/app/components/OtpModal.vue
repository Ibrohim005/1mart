<script setup lang="ts">
/**
 * Подтверждение оплаты SMS-кодом (ТЗ п.4.1.6.10): 6 символов A-Z a-z 0-9,
 * код живёт 59 секунд, после 3 неверных вводов действия ограничены на
 * 15 минут. Попытки и блокировку считает сервер — здесь только показ.
 *
 * В демо SMS-шлюза нет, поэтому код виден на экране и в консоли.
 */
const props = defineProps<{
  modelValue: boolean
  phone: string
  /** Когда код перестанет действовать, ms */
  expiresAt: number
  attemptsLeft: number
  /** До какого момента действия заблокированы, ms; 0 — блокировки нет */
  lockedUntil: number
  testCode: string
  /** Сообщение после проверки: «неверный код», «код истёк» */
  error: string
  busy: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [boolean], verify: [string], resend: [] }>()

const LENGTH = 6
const chars = ref<string[]>(Array.from({ length: LENGTH }, () => ''))
const inputs = ref<HTMLInputElement[]>([])
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => (now.value = Date.now()), 250)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const locked = computed(() => props.lockedUntil > now.value)
const secondsLeft = computed(() => Math.max(0, Math.ceil((props.expiresAt - now.value) / 1000)))
const lockLeft = computed(() => {
  const total = Math.max(0, Math.ceil((props.lockedUntil - now.value) / 1000))
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
})
const code = computed(() => chars.value.join(''))
const complete = computed(() => /^[A-Za-z0-9]{6}$/.test(code.value))

function reset() {
  chars.value = Array.from({ length: LENGTH }, () => '')
  nextTick(() => inputs.value[0]?.focus())
}

// Новый код (повторная отправка) или ошибка — поля очищаются
watch(() => props.expiresAt, reset)
watch(() => props.error, (value) => {
  if (value) reset()
})
watch(() => props.modelValue, (open) => {
  if (open) reset()
})

const ALLOWED = /[A-Za-z0-9]/g

function onInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const value = (target.value.match(ALLOWED) ?? []).join('')
  if (!value) {
    chars.value[index] = ''
    target.value = ''
    return
  }
  // Вставка или автозаполнение сразу нескольких символов
  for (let i = 0; i < value.length && index + i < LENGTH; i++) chars.value[index + i] = value[i]!
  target.value = chars.value[index]!
  const next = Math.min(LENGTH - 1, index + value.length)
  inputs.value[next]?.focus()
  if (complete.value) submit()
}

function onKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !chars.value[index] && index > 0) {
    chars.value[index - 1] = ''
    inputs.value[index - 1]?.focus()
    event.preventDefault()
  }
  if (event.key === 'ArrowLeft' && index > 0) inputs.value[index - 1]?.focus()
  if (event.key === 'ArrowRight' && index < LENGTH - 1) inputs.value[index + 1]?.focus()
  if (event.key === 'Enter' && complete.value) submit()
}

function onPaste(index: number, event: ClipboardEvent) {
  const text = event.clipboardData?.getData('text') ?? ''
  const value = (text.match(ALLOWED) ?? []).join('').slice(0, LENGTH - index)
  if (!value) return
  event.preventDefault()
  for (let i = 0; i < value.length; i++) chars.value[index + i] = value[i]!
  inputs.value[Math.min(LENGTH - 1, index + value.length)]?.focus()
  if (complete.value) submit()
}

function submit() {
  if (!complete.value || props.busy || locked.value || secondsLeft.value === 0) return
  emit('verify', code.value)
}

function setInput(element: unknown, index: number) {
  if (element) inputs.value[index] = element as HTMLInputElement
}
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="$t('pay.otp.title')"
    body-padding="20px 24px 24px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="locked" class="otp otp--locked" role="alert">
      <span class="otp__lock" aria-hidden="true"><UiIcon name="info-circle" :size="34" /></span>
      <p class="otp__lock-title">{{ $t('pay.otp.lockedTitle') }}</p>
      <p class="otp__text">{{ $t('pay.otp.lockedText') }}</p>
      <p class="otp__timer">{{ $t('pay.otp.lockedLeft', { time: lockLeft }) }}</p>
      <UiButton block variant="secondary" @click="emit('update:modelValue', false)">{{ $t('pay.common.close') }}</UiButton>
    </div>

    <div v-else class="otp">
      <p class="otp__text">{{ $t('pay.otp.text', { phone }) }}</p>

      <div class="otp__cells" :class="{ 'otp__cells--error': error }" role="group" :aria-label="$t('pay.otp.title')">
        <input
          v-for="(char, index) in chars"
          :key="index"
          :ref="element => setInput(element, index)"
          :value="char"
          class="otp__cell"
          type="text"
          inputmode="text"
          autocomplete="one-time-code"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          maxlength="6"
          :aria-label="$t('pay.otp.cell', { n: index + 1 })"
          :disabled="busy"
          @input="onInput(index, $event)"
          @keydown="onKeydown(index, $event)"
          @paste="onPaste(index, $event)"
        >
      </div>

      <p v-if="error" class="otp__error" role="alert">{{ error }}</p>
      <p v-else class="otp__attempts">{{ $t('pay.otp.attempts', { n: attemptsLeft }) }}</p>

      <p class="otp__demo">
        {{ $t('pay.otp.demoCode') }} <strong class="otp__demo-code">{{ testCode }}</strong>
      </p>

      <UiButton block :disabled="!complete || busy || secondsLeft === 0" @click="submit">
        {{ busy ? $t('pay.summary.processing') : $t('pay.otp.confirm') }}
      </UiButton>

      <p v-if="secondsLeft > 0" class="otp__resend-wait">{{ $t('pay.otp.resendIn', { s: secondsLeft }) }}</p>
      <button v-else type="button" class="otp__resend" :disabled="busy" @click="emit('resend')">{{ $t('pay.otp.resend') }}</button>
    </div>
  </UiModal>
</template>

<style scoped>
.otp { display: flex; flex-direction: column; align-items: stretch; gap: 14px; text-align: center; }

.otp__text { margin: 0; font-size: var(--text-lg); line-height: 22px; color: var(--color-text-muted); }

.otp__cells { display: flex; justify-content: center; gap: 10px; }

.otp__cell {
  width: 52px;
  height: 60px;
  border: 1.5px solid #D0D5DD;
  border-radius: 12px;
  background: #F9FAFB;
  outline: none;
  font-weight: 700;
  font-size: var(--text-5xl);
  text-align: center;
  color: var(--color-text);
}

.otp__cell:focus { border-color: var(--color-brand); box-shadow: var(--focus-ring); background: var(--color-surface); }
.otp__cells--error .otp__cell { border-color: var(--color-danger, #E53935); }

.otp__error { margin: 0; font-weight: 500; font-size: var(--text-base); color: var(--color-danger, #E53935); }
.otp__attempts { margin: 0; font-size: var(--text-sm); color: var(--color-text-muted); }

.otp__demo {
  margin: 0;
  padding: 10px 12px;
  border: 1px dashed #F59E0B;
  border-radius: 12px;
  background: #FFFBEB;
  font-size: var(--text-base);
  color: #92400E;
}

.otp__demo-code { font-family: var(--font-ui); font-variant-numeric: tabular-nums; font-size: var(--text-xl); letter-spacing: 2px; }

.otp__resend-wait { margin: 0; font-size: var(--text-base); color: var(--color-text-muted); }

.otp__resend {
  align-self: center;
  padding: 6px 10px;
  border: 0;
  background: none;
  color: var(--color-brand-text);
  cursor: pointer;
  font: var(--type-button-sm);
}

.otp--locked { align-items: center; }
.otp__lock { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: #FDECEC; }
.otp__lock-title { margin: 0; font-weight: 700; font-size: var(--text-4xl); color: var(--color-text); }
.otp__timer { margin: 0 0 6px; font-weight: 700; font-size: var(--text-3xl); font-variant-numeric: tabular-nums; color: var(--color-danger, #E53935); }
</style>
