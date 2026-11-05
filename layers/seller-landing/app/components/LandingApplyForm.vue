<script setup lang="ts">
// Заявка на подключение. Шлёт на мок /merchant/applications; настоящий бэкенд
// заведёт лид. Все подписи — из словаря; поля верстаем локально, M-компоненты
// кабинета в лендинг не тащим.
const { t } = useI18n()
const api = useApi()

const form = reactive({
  name: '',
  phone: '',
  shopName: '',
  legalForm: 'llc',
  category: '',
  comment: '',
})
const errors = reactive<{ name?: string, phone?: string, shopName?: string }>({})
const loading = ref(false)
const done = ref(false)
// Сбой отправки: показываем баннер с возможностью повторить, а не молча глотаем.
const failed = ref(false)

const legalForms = ['llc', 'ie', 'jsc', 'selfEmployed', 'other'] as const

// Левая панель: только главные условия, те же короткие формулировки, что в героя.
const perks = ['fact1', 'fact2', 'fact3'] as const

function validate(): boolean {
  errors.name = form.name.trim().length < 2 ? t('landing.apply.errName') : undefined
  const digits = form.phone.replace(/\D/g, '').replace(/^998/, '')
  errors.phone = digits.length !== 9 ? t('landing.apply.errPhone') : undefined
  errors.shopName = form.shopName.trim().length < 2 ? t('landing.apply.errShop') : undefined
  return !errors.name && !errors.phone && !errors.shopName
}

async function submit() {
  if (!validate()) return
  failed.value = false
  loading.value = true
  try {
    await api.post('/merchant/applications', { ...form })
    done.value = true
  }
  catch {
    // Сеть/сервер не ответили — сообщаем и даём повторить.
    failed.value = true
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <section id="apply" class="apply">
    <div class="apply__card">
      <aside class="apply__panel">
        <h2 class="apply__title">{{ $t('landing.apply.title') }}</h2>
        <ul class="apply__perks">
          <li v-for="perk in perks" :key="perk" class="apply__perk">
            <UiIcon name="tick-circle-fill" :size="24" color="var(--m-brand-bright)" />
            <span>{{ $t(`landing.hero.${perk}`) }}</span>
          </li>
        </ul>
      </aside>

      <div class="apply__main">
        <div v-if="done" class="apply__success">
          <span class="apply__success-mark"><UiIcon name="tick-circle" :size="44" color="var(--m-on-brand)" /></span>
          <h3 class="apply__success-title">{{ $t('landing.apply.successTitle') }}</h3>
          <p class="apply__success-text">{{ $t('landing.apply.successText') }}</p>
        </div>

        <form v-else class="apply__form" novalidate @submit.prevent="submit">
          <label class="fld">
            <span class="fld__label">{{ $t('landing.apply.name') }}</span>
            <input v-model="form.name" type="text" autocomplete="name" required :aria-invalid="!!errors.name" class="fld__input" :class="{ 'fld__input--err': errors.name }">
            <span v-if="errors.name" class="fld__err">{{ errors.name }}</span>
          </label>

          <label class="fld">
            <span class="fld__label">{{ $t('landing.apply.phone') }}</span>
            <input v-model="form.phone" type="tel" inputmode="tel" autocomplete="tel" required :aria-invalid="!!errors.phone" placeholder="+998 90 123 45 67" class="fld__input" :class="{ 'fld__input--err': errors.phone }">
            <span v-if="errors.phone" class="fld__err">{{ errors.phone }}</span>
          </label>

          <label class="fld">
            <span class="fld__label">{{ $t('landing.apply.shopName') }}</span>
            <input v-model="form.shopName" type="text" autocomplete="organization" required :aria-invalid="!!errors.shopName" class="fld__input" :class="{ 'fld__input--err': errors.shopName }">
            <span v-if="errors.shopName" class="fld__err">{{ errors.shopName }}</span>
          </label>

          <label class="fld">
            <span class="fld__label">{{ $t('landing.apply.legalForm') }}</span>
            <span class="fld__select">
              <select v-model="form.legalForm" class="fld__input">
                <option v-for="lf in legalForms" :key="lf" :value="lf">{{ $t(`m.legalForm.${lf}`) }}</option>
              </select>
              <UiIcon name="alt-arrow-down" :size="16" class="fld__chev" />
            </span>
          </label>

          <label class="fld fld--wide">
            <span class="fld__label">{{ $t('landing.apply.category') }}</span>
            <input v-model="form.category" type="text" class="fld__input">
          </label>

          <label class="fld fld--wide">
            <span class="fld__label">{{ $t('landing.apply.comment') }}</span>
            <textarea v-model="form.comment" rows="3" class="fld__input fld__textarea" />
          </label>

          <p v-if="failed" class="apply__error" role="alert">
            <UiIcon name="warning-2" :size="18" class="apply__error-ic" />
            {{ $t('landing.apply.errSubmit') }}
          </p>

          <div class="apply__submit">
            <UiButton type="submit" variant="primary" block :disabled="loading">
              {{ loading ? $t('landing.apply.sending') : $t('landing.apply.submit') }}
            </UiButton>
            <p class="apply__privacy">{{ $t('landing.polishB.privacy') }}</p>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.apply { padding: 100px 0; background: var(--m-page); }
.apply__card {
  display: grid;
  grid-template-columns: 42% 58%;
  width: var(--container-width);
  max-width: var(--container-width);
  min-height: 700px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: var(--m-radius-xl);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-lg);
}

/* Левая чёрная панель */
.apply__panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px;
  background: var(--m-hero-gradient);
  color: var(--m-on-dark);
}
.apply__title {
  margin: 0 0 16px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-10xl);
  line-height: 1.08;
  letter-spacing: -0.025em;
  color: var(--m-on-dark);
  text-wrap: balance;
}

.apply__perks { display: flex; flex-direction: column; gap: 14px; margin: 32px 0 0; padding: 0; list-style: none; }
.apply__perk { display: flex; align-items: flex-start; gap: 12px; font-size: var(--text-base); line-height: 1.5; color: var(--m-on-dark); }

/* Правая белая часть */
.apply__main { display: flex; flex-direction: column; justify-content: center; padding: 48px 56px; }
.apply__form { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.fld { display: flex; flex-direction: column; gap: 8px; }
.fld--wide { grid-column: 1 / -1; }
.fld__label { font-size: var(--text-sm); font-weight: 500; color: var(--m-ink-soft); }
.fld__input {
  width: 100%;
  height: 54px;
  padding-inline: 16px;
  border: 1px solid transparent;
  border-radius: var(--m-radius);
  background: var(--m-surface-sunken);
  font-family: var(--font-ui);
  font-size: var(--text-md);
  color: var(--m-ink);
  outline: none;
  transition: background var(--m-dur-fast) var(--m-ease), border-color var(--m-dur-fast) var(--m-ease), box-shadow var(--m-dur-fast) var(--m-ease);
}
.fld__input::placeholder { color: var(--m-slate-soft); }
.fld__input:hover { border-color: var(--m-line-strong); }
.fld__input:focus { border-color: var(--m-brand); background: var(--m-surface); box-shadow: var(--m-brand-ring); }
.fld__input--err,
.fld__input--err:hover { border-color: var(--m-danger); }
.fld__input--err:focus { border-color: var(--m-danger); box-shadow: 0 0 0 4px rgb(229 72 77 / 14%); }
.fld__textarea { display: block; height: auto; padding: 14px 16px; line-height: 1.5; resize: vertical; }
.fld__select { position: relative; display: flex; align-items: center; }
.fld__select .fld__input { padding-right: 42px; appearance: none; cursor: pointer; }
.fld__chev { position: absolute; right: 16px; color: var(--m-slate); pointer-events: none; }
.fld__err { font-size: var(--text-xs); color: var(--m-danger-fg); }

.apply__error {
  display: flex;
  align-items: center;
  gap: 10px;
  grid-column: 1 / -1;
  margin: 0;
  padding: 12px 16px;
  border: 1px solid var(--m-danger);
  border-radius: var(--m-radius);
  background: var(--m-danger-bg);
  font-size: var(--text-sm);
  color: var(--m-danger-fg);
}
.apply__error-ic { flex: none; color: var(--m-danger); }
.apply__submit { grid-column: 1 / -1; margin-top: 4px; }
.apply__submit :deep(.btn) { border-radius: var(--m-radius-pill); font-size: var(--text-base); }
.apply__privacy { margin: 14px 0 0; font-size: var(--text-xs); line-height: 1.45; text-align: center; color: var(--m-slate); }

.apply__success { display: flex; flex-direction: column; align-items: center; text-align: center; animation: m-scale-in var(--m-dur-slow) var(--m-ease) both; }
.apply__success-mark {
  display: grid;
  width: 72px; height: 72px;
  margin-bottom: 20px;
  border-radius: 50%;
  background: var(--m-brand-gradient);
  box-shadow: var(--m-shadow-brand);
  place-items: center;
}
.apply__success-title { margin: 0 0 10px; font-family: var(--font-display); font-weight: 700; font-size: var(--text-9xl); letter-spacing: -0.02em; color: var(--m-ink); }
.apply__success-text { margin: 0; font-size: var(--text-lg); line-height: 1.5; color: var(--m-slate); }

@media (prefers-reduced-motion: reduce) {
  .apply__success { animation: none; }
}
</style>
