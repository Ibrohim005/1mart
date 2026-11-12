<script setup lang="ts">
/**
 * Регистрация и вход компании через OneID или ключ ЭЦП (B2B, решение заказчика 2026-11-12).
 *
 * 1. Личность: OneID (директор входит учётной записью id.egov.uz) или ЭЦП
 *    (подпись ключом организации через E-IMZO).
 * 2. Компания: данные приходят из налогового реестра — название, ИНН, ОКЭД,
 *    директор, адрес. Руководитель вводит только телефон для SMS и входа и пароль.
 *    Если компания уже зарегистрирована — предлагаем войти как руководитель.
 * 3. Готово: разделы каталога, подобранные по ОКЭД, и переход к сотрудникам.
 *
 * Данные компании сервер берёт из подтверждённой личности (token), а не из формы:
 * иначе можно было бы зарегистрировать чужую фирму.
 */
import type { Category } from '#shared/types/catalog'
import type { Company, CompanyCandidate } from '#shared/types/company'
import type { EimzoKey } from '../../composables/useEimzo'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const api = useApi()
const auth = useAuthStore()
const route = useRoute()
const localePath = useLocalePath()
const eimzo = useEimzo()
const { refresh: refreshAccess } = await useAccess()

useSeoMeta({ title: () => t('org.register.seoTitle'), robots: 'noindex' })

type Method = 'oneid' | 'eimzo'
type Candidate = CompanyCandidate & { registered: boolean }

const method = ref<Method | null>(route.query.method === 'eimzo' ? 'eimzo' : route.query.method === 'oneid' ? 'oneid' : null)
const step = ref<1 | 2 | 3>(1)
const busy = ref(false)
const error = ref('')

/* ---------- Шаг 1: личность ---------- */

const keys = ref<EimzoKey[]>([])
const keyId = ref('')
const keysStatus = ref<'idle' | 'pending' | 'success' | 'error'>('idle')

async function loadKeys() {
  keysStatus.value = 'pending'
  try {
    keys.value = await eimzo.listKeys()
    keyId.value = keys.value[0]?.id ?? ''
    keysStatus.value = 'success'
  }
  catch {
    keysStatus.value = 'error'
  }
}

// Ключи есть только на компьютере пользователя (E-IMZO) — читаем их в браузере,
// иначе сервер и браузер рисуют разное
watch(method, (value) => {
  error.value = ''
  if (value === 'eimzo' && keysStatus.value === 'idle') loadKeys()
})

const identity = ref<{ token: string, fullName: string, companies: Candidate[] } | null>(null)
const inn = ref('')

function acceptIdentity(result: { token: string, fullName: string, companies: Candidate[] }) {
  identity.value = result
  inn.value = result.companies[0]?.inn ?? ''
  step.value = 2
}

/** OneID: уходим на авторизацию, возвращаемся с кодом в ?oneid= */
async function startOneId() {
  busy.value = true
  error.value = ''
  try {
    const { url } = await api.get<{ url: string }>('/auth/oneid/start')
    await navigateTo(/^https?:/.test(url) ? url : localePath(url), { external: /^https?:/.test(url) })
  }
  catch {
    error.value = t('org.register.errorOneId')
  }
  finally {
    busy.value = false
  }
}

async function finishOneId(code: string) {
  busy.value = true
  try {
    acceptIdentity(await api.post('/auth/oneid/callback', { code }))
  }
  catch {
    error.value = t('org.register.errorOneId')
    method.value = 'oneid'
  }
  finally {
    busy.value = false
  }
}

async function signWithKey() {
  const key = keys.value.find(item => item.id === keyId.value)
  if (!key) return
  busy.value = true
  error.value = ''
  try {
    const { challenge } = await api.get<{ challenge: string }>('/auth/eimzo/challenge')
    const pkcs7 = await eimzo.sign(key, challenge)
    acceptIdentity(await api.post('/auth/eimzo/verify', { pkcs7 }))
  }
  catch {
    error.value = t('org.register.errorSignature')
  }
  finally {
    busy.value = false
  }
}

onMounted(() => {
  if (method.value === 'eimzo') loadKeys()
  const code = typeof route.query.oneid === 'string' ? route.query.oneid : ''
  if (code) {
    method.value = 'oneid'
    finishOneId(code)
  }
})

/* ---------- Шаг 2: компания ---------- */

const chosen = computed(() => identity.value?.companies.find(item => item.inn === inn.value) ?? null)
const phone = ref('')
const password = ref('')
const repeat = ref('')
const fieldErrors = ref<Record<string, string>>({})

const phoneDigits = computed(() => phone.value.replace(/\D/g, ''))

function onPhoneInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 9)
  const parts = [raw.slice(0, 2), raw.slice(2, 5), raw.slice(5, 7), raw.slice(7, 9)].filter(Boolean)
  phone.value = parts.length > 2 ? `${parts[0]} ${parts[1]}-${parts.slice(2).join('-')}` : parts.join(' ')
}

function validate() {
  const errors: Record<string, string> = {}
  if (phoneDigits.value.length !== 9) errors.phone = t('org.register.errorPhone')
  if (password.value.length < 8 || !/\d/.test(password.value) || !/\p{L}/u.test(password.value)) errors.password = t('org.register.errorPassword')
  else if (password.value !== repeat.value) errors.repeat = t('auth.errorPasswordMatch')
  fieldErrors.value = errors
  return !Object.keys(errors).length
}

/** Коды ошибок сервера → понятный текст у поля */
const SERVER_ERRORS: Record<string, [string, string]> = {
  company_registered: ['inn', 'org.register.errorRegistered'],
  phone_taken: ['phone', 'org.register.errorPhoneTaken'],
  phone_incomplete: ['phone', 'org.register.errorPhone'],
  password_weak: ['password', 'org.register.errorPassword'],
  identity_expired: ['', 'org.register.errorExpired'],
}

function showServerErrors(caught: unknown) {
  const list = ((caught as { data?: Array<{ code: string }> }).data ?? [])
  const errors: Record<string, string> = {}
  for (const item of list) {
    const [field, key] = SERVER_ERRORS[item.code] ?? ['', 'org.register.errorGeneric']
    if (field) errors[field] = t(key)
    else error.value = t(key)
  }
  if (!list.length) error.value = t('org.register.errorGeneric')
  fieldErrors.value = errors
}

const company = ref<Company | null>(null)

async function register() {
  if (!identity.value || !chosen.value || !validate()) return
  busy.value = true
  error.value = ''
  try {
    const result = await api.post<{ phone: string, name: string, company: Company }>('/company/register', {
      token: identity.value.token,
      inn: chosen.value.inn,
      phone: `+998${phoneDigits.value}`,
      password: password.value,
    })
    auth.openSession({ phone: result.phone, name: result.name })
    company.value = result.company
    await refreshAccess()
    step.value = 3
  }
  catch (caught) {
    showServerErrors(caught)
  }
  finally {
    busy.value = false
  }
}

/** Компания уже есть: входим как её руководитель той же подтверждённой личностью */
async function signInAsHead() {
  if (!identity.value || !chosen.value) return
  busy.value = true
  error.value = ''
  try {
    const user = await api.post<{ phone: string, name: string }>('/auth/identity-login', { token: identity.value.token, inn: chosen.value.inn })
    auth.openSession(user)
    await refreshAccess()
    await navigateTo(localePath('/account/company'))
  }
  catch (caught) {
    showServerErrors(caught)
  }
  finally {
    busy.value = false
  }
}

/* ---------- Шаг 3: готово ---------- */

const { data: tree } = await useApiData<Category[]>('register:categories', '/categories/root', { lazy: true })

/** Названия подобранных по ОКЭД разделов — из дерева на языке интерфейса */
const suggested = computed(() => {
  const slugs = company.value?.suggestedCategories ?? chosen.value?.suggestedCategories ?? []
  const all = (tree.value ?? []).flatMap(root => [root, ...(root.children ?? [])])
  return slugs.map(slug => all.find(item => item.slug === slug)).filter((item): item is Category => Boolean(item))
})

const steps = computed(() => [
  t('org.register.stepIdentity'),
  t('org.register.stepCompany'),
  t('org.register.stepDone'),
])

function restart() {
  identity.value = null
  step.value = 1
  error.value = ''
  fieldErrors.value = {}
}
</script>

<template>
  <div class="register">
    <nav class="register__crumbs" :aria-label="$t('common.hlebnyeKroshki')">
      <NuxtLink :to="localePath('/')">{{ $t('breadcrumbs.home') }}</NuxtLink> / {{ $t('org.register.title') }}
    </nav>

    <div class="register__layout">
      <aside class="register__aside">
        <h1 class="register__title">{{ $t('org.register.title') }}</h1>
        <p class="register__lead">{{ $t('org.register.lead') }}</p>

        <ol class="register__steps">
          <li
            v-for="(label, index) in steps"
            :key="label"
            class="register__step"
            :class="{ 'register__step--active': step === index + 1, 'register__step--done': step > index + 1 }"
            :aria-current="step === index + 1 ? 'step' : undefined"
          >
            <span class="register__step-mark">
              <UiIcon v-if="step > index + 1" name="tick-circle-fill" :size="22" color="currentColor" />
              <template v-else>{{ index + 1 }}</template>
            </span>
            {{ label }}
          </li>
        </ol>

        <p class="register__note">
          <UiIcon name="security-fill" :size="18" color="currentColor" />
          {{ $t('org.register.privacy') }}
        </p>
      </aside>

      <section class="register__card">
        <p v-if="error" class="register__error" role="alert">{{ error }}</p>

        <!-- Шаг 1: способ подтверждения личности -->
        <template v-if="step === 1">
          <h2 class="register__heading">{{ $t('org.register.chooseMethod') }}</h2>

          <div class="register__methods" role="radiogroup" :aria-label="$t('org.register.chooseMethod')">
            <button
              type="button"
              role="radio"
              class="register__method"
              :class="{ 'register__method--active': method === 'oneid' }"
              :aria-checked="method === 'oneid'"
              @click="method = 'oneid'"
            >
              <span class="register__method-icon"><UiIcon name="verify" :size="26" color="currentColor" /></span>
              <span class="register__method-title">OneID</span>
              <span class="register__method-text">{{ $t('org.register.oneIdText') }}</span>
            </button>
            <button
              type="button"
              role="radio"
              class="register__method"
              :class="{ 'register__method--active': method === 'eimzo' }"
              :aria-checked="method === 'eimzo'"
              @click="method = 'eimzo'"
            >
              <span class="register__method-icon"><UiIcon name="shield-tick-fill" :size="26" color="currentColor" /></span>
              <span class="register__method-title">{{ $t('org.register.eimzoTitle') }}</span>
              <span class="register__method-text">{{ $t('org.register.eimzoText') }}</span>
            </button>
          </div>

          <div v-if="method === 'oneid'" class="register__panel">
            <p class="register__hint">{{ $t('org.register.oneIdHint') }}</p>
            <UiButton :disabled="busy" @click="startOneId">{{ busy ? $t('ui.shared.state.loading') : $t('org.register.oneIdButton') }}</UiButton>
          </div>

          <div v-else-if="method === 'eimzo'" class="register__panel">
            <p class="register__label">{{ $t('org.register.chooseKey') }}</p>
            <p v-if="keysStatus === 'pending' || keysStatus === 'idle'" class="register__hint">{{ $t('ui.shared.state.loading') }}</p>
            <p v-else-if="keysStatus === 'error'" class="register__hint">{{ $t('org.register.noEimzo') }}</p>
            <div v-else class="register__keys" role="radiogroup" :aria-label="$t('org.register.chooseKey')">
              <label v-for="key in keys" :key="key.id" class="register__key" :class="{ 'register__key--active': keyId === key.id }">
                <input v-model="keyId" class="visually-hidden" type="radio" name="eimzo-key" :value="key.id">
                <span class="register__key-main">
                  <span class="register__key-company">{{ key.companyName }}</span>
                  <span class="register__key-meta">{{ key.owner }} · {{ $t('org.register.inn') }} {{ key.inn }}</span>
                </span>
                <span class="register__key-valid">{{ $t('org.register.validTo', { date: key.validTo }) }}</span>
                <span class="register__radio" :class="{ 'register__radio--on': keyId === key.id }" aria-hidden="true" />
              </label>
            </div>
            <UiButton :disabled="busy || !keyId" @click="signWithKey">{{ busy ? $t('ui.shared.state.loading') : $t('org.register.signButton') }}</UiButton>
          </div>
        </template>

        <!-- Шаг 2: компания из реестра -->
        <template v-else-if="step === 2 && identity">
          <h2 class="register__heading">{{ $t('org.register.companyTitle') }}</h2>
          <p class="register__hint">{{ $t('org.register.confirmedAs', { name: identity.fullName }) }}</p>

          <div class="register__companies" role="radiogroup" :aria-label="$t('org.register.companyTitle')">
            <label
              v-for="item in identity.companies"
              :key="item.inn"
              class="register__company"
              :class="{ 'register__company--active': inn === item.inn }"
            >
              <input v-model="inn" class="visually-hidden" type="radio" name="company" :value="item.inn">
              <span class="register__company-name">{{ item.name }}</span>
              <dl class="register__facts">
                <div><dt>{{ $t('org.register.inn') }}</dt><dd>{{ item.inn }}</dd></div>
                <div><dt>{{ $t('org.register.oked') }}</dt><dd>{{ item.oked.code }} — {{ item.oked.title }}</dd></div>
                <div><dt>{{ $t('org.register.director') }}</dt><dd>{{ item.director }}</dd></div>
                <div><dt>{{ $t('org.register.address') }}</dt><dd>{{ item.address }}</dd></div>
              </dl>
            </label>
          </div>

          <div v-if="chosen?.registered" class="register__registered" role="status">
            <UiIcon name="info-circle" :size="22" color="currentColor" />
            <div>
              <p class="register__registered-title">{{ $t('org.register.alreadyTitle') }}</p>
              <p class="register__registered-text">{{ $t('org.register.alreadyText') }}</p>
            </div>
            <UiButton :disabled="busy" @click="signInAsHead">{{ $t('org.register.signInAsHead') }}</UiButton>
          </div>

          <form v-else class="register__form" novalidate @submit.prevent="register">
            <label class="register__field">
              <span class="register__label">{{ $t('org.register.headPhone') }}</span>
              <span class="register__input-wrap" :class="{ 'register__input-wrap--error': fieldErrors.phone }">
                <span class="register__prefix">+998</span>
                <input
                  :value="phone"
                  class="register__input"
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel-national"
                  placeholder="00 000-00-00"
                  :aria-invalid="!!fieldErrors.phone"
                  @input="onPhoneInput"
                >
              </span>
              <span v-if="fieldErrors.phone" class="register__field-error">{{ fieldErrors.phone }}</span>
              <span v-else class="register__field-hint">{{ $t('org.register.headPhoneHint') }}</span>
            </label>

            <div class="register__row">
              <label class="register__field">
                <span class="register__label">{{ $t('auth.passwordLabel') }}</span>
                <span class="register__input-wrap" :class="{ 'register__input-wrap--error': fieldErrors.password }">
                  <input v-model="password" class="register__input" type="password" autocomplete="new-password" :aria-invalid="!!fieldErrors.password">
                </span>
                <span v-if="fieldErrors.password" class="register__field-error">{{ fieldErrors.password }}</span>
                <span v-else class="register__field-hint">{{ $t('org.register.passwordHint') }}</span>
              </label>
              <label class="register__field">
                <span class="register__label">{{ $t('auth.repeatPasswordLabel') }}</span>
                <span class="register__input-wrap" :class="{ 'register__input-wrap--error': fieldErrors.repeat }">
                  <input v-model="repeat" class="register__input" type="password" autocomplete="new-password" :aria-invalid="!!fieldErrors.repeat">
                </span>
                <span v-if="fieldErrors.repeat" class="register__field-error">{{ fieldErrors.repeat }}</span>
              </label>
            </div>

            <p v-if="fieldErrors.inn" class="register__field-error">{{ fieldErrors.inn }}</p>

            <div class="register__actions">
              <UiButton type="submit" :disabled="busy">{{ busy ? $t('ui.shared.state.loading') : $t('org.register.submit') }}</UiButton>
              <UiButton variant="ghost" @click="restart">{{ $t('org.register.otherMethod') }}</UiButton>
            </div>
          </form>
        </template>

        <!-- Шаг 3: готово -->
        <template v-else-if="step === 3 && company">
          <div class="register__done">
            <UiSuccessMark :size="64" />
            <h2 class="register__heading">{{ $t('org.register.doneTitle') }}</h2>
            <p class="register__hint">{{ $t('org.register.doneText', { name: company.name }) }}</p>
          </div>

          <div class="register__suggested">
            <p class="register__label">{{ $t('org.register.suggestedTitle', { code: company.oked.code }) }}</p>
            <ul class="register__chips">
              <li v-for="item in suggested" :key="item.slug" class="register__chip">{{ item.title }}</li>
            </ul>
            <p class="register__field-hint">{{ $t('org.register.suggestedText') }}</p>
          </div>

          <div class="register__actions">
            <UiButton @click="navigateTo(localePath('/account/company'))">{{ $t('org.register.addStaff') }}</UiButton>
            <UiButton variant="secondary" @click="navigateTo(localePath('/'))">{{ $t('org.register.toCatalog') }}</UiButton>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.register { width: var(--container-width); margin: 0 auto; padding: 24px 0 64px; }
.register__crumbs { margin-bottom: 24px; font-size: var(--text-sm); color: var(--color-text-muted); }
.register__crumbs a:hover { color: var(--color-brand-text); }

.register__layout { display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: start; }

.register__aside { position: sticky; top: 24px; display: flex; flex-direction: column; gap: 20px; }
.register__title { margin: 0; font: var(--type-page-title); color: var(--color-text); }
.register__lead { margin: 0; font-size: var(--text-base); line-height: 1.5; color: var(--color-text-muted); }

.register__steps { display: flex; flex-direction: column; gap: 4px; margin: 0; padding: 12px; border-radius: 12px; background: var(--color-surface); list-style: none; }
.register__step { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 8px; font-weight: 500; font-size: var(--text-base); color: var(--color-text-muted); }
.register__step--active { background: var(--color-field); color: var(--color-text); }
.register__step--done { color: var(--color-brand-text); }
.register__step-mark { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--color-field); font-weight: 600; font-size: var(--text-sm); }
.register__step--active .register__step-mark { background: var(--color-brand); color: var(--color-on-brand); }
.register__step--done .register__step-mark { background: none; }

.register__note { display: flex; gap: 8px; margin: 0; font-size: var(--text-sm); line-height: 1.45; color: var(--color-text-muted); }
.register__note :deep(svg) { flex: none; margin-top: 1px; }

.register__card { display: flex; flex-direction: column; gap: 20px; padding: 28px; border-radius: 12px; background: var(--color-surface); }
.register__heading { margin: 0; font: var(--type-section-title); color: var(--color-text); }
.register__hint { margin: 0; font-size: var(--text-base); line-height: 1.5; color: var(--color-text-muted); }
.register__label { margin: 0; font: var(--type-label); color: var(--label-color); }
.register__error { margin: 0; padding: 12px 16px; border-radius: 8px; background: rgb(192 42 38 / 8%); font-size: var(--text-base); color: var(--color-danger); }

.register__methods { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.register__method {
  display: grid;
  grid-template-columns: 48px 1fr;
  grid-template-rows: auto auto;
  column-gap: 14px;
  row-gap: 4px;
  padding: 18px;
  border: 1px solid var(--color-line);
  border-radius: 12px;
  background: var(--color-surface);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease;
}
.register__method:hover { border-color: var(--color-text-muted); }
.register__method--active { border-color: var(--color-brand); box-shadow: inset 0 0 0 1px var(--color-brand); }
.register__method:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.register__method-icon { grid-row: span 2; display: grid; place-items: center; width: 48px; height: 48px; border-radius: 10px; background: var(--color-field); color: var(--color-brand-text); }
.register__method-title { font: var(--type-card-title); color: var(--color-text); }
.register__method-text { font-size: var(--text-sm); line-height: 1.45; color: var(--color-text-muted); }

.register__panel { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; padding-top: 4px; }

.register__keys, .register__companies { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.register__key, .register__company {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--color-line);
  border-radius: 10px;
  cursor: pointer;
}
.register__key--active, .register__company--active { border-color: var(--color-brand); box-shadow: inset 0 0 0 1px var(--color-brand); }
.register__key:has(:focus-visible), .register__company:has(:focus-visible) { box-shadow: var(--focus-ring); }
.register__key-main { display: flex; flex: 1; flex-direction: column; gap: 3px; min-width: 0; }
.register__key-company { font-weight: 600; font-size: var(--text-base); color: var(--color-text); }
.register__key-meta, .register__key-valid { font-size: var(--text-sm); color: var(--color-text-muted); }
.register__radio { flex: none; width: 22px; height: 22px; border: 2px solid var(--color-line); border-radius: 50%; }
.register__radio--on { border: 7px solid var(--color-brand); }

.register__company { flex-direction: column; align-items: stretch; gap: 10px; }
.register__company-name { font: var(--type-card-title); color: var(--color-text); }
.register__facts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin: 0; }
.register__facts div { display: flex; flex-direction: column; gap: 2px; }
.register__facts dt { font-size: var(--text-xs); color: var(--color-text-muted); }
.register__facts dd { margin: 0; font-size: var(--text-sm); line-height: 1.4; color: var(--color-text); }

.register__registered { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 14px; padding: 16px; border-radius: 10px; background: var(--color-field); color: var(--color-text); }
.register__registered-title { margin: 0 0 2px; font-weight: 600; font-size: var(--text-base); }
.register__registered-text { margin: 0; font-size: var(--text-sm); color: var(--color-text-muted); }

.register__form { display: flex; flex-direction: column; gap: 18px; }
.register__row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.register__field { display: flex; flex-direction: column; gap: 8px; }
.register__input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--field-height);
  padding-inline: 14px;
  border: 1px solid transparent;
  border-radius: var(--field-radius);
  background: var(--color-field);
}
.register__input-wrap:focus-within { border-color: var(--color-brand); }
.register__input-wrap--error { border-color: var(--color-danger); }
.register__prefix { font: var(--type-input); color: var(--color-text-muted); }
.register__input { flex: 1; min-width: 0; border: 0; outline: none; background: none; font: var(--type-input); color: var(--input-color); }
.register__input::placeholder { color: var(--input-placeholder); }
.register__field-hint { font-size: var(--text-sm); color: var(--color-text-muted); }
.register__field-error { margin: 0; font-size: var(--text-sm); color: var(--color-danger); }

.register__actions { display: flex; gap: 12px; }

.register__done { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
.register__suggested { display: flex; flex-direction: column; gap: 12px; padding: 18px; border-radius: 10px; background: var(--color-field); }
.register__chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; }
.register__chip { padding: 6px 12px; border-radius: 8px; background: var(--color-surface); font-weight: 500; font-size: var(--text-sm); color: var(--color-text); }
</style>
