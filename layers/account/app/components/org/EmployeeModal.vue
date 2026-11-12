<script setup lang="ts">
/**
 * Новый сотрудник или правка: ФИО, телефон (он же логин), роль, отдел,
 * лимит в месяц по желанию и категории сверх отдела. Телефон после
 * создания не меняется: это логин, под ним уже выданы пароль и SMS.
 */
import type { Category } from '#shared/types/catalog'
import type { Department, Employee, IssuedCredentials, Role } from '#shared/types/company'

const props = defineProps<{
  employee: Employee | null
  roles: Role[]
  departments: Department[]
  categories: Category[]
  suggested: string[]
}>()
const open = defineModel<boolean>({ required: true })
const emit = defineEmits<{ saved: [Employee, IssuedCredentials | null], departments: [] }>()

const { t } = useI18n()
const api = useApi()
const { roleTitle } = useOrgLabels()
const { sum } = useMoney()

const fullName = ref('')
const phone = ref('')
const roleId = ref('')
const departmentId = ref('')
const limitOn = ref(false)
const limitText = ref('')
const extra = ref<string[]>([])
const extraOpen = ref(false)
const errors = ref<Record<string, string>>({})
const busy = ref(false)

const isNew = computed(() => !props.employee)
const isOwner = computed(() => props.employee?.isOwner ?? false)

watch(open, (value) => {
  if (!value) return
  const employee = props.employee
  fullName.value = employee?.fullName ?? ''
  phone.value = employee ? employee.phone.replace(/^\+998\s?/, '') : ''
  roleId.value = String(employee?.roleId ?? props.roles.find(role => role.preset === 'requester')?.id ?? '')
  departmentId.value = String(employee?.departmentId ?? '')
  limitOn.value = !!employee?.monthlyLimit
  limitText.value = employee?.monthlyLimit ? formatSum(String(employee.monthlyLimit.amount / 100)) : ''
  extra.value = [...(employee?.extraCategories ?? [])]
  extraOpen.value = !!employee?.extraCategories.length
  errors.value = {}
}, { immediate: true })

function formatSum(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 12).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function onPhoneInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 9)
  const parts = [raw.slice(0, 2), raw.slice(2, 5), raw.slice(5, 7), raw.slice(7, 9)].filter(Boolean)
  phone.value = parts.length > 2 ? `${parts[0]} ${parts[1]}-${parts.slice(2).join('-')}` : parts.join(' ')
}

const selectedRole = computed(() => props.roles.find(role => String(role.id) === roleId.value))
/** Роль с catalog.all видит весь каталог — отдел и доп. категории ей не нужны для доступа */
const seesAll = computed(() => selectedRole.value?.permissions.includes('catalog.all') ?? false)
const canRequest = computed(() => selectedRole.value?.permissions.includes('requests.create') ?? false)

const FIELD_ERRORS: Record<string, string> = {
  employee_name: 'org.employee.errorName',
  employee_phone: 'org.employee.errorPhone',
  employee_phone_taken: 'org.employee.errorPhoneTaken',
  employee_role: 'org.employee.errorRole',
  employee_limit: 'org.employee.errorLimit',
}

async function save() {
  const local: Record<string, string> = {}
  if (fullName.value.trim().length < 3) local.fullName = t('org.employee.errorName')
  if (isNew.value && phone.value.replace(/\D/g, '').length !== 9) local.phone = t('org.employee.errorPhone')
  const limit = Number(limitText.value.replace(/\D/g, ''))
  if (limitOn.value && !(limit > 0)) local.monthlyLimit = t('org.employee.errorLimit')
  errors.value = local
  if (Object.keys(local).length) return

  const body: Record<string, unknown> = {
    fullName: fullName.value.trim(),
    departmentId: departmentId.value || null,
    monthlyLimit: limitOn.value ? limit * 100 : null,
    extraCategories: extra.value,
  }
  if (!isOwner.value) body.roleId = roleId.value

  busy.value = true
  try {
    if (isNew.value) {
      const result = await api.post<{ employee: Employee, credentials: IssuedCredentials }>('/company/employees', { ...body, phone: `+998${phone.value.replace(/\D/g, '')}` })
      emit('saved', result.employee, result.credentials)
    }
    else {
      const employee = await api.patch<Employee>(`/company/employees/${props.employee!.id}`, body)
      emit('saved', employee, null)
    }
    open.value = false
  }
  catch (caught) {
    const list = (caught as { data?: Array<{ code: string, field?: string }> }).data ?? []
    errors.value = Object.fromEntries(list.map(item => [item.field ?? 'form', t(FIELD_ERRORS[item.code] ?? 'org.common.errorGeneric')]))
    if (!list.length) errors.value = { form: t('org.common.errorGeneric') }
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <UiModal v-model="open" :title="isNew ? $t('org.employee.addTitle') : $t('org.employee.editTitle')" body-padding="8px 24px 24px" width="640px">
    <form class="employee" novalidate @submit.prevent="save">
      <!-- Кто это -->
      <section class="employee__section">
        <h3 class="employee__heading">{{ $t('org.employee.sectionPerson') }}</h3>
        <div class="employee__row">
          <label class="employee__field">
            <span class="employee__label">{{ $t('org.employee.fullName') }}</span>
            <input v-model="fullName" class="employee__input" :class="{ 'employee__input--error': errors.fullName }" autocomplete="name" :placeholder="$t('org.employee.fullNamePlaceholder')" :aria-invalid="!!errors.fullName">
            <span v-if="errors.fullName" class="employee__error">{{ errors.fullName }}</span>
          </label>

          <label class="employee__field">
            <span class="employee__label">{{ $t('org.employee.phone') }}</span>
            <span class="employee__input employee__phone" :class="{ 'employee__input--error': errors.phone, 'employee__phone--locked': !isNew }">
              <span class="employee__prefix">+998</span>
              <input
                :value="phone"
                class="employee__bare"
                type="tel"
                inputmode="tel"
                placeholder="00 000-00-00"
                :readonly="!isNew"
                :aria-invalid="!!errors.phone"
                @input="onPhoneInput"
              >
            </span>
            <span v-if="errors.phone" class="employee__error">{{ errors.phone }}</span>
            <span v-else class="employee__hint">{{ isNew ? $t('org.employee.phoneHint') : $t('org.employee.phoneLocked') }}</span>
          </label>
        </div>
      </section>

      <!-- Роль -->
      <section class="employee__section">
        <h3 class="employee__heading">{{ $t('org.employee.role') }}</h3>
        <fieldset class="employee__roles" :disabled="isOwner">
          <legend class="visually-hidden">{{ $t('org.employee.role') }}</legend>
          <label v-for="role in roles" :key="role.id" class="employee__role" :class="{ 'employee__role--active': roleId === String(role.id) }">
            <input v-model="roleId" class="visually-hidden" type="radio" name="employee-role" :value="String(role.id)">
            <span class="employee__radio" aria-hidden="true" />
            <span class="employee__role-text">
              <span class="employee__role-title">{{ roleTitle(role) }}</span>
              <span class="employee__role-desc">{{ role.preset ? $t(`org.roles.presetText.${role.preset}`) : $t('org.roles.customText', { count: role.permissions.length }) }}</span>
            </span>
          </label>
        </fieldset>
        <span v-if="isOwner" class="employee__hint">{{ $t('org.employee.ownerLocked') }}</span>
      </section>

      <!-- Доступ к каталогу -->
      <section class="employee__section">
        <h3 class="employee__heading">{{ $t('org.employee.sectionAccess') }}</h3>
        <p v-if="seesAll" class="employee__note">
          <UiIcon name="tick-circle-fill" :size="18" color="currentColor" />
          {{ $t('org.employee.seesAll') }}
        </p>
        <template v-else>
          <label v-if="departments.length" class="employee__field">
            <span class="employee__label">{{ $t('org.employee.department') }}</span>
            <span class="employee__select-wrap">
              <select v-model="departmentId" class="employee__input employee__select">
                <option value="">{{ $t('org.employee.noDepartment') }}</option>
                <option v-for="department in departments" :key="department.id" :value="String(department.id)">{{ department.title }}</option>
              </select>
              <UiIcon name="alt-arrow-down" :size="18" color="currentColor" class="employee__select-arrow" />
            </span>
            <span class="employee__hint">{{ $t('org.employee.departmentHint') }}</span>
          </label>
          <div v-else class="employee__note employee__note--action">
            <UiIcon name="info-circle" :size="18" color="currentColor" />
            <span>{{ $t('org.employee.noDepartments') }}</span>
            <button type="button" class="employee__link" @click="emit('departments')">{{ $t('org.employee.createDepartments') }}</button>
          </div>

          <button type="button" class="employee__extra-toggle" :aria-expanded="extraOpen" @click="extraOpen = !extraOpen">
            <UiIcon :name="extraOpen ? 'alt-arrow-up' : 'alt-arrow-down'" :size="16" color="currentColor" />
            {{ $t('org.employee.extraTitle') }}
            <span v-if="extra.length" class="employee__count">{{ extra.length }}</span>
          </button>
          <template v-if="extraOpen">
            <p class="employee__hint">{{ $t('org.employee.extraHint') }}</p>
            <AccountCategoryPicker v-model="extra" :categories="categories" :suggested="suggested" />
          </template>
        </template>
      </section>

      <!-- Лимит -->
      <section v-if="canRequest" class="employee__section">
        <label class="employee__switch">
          <span class="employee__switch-text">
            <span class="employee__heading employee__heading--inline">{{ $t('org.employee.limit') }}</span>
            <span class="employee__hint">{{ limitOn ? $t('org.employee.limitHint') : $t('org.employee.noLimitHint') }}</span>
          </span>
          <input v-model="limitOn" type="checkbox" class="visually-hidden">
          <span class="employee__toggle" :class="{ 'employee__toggle--on': limitOn }" aria-hidden="true" />
        </label>
        <template v-if="limitOn">
          <span class="employee__input employee__phone employee__limit" :class="{ 'employee__input--error': errors.monthlyLimit }">
            <input :value="limitText" class="employee__bare" inputmode="numeric" :placeholder="$t('org.employee.limitPlaceholder')" :aria-label="$t('org.employee.limit')" @input="limitText = formatSum(($event.target as HTMLInputElement).value)">
            <span class="employee__prefix">{{ $t('common.currency') }}</span>
          </span>
          <span v-if="errors.monthlyLimit" class="employee__error">{{ errors.monthlyLimit }}</span>
          <span v-else-if="employee?.spentThisMonth.amount" class="employee__hint">{{ $t('org.employee.spent', { sum: sum(employee.spentThisMonth.amount) }) }}</span>
        </template>
      </section>

      <p v-if="errors.form" class="employee__error employee__error--form" role="alert">{{ errors.form }}</p>

      <p v-if="isNew" class="employee__hint employee__sms">
        <UiIcon name="sms-fill" :size="16" color="currentColor" />
        {{ $t('org.employee.smsNote') }}
      </p>
      <div class="employee__actions">
        <UiButton variant="secondary" @click="open = false">{{ $t('org.common.cancel') }}</UiButton>
        <UiButton type="submit" :disabled="busy">{{ isNew ? $t('org.employee.create') : $t('org.common.save') }}</UiButton>
      </div>
    </form>
  </UiModal>
</template>

<style scoped>
/* Стиль окон сайта: серые поля как во входе и регистрации, две равные кнопки внизу */
.employee { display: flex; flex-direction: column; gap: 22px; }
.employee__section { display: flex; flex-direction: column; gap: 12px; }
.employee__heading { margin: 0; font: var(--type-label); font-weight: 600; color: var(--color-text); }
.employee__heading--inline { display: block; }
.employee__row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.employee__field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.employee__label { font: var(--type-label); color: var(--label-color); }
.employee__input {
  height: var(--field-height);
  padding-inline: 14px;
  border: 1px solid transparent;
  border-radius: var(--field-radius);
  background: var(--color-field);
  font: var(--type-input);
  color: var(--input-color);
  outline: none;
}
.employee__input:focus, .employee__phone:focus-within { border-color: var(--color-brand); }
.employee__input::placeholder { color: var(--input-placeholder); }
.employee__input--error { border-color: var(--color-danger); }
.employee__phone { display: flex; align-items: center; gap: 10px; }
.employee__phone--locked { opacity: 0.7; }
.employee__prefix { font: var(--type-input); color: var(--color-text-muted); }
.employee__bare { flex: 1; min-width: 0; border: 0; outline: none; background: none; font: var(--type-input); color: var(--input-color); }
.employee__select-wrap { position: relative; display: block; }
.employee__select { width: 100%; padding-right: 40px; appearance: none; cursor: pointer; }
.employee__select-arrow { position: absolute; top: 15px; right: 14px; pointer-events: none; color: var(--color-text-muted); }
.employee__limit { max-width: 280px; }
.employee__hint { font-size: var(--text-sm); line-height: 1.4; color: var(--color-text-muted); }
.employee__error { margin: 0; font-size: var(--text-sm); color: var(--color-danger); }

.employee__roles { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 0; padding: 0; border: 0; }
.employee__roles:disabled { opacity: 0.6; }
.employee__role { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border: 1px solid var(--color-line); border-radius: var(--field-radius); cursor: pointer; }
.employee__role--active { border-color: var(--color-brand); box-shadow: inset 0 0 0 1px var(--color-brand); }
.employee__role:has(:focus-visible) { box-shadow: var(--focus-ring); }
.employee__radio { flex: none; width: 18px; height: 18px; margin-top: 1px; border: 2px solid var(--color-line); border-radius: 50%; }
.employee__role--active .employee__radio { border: 6px solid var(--color-brand); }
.employee__role-text { display: flex; flex-direction: column; gap: 2px; }
.employee__role-title { font-weight: 600; font-size: var(--text-base); color: var(--color-text); }
.employee__role-desc { font-size: var(--text-sm); line-height: 1.4; color: var(--color-text-muted); }

.employee__note { display: flex; align-items: center; gap: 10px; margin: 0; padding: 12px 14px; border-radius: var(--field-radius); background: var(--color-field); font-size: var(--text-sm); color: var(--color-text); }
.employee__note :deep(svg) { flex: none; color: var(--color-brand); }
.employee__note--action :deep(svg) { color: var(--color-text-muted); }
.employee__link { margin-left: auto; padding: 0; border: 0; background: none; font-weight: 600; font-size: var(--text-sm); white-space: nowrap; color: var(--color-brand-text); cursor: pointer; }
.employee__link:hover { color: var(--color-brand-text-hover); }

.employee__extra-toggle { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; padding: 0; border: 0; background: none; font-weight: 500; font-size: var(--text-sm); color: var(--color-text); cursor: pointer; }
.employee__count { padding: 0 7px; border-radius: 999px; background: var(--color-field); font-size: var(--text-xs); line-height: 18px; }

.employee__switch { display: flex; align-items: center; justify-content: space-between; gap: 16px; cursor: pointer; }
.employee__switch-text { display: flex; flex-direction: column; gap: 2px; }
.employee__toggle { position: relative; flex: none; width: 40px; height: 22px; border-radius: 999px; background: var(--color-line); transition: background 0.15s ease; }
.employee__toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: var(--color-surface); transition: transform 0.15s ease; }
.employee__toggle--on { background: var(--color-brand); }
.employee__toggle--on::after { transform: translateX(18px); }
.employee__switch:has(:focus-visible) .employee__toggle { box-shadow: var(--focus-ring); }

.employee__sms { display: flex; align-items: center; justify-content: center; gap: 6px; margin: 0; }
.employee__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
</style>
