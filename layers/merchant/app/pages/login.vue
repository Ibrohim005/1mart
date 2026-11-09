<script setup lang="ts">
// Вход в кабинет продавца. При успехе возвращаем на ?next или на дашборд.
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const merchant = useMerchantStore()
const localePath = useLocalePath()
const route = useRoute()

const phone = ref('')
const password = ref('')
const error = ref('')
const phoneError = ref('')
const loading = ref(false)
const config = useRuntimeConfig()
const expired = computed(() => route.query.expired === '1')

/** Подсказка про любой пароль нужна только при разработке на моке */
const showDemoHint = import.meta.dev

/** Только свой адрес: иначе внешняя ссылка в next оставляла человека на форме входа */
function nextPath() {
  const next = route.query.next
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : localePath('/dashboard')
}

// Уже вошедшего сразу уводим в кабинет.
if (merchant.isLoggedIn) await navigateTo(localePath('/dashboard'), { replace: true })

async function submit() {
  error.value = ''
  phoneError.value = ''
  if (phone.value.replace(/\D/g, '').length < 9) { phoneError.value = t('auth.errPhone'); return }
  if (password.value.length < 4) { error.value = t('auth.errPassword'); return }
  loading.value = true
  const message = await merchant.signIn(phone.value, password.value)
  loading.value = false
  if (message) { error.value = t('auth.errFailed'); return }
  await navigateTo(nextPath())
}

useSeoMeta({ title: () => `${t('auth.title')} — spotshop Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <form class="login" @submit.prevent="submit">
    <div class="login__head">
      <h1 class="login__title">{{ $t('auth.title') }}</h1>
      <p class="login__sub">{{ $t('auth.subtitle') }}</p>
    </div>

    <p v-if="expired" class="login__expired" role="status">{{ $t('auth.sessionExpired') }}</p>

    <MField
      v-model="phone"
      :label="$t('auth.phone')"
      type="tel"
      inputmode="tel"
      placeholder="+998 90 123 45 67"
      icon="call-fill"
      :error="phoneError"
    />
    <MField
      v-model="password"
      :label="$t('auth.password')"
      type="password"
      placeholder="••••••"
      :error="error"
    />

    <UiButton type="submit" variant="primary" size="lg" block :disabled="loading" class="login__submit">
      {{ loading ? $t('auth.signingIn') : $t('auth.submit') }}
    </UiButton>

    <p class="login__forgot">
      {{ $t('auth.forgot') }}
      <a :href="`mailto:${config.public.supportEmail}`" class="login__link">{{ $t('auth.forgotLink') }}</a>
    </p>

    <p v-if="showDemoHint" class="login__hint">
      <UiIcon name="info-circle" :size="16" color="var(--m-brand-ink)" class="login__hint-icon" />
      {{ $t('auth.demoHint') }}
    </p>

    <p class="login__foot">
      {{ $t('auth.noAccount') }}
      <NuxtLink :to="localePath('/')" class="login__link">{{ $t('auth.registerLink') }}</NuxtLink>
    </p>
  </form>
</template>

<style scoped>
.login__expired {
  margin: 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--color-field);
  font-size: var(--text-sm);
  line-height: 20px;
  color: var(--color-text);
}

.login__forgot {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 20px;
  text-align: center;
  color: var(--color-text-muted);
}

.login { display: flex; flex-direction: column; gap: 18px; }
.login__head { margin-bottom: 10px; }
.login__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-9xl);
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--m-ink);
  text-wrap: balance;
}
.login__sub { margin: 10px 0 0; font-size: var(--text-md); line-height: 1.45; color: var(--m-slate); }
.login .login__submit {
  height: 52px;
  margin-top: 6px;
  border-radius: var(--m-radius-pill);
  font-size: var(--text-base);
}
.login__hint {
  display: flex;
  gap: 8px;
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--m-radius);
  background: var(--m-brand-tint);
  font-size: var(--text-xs);
  line-height: 1.4;
  color: var(--m-brand-ink);
}
.login__hint-icon { flex: none; }
.login__foot { margin: 2px 0 0; font-size: var(--text-sm); color: var(--m-slate); text-align: center; }
.login__link { color: var(--m-brand-strong); font-weight: 600; text-decoration: none; }
.login__link:hover { text-decoration: underline; }
</style>
