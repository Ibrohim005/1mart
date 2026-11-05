<script setup lang="ts">
import type { CompanyProfile } from '#shared/types/merchant'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const api = useApi()
const toast = useToast()
const sm = useStatusMeta()

const { data, status, error, refresh } = await useApiData<CompanyProfile>('m:company', '/merchant/company')

// Реквизиты и ИНН меняет только маркетплейс, поэтому редактируемы лишь витрина
// и контакты. Значение shopName из формы сразу отражается в шапке профиля.
const form = reactive({
  shopName: '',
  director: '',
  phone: '',
  email: '',
  legalAddress: '',
  logo: '',
})
watch(data, (value) => {
  if (!value) return
  form.shopName = value.shopName
  form.director = value.director
  form.phone = value.phone
  form.email = value.email
  form.legalAddress = value.legalAddress
  form.logo = value.logo ?? ''
}, { immediate: true })

const initial = computed(() => form.shopName.trim().charAt(0) || '1')

/** Логотип показывается покупателям на странице продавца. Сохраняется кнопкой «Сохранить». */
const MAX_LOGO_BYTES = 2 * 1024 * 1024

function pickLogo(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) { toast.show(t('m.company.logoType'), 'error'); return }
  if (file.size > MAX_LOGO_BYTES) { toast.show(t('m.company.logoSize'), 'error'); return }
  const reader = new FileReader()
  reader.onload = () => { form.logo = String(reader.result) }
  reader.readAsDataURL(file)
}

const saving = ref(false)
const errors = reactive({ shopName: '', phone: '', email: '' })

function validate() {
  errors.shopName = form.shopName.trim().length < 2 ? t('m.company.errName') : ''
  errors.phone = form.phone.replace(/\D/g, '').length < 9 ? t('m.company.errPhone') : ''
  errors.email = form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? t('m.company.errEmail') : ''
  return !errors.shopName && !errors.phone && !errors.email
}

const merchant = useMerchantStore()

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    await api.put('/merchant/company', { ...form })
    merchant.renameShop(form.shopName.trim())
    toast.show(t('m.common.saved'))
  }
  catch {
    toast.show(t('m.common.loadError'), 'error')
  }
  finally {
    saving.value = false
  }
}

useSeoMeta({ title: () => `${t('m.company.title')} — 1mart Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.company.title')" :subtitle="$t('m.company.subtitle')">
      <UiButton variant="primary" :disabled="saving" @click="save">{{ $t('m.common.save') }}</UiButton>
    </MPageHeader>

    <div v-if="status === 'pending' && !data" class="company__loading">
      <UiSkeleton height="120px" radius="18px" />
      <div class="company__grid">
        <UiSkeleton height="260px" radius="18px" />
        <UiSkeleton height="260px" radius="18px" />
      </div>
    </div>

    <template v-else-if="data">
      <!-- Шапка профиля -->
      <section class="cprofile">
        <div class="cprofile__logo">
          <img v-if="form.logo" :src="form.logo" :alt="form.shopName" class="cprofile__avatar cprofile__avatar--image">
          <span v-else class="cprofile__avatar">{{ initial }}</span>
          <label class="cprofile__upload">
            <input type="file" accept="image/jpeg,image/png,image/webp" class="cprofile__file" @change="pickLogo">
            <UiIcon name="camera" :size="16" />
            {{ $t(form.logo ? 'm.company.logoReplace' : 'm.company.logoUpload') }}
          </label>
          <button v-if="form.logo" type="button" class="cprofile__remove" @click="form.logo = ''">{{ $t('m.company.logoRemove') }}</button>
        </div>
        <div class="cprofile__main">
          <h2 class="cprofile__name">{{ form.shopName }}</h2>
          <div class="cprofile__meta">
            <span class="cprofile__legal">{{ data.legalName }}</span>
            <span class="cprofile__badge">{{ $t(`m.legalForm.${data.legalForm}`) }}</span>
            <MStatus :tone="sm.company(data.status).tone">{{ $t(sm.company(data.status).key) }}</MStatus>
          </div>
        </div>
        <div class="cprofile__stats">
          <div class="cprofile__stat">
            <span class="cprofile__stat-label">{{ $t('m.company.commissionRate') }}</span>
            <span class="cprofile__stat-value m-tnum">{{ data.commissionRate }}%</span>
          </div>
          <div class="cprofile__stat">
            <span class="cprofile__stat-label">{{ $t('m.company.joinedAt') }}</span>
            <span class="cprofile__stat-value m-tnum">{{ formatDate(new Date(data.joinedAt)) }}</span>
          </div>
        </div>
      </section>

      <div class="company__grid">
        <!-- Банковские реквизиты (только чтение) -->
        <MCard :title="$t('m.company.sectionRequisites')">
          <dl class="company__dl">
            <div class="company__row">
              <dt>{{ $t('m.company.inn') }}</dt>
              <dd class="m-tnum">{{ data.requisites.inn }}</dd>
            </div>
            <div class="company__row">
              <dt>{{ $t('m.company.oked') }}</dt>
              <dd class="m-tnum">{{ data.requisites.oked || '—' }}</dd>
            </div>
            <div class="company__row">
              <dt>{{ $t('m.company.vatCode') }}</dt>
              <dd class="m-tnum">{{ data.requisites.vatCode || '—' }}</dd>
            </div>
            <div class="company__row">
              <dt>{{ $t('m.company.bankAccount') }}</dt>
              <dd class="m-tnum">{{ data.requisites.bankAccount }}</dd>
            </div>
            <div class="company__row">
              <dt>{{ $t('m.company.mfo') }}</dt>
              <dd class="m-tnum">{{ data.requisites.mfo }}</dd>
            </div>
            <div class="company__row">
              <dt>{{ $t('m.company.bankName') }}</dt>
              <dd>{{ data.requisites.bankName }}</dd>
            </div>
          </dl>
          <p class="company__note">
            <UiIcon name="security-fill" :size="15" class="company__note-ic" />
            {{ $t('m.company.requisitesNote') }}
          </p>
        </MCard>

        <!-- Контакты и витрина (редактируемые) -->
        <MCard :title="$t('m.company.sectionContacts')">
          <div class="company__form">
            <MField v-model="form.shopName" :label="$t('m.company.shopName')" :error="errors.shopName" />
            <MField v-model="form.director" :label="$t('m.company.director')" />
            <div class="company__form--grid">
              <MField v-model="form.phone" :label="$t('m.company.phone')" type="tel" inputmode="tel" :error="errors.phone" />
              <MField v-model="form.email" :label="$t('m.company.email')" type="email" inputmode="email" :error="errors.email" />
            </div>
            <MField v-model="form.legalAddress" :label="$t('m.company.legalAddress')" />
          </div>
        </MCard>
      </div>
    </template>
    <MCard v-else-if="error"><MLoadError @retry="refresh()" /></MCard>
  </div>
</template>

<style scoped>
.company__loading { display: flex; flex-direction: column; gap: 16px; }
.company__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }

/* Шапка профиля */
.cprofile {
  display: flex; align-items: center; gap: 20px;
  margin-bottom: 16px; padding: 24px 26px;
  border: 1px solid var(--m-line); border-radius: var(--m-radius-lg);
  background: var(--m-surface); box-shadow: var(--m-shadow-sm);
}
.cprofile__avatar {
  display: grid; width: 64px; height: 64px; flex: none;
  border-radius: var(--m-radius-lg); background: var(--m-brand-gradient); box-shadow: var(--m-shadow-brand);
  font-family: var(--font-display); font-weight: 800; font-size: var(--text-10xl); color: var(--m-on-brand);
  place-items: center;
}
.cprofile__logo { display: flex; flex: none; flex-direction: column; align-items: center; gap: 6px; }
.cprofile__avatar--image { object-fit: cover; background: var(--color-surface); box-shadow: inset 0 0 0 1px var(--color-line); }

.cprofile__upload {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  font-size: var(--text-xs);
  color: var(--m-brand-strong);
  white-space: nowrap;
  cursor: pointer;
}

.cprofile__upload:hover { text-decoration: underline; }
.cprofile__upload:focus-within { border-radius: 6px; box-shadow: var(--focus-ring); }
.cprofile__file { position: absolute; width: 1px; height: 1px; opacity: 0; }

.cprofile__remove {
  padding: 0;
  border: 0;
  background: none;
  font-size: var(--text-xs);
  color: var(--m-slate);
  cursor: pointer;
}

.cprofile__remove:hover { color: var(--color-danger); }
.cprofile__remove:focus-visible { border-radius: 6px; outline: none; box-shadow: var(--focus-ring); }

.cprofile__main { flex: 1; min-width: 0; }
.cprofile__name { margin: 0; font-family: var(--font-display); font-weight: 700; font-size: var(--text-8xl); letter-spacing: -0.02em; color: var(--m-ink); }
.cprofile__meta { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
.cprofile__legal { font-size: var(--text-sm); color: var(--m-slate); }
.cprofile__badge {
  padding: 3px 10px; border-radius: var(--m-radius-pill);
  background: var(--m-surface-sunken); font-size: var(--text-xs); font-weight: 600; color: var(--m-ink-soft);
}
.cprofile__stats { display: flex; gap: 32px; }
.cprofile__stat { display: flex; flex-direction: column; gap: 3px; text-align: right; }
.cprofile__stat-label { font-size: var(--text-xs); color: var(--m-slate); }
.cprofile__stat-value { font-family: var(--font-display); font-weight: 700; font-size: var(--text-4xl); color: var(--m-ink); }

.company__form { display: flex; flex-direction: column; gap: 16px; }
.company__form--grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.company__dl { margin: 0; display: flex; flex-direction: column; gap: 2px; }
.company__row {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 12px 0; border-bottom: 1px solid var(--m-line-soft);
}
.company__row:last-child { border-bottom: 0; }
.company__row dt { font-size: var(--text-sm); color: var(--m-slate); }
.company__row dd { margin: 0; font-size: var(--text-sm); font-weight: 600; color: var(--m-ink); text-align: right; }
.company__note { display: flex; align-items: flex-start; gap: 7px; margin: 16px 0 0; font-size: var(--text-xs); line-height: 1.5; color: var(--m-slate); }
.company__note-ic { flex: none; margin-top: 1px; color: var(--m-slate-soft); }
</style>
