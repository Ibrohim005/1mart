<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ middleware: 'auth' })

/**
 * «Скидки и промокоды». Макет: Мои заказы (5058:104977) —
 * поле «Кодовое слово» с кнопкой «Применить» и список кодов с датами и статусами.
 */
interface Promo {
  code: string
  date: string
  status?: 'used' | 'expired'
}

const code = ref('')

// TODO: Connect to backend endpoint GET /user/promocodes
const promos = ref<Promo[]>([
  { code: 'DZHSSK150D10', date: '31.12.2026' },
  { code: 'IDHWOA130DSE', date: '30.11.2026' },
  { code: 'SUFIUSHDFIEW9', date: '15.11.2026' },
  { code: 'E1A4AS2340D1', date: '12.09.2026', status: 'used' },
  { code: 'HYI2IASD82SY3', date: '20.08.2026', status: 'expired' },
])

const statusLabel: Record<string, string> = { used: 'ui.account.promo.ispolzovan', expired: 'ui.account.promo.prosrochen' }

const error = ref('')

/**
 * Промокод: латиница и цифры, 6–20 символов, без повторов.
 * Реальную проверку делает бэкенд — здесь отсекаем заведомо неверное.
 * TODO: Connect to backend endpoint POST /user/promocodes
 */
function apply() {
  const value = code.value.trim().toUpperCase()

  if (!value) {
    error.value = t('common.vvediteKodovoeSlovo')
    return
  }
  if (!/^[A-Z0-9]{6,20}$/.test(value)) {
    error.value = t('ui.account.promo.kodSostoit')
    return
  }
  if (promos.value.some(item => item.code === value)) {
    error.value = t('ui.account.promo.takoyPromokodUzheDobavlen')
    return
  }

  error.value = ''
  promos.value = [{ code: value, date: new Date().toLocaleDateString('ru-RU') }, ...promos.value]
  code.value = ''
}

useSeoMeta({ title: () => t('ui.account.promo.seoTitle'), robots: 'noindex, nofollow' })
</script>

<template>
  <AccountLayout :title="$t('account.promo')">
    <div class="promo">
      <input
        v-model="code"
        type="text"
        :placeholder="$t('common.kodovoeSlovo')"
        class="promo__field"
        :aria-invalid="!!error"
        :aria-describedby="error ? 'promo-error' : undefined"
        @keyup.enter="apply"
      >

      <p v-if="error" id="promo-error" class="promo__error" role="alert">{{ error }}</p>

      <button type="button" class="promo__apply" @click="apply">{{ $t('common.apply') }}</button>

      <h2 class="promo__title">{{ $t('common.promokody') }}</h2>

      <ul class="promo__list">
        <li
          v-for="item in promos"
          :key="item.code"
          class="promo__item"
          :class="{ 'promo__item--inactive': item.status }"
        >
          <span class="promo__code">{{ item.code }}</span>

          <span class="promo__meta">
            <span v-if="item.status" class="promo__status">{{ $t(statusLabel[item.status]!) }}</span>
            <span class="promo__date" :class="{ 'promo__date--active': !item.status }">{{ item.date }}</span>
          </span>
        </li>
      </ul>
    </div>
  </AccountLayout>
</template>

<style scoped>
.promo__error { margin: 8px 0 0; font-size: var(--text-md); color: var(--color-danger); }

.promo {
  padding: 20px;
  border-radius: 20px;
  background: var(--color-surface);
}

.promo__field {
  display: block;
  width: 100%;
  height: 52px;
  padding-inline: 18px;
  border: 1px solid #EBEFF2;
  border-radius: 12px;
  background: var(--color-page);
  outline: none;
  font: var(--type-input);
  color: var(--input-color);
}

.promo__field::placeholder { color: var(--input-placeholder); }

.promo__apply {
  width: 100%;
  margin-top: 12px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.promo__apply:hover { filter: brightness(.96); }
.promo__apply:active { filter: brightness(.92); }

.promo__title {
  margin: 28px 0 14px;
  font: var(--type-section-title);
  color: var(--color-text);
}

.promo__list { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; }

.promo__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 16px;
  border-top: 1px solid #EBEFF2;
}

.promo__code {
  font-weight: 700;
  font-size: var(--text-xl);
  color: #101010;
}

.promo__item--inactive .promo__code { color: #B7BEC6; }

.promo__meta { display: flex; align-items: center; gap: 12px; }

.promo__status {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding-inline: 10px;
  border-radius: 8px;
  background: #F0F2F5;
  font-weight: 500;
  font-size: var(--text-xs);
  color: #7C8A94;
}

.promo__date { font-weight: 500; font-size: var(--text-base); color: #B7BEC6; }
.promo__date--active { color: var(--color-brand-text); }
</style>
