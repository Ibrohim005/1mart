<script setup lang="ts">
/**
 * Компания (B2B). Руководитель управляет здесь всем, что решает, кто и что
 * может купить: сотрудники (логин — телефон, пароль уходит по SMS), роли
 * (готовые и свои из прав), отделы и открытые им разделы каталога.
 *
 * Вид — рабочий экран, как настройки команды в Ramp, Stripe и Linear:
 * карточка компании сверху, лёгкие вкладки, таблица людей с лимитом
 * «потрачено из», роли как таблица прав, отделы с быстрым стартом по ОКЭД.
 *
 * Сотрудник без права staff.manage видит свой доступ: роль, отдел, открытые
 * разделы и остаток лимита — так понятно, почему часть каталога скрыта.
 */
import type { Category } from '#shared/types/catalog'
import type { Company, Department, Employee, IssuedCredentials, Permission, Role } from '#shared/types/company'
import { PERMISSIONS } from '#shared/types/company'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const api = useApi()
const toast = useToast()
const { money } = useMoney()
const { roleTitle, permissionTitle, permissionText } = useOrgLabels()
const { access, can } = await useAccess()

useSeoMeta({ title: () => t('org.company.title'), robots: 'noindex' })

const manage = computed(() => can('staff.manage'))

interface CompanyOverview { company: Company, employees: Employee[], roles: Role[], departments: Department[] }
// Сотрудникам без staff.manage сервер ответит 403 — им этот запрос не нужен вовсе
const { data, refresh } = manage.value
  ? await useApiData<CompanyOverview | null>('account:company', '/company')
  : { data: ref<CompanyOverview | null>(null), refresh: async () => {} }
const { data: tree } = await useApiData<Category[]>('account:company-categories', '/categories/root', { lazy: true })

const company = computed(() => data.value?.company ?? access.value?.company ?? null)
const categories = computed(() => tree.value ?? [])
const suggested = computed(() => company.value?.suggestedCategories ?? [])
const categoryTitles = computed(() => new Map(categories.value.flatMap(root => [[root.slug, root.title], ...(root.children ?? []).map(child => [child.slug, child.title])] as Array<[string, string]>)))
const titleOf = (slug: string) => categoryTitles.value.get(slug) ?? slug

/* ---------- Вкладки: общий переключатель кабинета, как в «Моих заказах» ---------- */

type Tab = 'staff' | 'roles' | 'departments' | 'details'
const tab = ref<Tab>('staff')
// AccountTabs переводит подписи сам — передаём ключи
const tabs = [
  { value: 'staff', label: 'org.company.tabStaff' },
  { value: 'roles', label: 'org.company.tabRoles' },
  { value: 'departments', label: 'org.company.tabDepartments' },
  { value: 'details', label: 'org.company.tabDetails' },
]

/* ---------- Сотрудники ---------- */

const query = ref('')
const employees = computed(() => {
  const list = data.value?.employees ?? []
  const needle = query.value.trim().toLowerCase()
  if (!needle) return list
  const digits = needle.replace(/\D/g, '')
  return list.filter(item => item.fullName.toLowerCase().includes(needle) || (digits && item.phone.replace(/\D/g, '').includes(digits)))
})

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]!.toUpperCase()).join('')
/** Знак компании: первые буквы названия без «ООО», кавычек и т. п. */
const companyMark = (name: string) => initials(name.replace(/[«»"]/g, '').replace(/^(ООО|АО|ИП|ЧП|ГУ|OOO|AO|LLC)\s+/i, ''))
/** Цвет аватара постоянный для человека: по сумме кодов имени */
const avatarTone = (name: string) => [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6

const roleById = (id: Employee['roleId']) => data.value?.roles.find(role => role.id === id)
const departmentById = (id: Employee['departmentId']) => data.value?.departments.find(item => item.id === id)

/** Доля потраченного лимита, 0–100 */
function spentShare(employee: Employee) {
  if (!employee.monthlyLimit?.amount) return 0
  return Math.min(100, Math.round(employee.spentThisMonth.amount / employee.monthlyLimit.amount * 100))
}

const employeeOpen = ref(false)
const editing = ref<Employee | null>(null)
const credentialsOpen = ref(false)
const credentials = ref<IssuedCredentials | null>(null)
const credentialsFor = ref('')

function addEmployee() {
  editing.value = null
  employeeOpen.value = true
}

function editEmployee(employee: Employee) {
  editing.value = employee
  employeeOpen.value = true
}

async function onEmployeeSaved(employee: Employee, issued: IssuedCredentials | null) {
  await refresh()
  if (issued) {
    credentials.value = issued
    credentialsFor.value = employee.fullName
    credentialsOpen.value = true
  }
  else {
    toast.show(t('org.company.saved'))
  }
}

async function resetPassword(employee: Employee) {
  try {
    credentials.value = await api.post<IssuedCredentials>(`/company/employees/${employee.id}/password`)
    credentialsFor.value = employee.fullName
    credentialsOpen.value = true
    await refresh()
  }
  catch {
    toast.show(t('org.common.errorGeneric'), 'error')
  }
}

async function toggleBlock(employee: Employee) {
  try {
    await api.patch(`/company/employees/${employee.id}`, { status: employee.status === 'blocked' ? 'active' : 'blocked' })
    toast.show(employee.status === 'blocked' ? t('org.company.unblocked', { name: employee.fullName }) : t('org.company.blocked', { name: employee.fullName }))
    await refresh()
  }
  catch {
    toast.show(t('org.common.errorGeneric'), 'error')
  }
}

/* ---------- Роли: таблица прав ---------- */

const roleOpen = ref(false)
const editingRole = ref<Role | null>(null)

function openRole(role: Role | null) {
  editingRole.value = role
  roleOpen.value = true
}

async function onRoleSaved() {
  await refresh()
  toast.show(t('org.company.saved'))
}

const has = (role: Role, permission: Permission) => role.permissions.includes(permission)

/* ---------- Отделы ---------- */

const departmentOpen = ref(false)
const editingDepartment = ref<Department | null>(null)

function openDepartment(department: Department | null) {
  editingDepartment.value = department
  departmentOpen.value = true
}

async function onDepartmentSaved() {
  await refresh()
  toast.show(t('org.company.saved'))
}

/**
 * Быстрый старт: типовые отделы офиса с разделами. Подходящие по ОКЭД
 * отмечены сразу — руководителю остаётся нажать одну кнопку.
 */
const TEMPLATES = [
  { key: 'accounting', categories: ['bumaga-i-bloknoty', 'pismennye-prinadlezhnosti', 'kancelyarskie-melochi', 'papki-i-hranenie'] },
  { key: 'office', categories: ['ofis-i-kancelyariya'] },
  { key: 'it', categories: ['kompyutery-i-periferiya', 'orgtehnika'] },
]
const templates = computed(() => TEMPLATES.map(item => ({
  ...item,
  title: t(`org.company.template.${item.key}`),
  matches: item.categories.some(slug => suggested.value.includes(slug)),
})))
const picked = ref<string[]>(TEMPLATES.filter(item => item.categories.some(slug => suggested.value.includes(slug))).map(item => item.key))
const creatingTemplates = ref(false)

function togglePicked(key: string) {
  picked.value = picked.value.includes(key) ? picked.value.filter(item => item !== key) : [...picked.value, key]
}

async function createTemplates() {
  creatingTemplates.value = true
  try {
    for (const item of templates.value.filter(entry => picked.value.includes(entry.key)))
      await api.post('/company/departments', { title: item.title, categories: item.categories })
    toast.show(t('org.company.templatesCreated', { count: picked.value.length }))
    await refresh()
  }
  catch {
    toast.show(t('org.common.errorGeneric'), 'error')
  }
  finally {
    creatingTemplates.value = false
  }
}

const peopleOf = (department: Department) => (data.value?.employees ?? []).filter(item => item.departmentId === department.id)

/* ---------- Удаление ---------- */

type Removal = { kind: 'employee' | 'role' | 'department', id: string | number, name: string }
const removal = ref<Removal | null>(null)
const removalOpen = ref(false)
const removing = ref(false)

function askRemove(item: Removal) {
  removal.value = item
  removalOpen.value = true
}

const removalText = computed(() => (removal.value ? t(`org.company.remove.${removal.value.kind}`, { name: removal.value.name }) : ''))

async function confirmRemove() {
  if (!removal.value) return
  removing.value = true
  const path = { employee: 'employees', role: 'roles', department: 'departments' }[removal.value.kind]
  try {
    await api.delete(`/company/${path}/${removal.value.id}`)
    removalOpen.value = false
    toast.show(t('org.company.removed', { name: removal.value.name }))
    await refresh()
  }
  catch (caught) {
    const code = (caught as { data?: Array<{ code: string }> }).data?.[0]?.code
    toast.show(code === 'role_in_use' ? t('org.company.roleInUse') : t('org.common.errorGeneric'), 'error')
  }
  finally {
    removing.value = false
  }
}
</script>

<template>
  <AccountLayout :title="$t('org.company.title')">
    <div v-if="company" class="org">
      <!-- Карточка компании -->
      <section class="org__profile">
        <span class="org__logo" aria-hidden="true">{{ companyMark(company.name) }}</span>
        <div class="org__profile-main">
          <h2 class="org__profile-name">{{ company.name }}</h2>
          <p class="org__profile-meta">
            <span v-if="company.inn">{{ $t('org.register.inn') }} {{ company.inn }}</span>
            <span>{{ $t('org.register.oked') }} {{ company.oked.code }}</span>
            <span v-if="company.director">{{ company.director }}</span>
          </p>
        </div>
        <span v-if="company.registeredVia !== 'demo'" class="org__verified">
          <UiIcon name="shield-tick-fill" :size="16" color="currentColor" />
          {{ $t(`org.company.verified.${company.registeredVia}`) }}
        </span>
      </section>

      <!-- Сотрудник: свой доступ -->
      <section v-if="!manage && access" class="org__panel">
        <header class="org__panel-head">
          <div>
            <h3 class="org__panel-title">{{ $t('org.company.myAccess') }}</h3>
            <p class="org__panel-text">{{ $t('org.company.askHead') }}</p>
          </div>
        </header>
        <dl class="org__facts">
          <div><dt>{{ $t('org.company.role') }}</dt><dd>{{ roleTitle(access.role) }}</dd></div>
          <div><dt>{{ $t('org.company.department') }}</dt><dd>{{ access.department?.title ?? $t('org.company.noDepartment') }}</dd></div>
          <div><dt>{{ $t('org.company.limitLeft') }}</dt><dd>{{ access.limitLeft ? money(access.limitLeft) : $t('org.company.noLimit') }}</dd></div>
        </dl>
        <div class="org__block">
          <p class="org__label">{{ $t('org.company.myCategories') }}</p>
          <p v-if="access.categories === null" class="org__muted">{{ $t('org.company.allCatalog') }}</p>
          <ul v-else-if="access.categories.length" class="org__chips">
            <li v-for="slug in access.categories" :key="slug" class="org__chip">{{ titleOf(slug) }}</li>
          </ul>
          <p v-else class="org__muted">{{ $t('org.company.noCategories') }}</p>
        </div>
        <div class="org__block">
          <p class="org__label">{{ $t('org.company.myPermissions') }}</p>
          <ul class="org__checks">
            <li v-for="permission in PERMISSIONS" :key="permission" class="org__check" :class="{ 'org__check--off': !access.permissions.includes(permission) }">
              <UiIcon :name="access.permissions.includes(permission) ? 'tick-circle-fill' : 'minus'" :size="18" color="currentColor" />
              {{ permissionTitle(permission) }}
            </li>
          </ul>
        </div>
      </section>

      <template v-else-if="data">
        <AccountTabs :model-value="tab" :tabs="tabs" @update:model-value="tab = $event as Tab" />

        <!-- Сотрудники -->
        <section v-if="tab === 'staff'" class="org__panel">
          <header class="org__panel-head">
            <div>
              <h3 class="org__panel-title">{{ $t('org.company.staffTitle') }}</h3>
              <p class="org__panel-text">{{ $t('org.company.staffText') }}</p>
            </div>
            <UiButton @click="addEmployee">
              <UiIcon name="add" :size="16" color="currentColor" />
              {{ $t('org.company.addEmployee') }}
            </UiButton>
          </header>

          <label v-if="data.employees.length > 4" class="org__search">
            <UiIcon name="search-normal" :size="18" color="currentColor" />
            <input v-model="query" class="org__search-input" type="search" :placeholder="$t('org.company.searchStaff')" :aria-label="$t('org.company.searchStaff')">
          </label>

          <table class="org__table">
            <thead>
              <tr>
                <th>{{ $t('org.company.colEmployee') }}</th>
                <th>{{ $t('org.company.colRole') }}</th>
                <th>{{ $t('org.company.colLimit') }}</th>
                <th>{{ $t('org.company.colStatus') }}</th>
                <th><span class="visually-hidden">{{ $t('org.company.colActions') }}</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="employee in employees" :key="employee.id" class="org__row">
                <td>
                  <span class="org__person">
                    <span class="org__avatar" :class="`org__avatar--${avatarTone(employee.fullName)}`" aria-hidden="true">{{ initials(employee.fullName) }}</span>
                    <span class="org__person-text">
                      <span class="org__name">
                        {{ employee.fullName }}
                        <span v-if="employee.id === access?.employee.id" class="org__you">{{ $t('org.company.you') }}</span>
                      </span>
                      <span class="org__sub">{{ employee.phone }}</span>
                    </span>
                  </span>
                </td>
                <td>
                  <span class="org__role" :class="{ 'org__role--owner': employee.isOwner }">{{ roleById(employee.roleId) ? roleTitle(roleById(employee.roleId)!) : '—' }}</span>
                  <span class="org__sub">{{ departmentById(employee.departmentId)?.title ?? $t('org.company.noDepartment') }}</span>
                </td>
                <td>
                  <template v-if="employee.monthlyLimit">
                    <span class="org__limit-text">{{ money(employee.spentThisMonth) }} <span class="org__muted">{{ $t('org.company.of') }} {{ money(employee.monthlyLimit) }}</span></span>
                    <span class="org__bar" role="progressbar" :aria-valuenow="spentShare(employee)" aria-valuemin="0" aria-valuemax="100" :aria-label="$t('org.company.colLimit')">
                      <span class="org__bar-fill" :class="{ 'org__bar-fill--warn': spentShare(employee) >= 80 }" :style="{ width: `${spentShare(employee)}%` }" />
                    </span>
                  </template>
                  <span v-else class="org__muted">{{ $t('org.company.noLimit') }}</span>
                </td>
                <td>
                  <span class="org__status" :class="`org__status--${employee.status}`">{{ $t(`org.company.status.${employee.status}`) }}</span>
                </td>
                <td>
                  <span class="org__actions">
                    <button type="button" class="org__icon" :title="$t('org.company.editShort')" :aria-label="$t('org.company.edit', { name: employee.fullName })" @click="editEmployee(employee)">
                      <UiIcon name="edit" :size="18" color="currentColor" />
                    </button>
                    <template v-if="!employee.isOwner">
                      <button type="button" class="org__icon" :title="$t('org.company.resetPasswordShort')" :aria-label="$t('org.company.resetPassword', { name: employee.fullName })" @click="resetPassword(employee)">
                        <UiIcon name="lock" :size="18" color="currentColor" />
                      </button>
                      <button type="button" class="org__icon" :title="employee.status === 'blocked' ? $t('org.company.unblockShort') : $t('org.company.blockShort')" :aria-label="employee.status === 'blocked' ? $t('org.company.unblock', { name: employee.fullName }) : $t('org.company.block', { name: employee.fullName })" @click="toggleBlock(employee)">
                        <UiIcon :name="employee.status === 'blocked' ? 'tick-circle' : 'close'" :size="18" color="currentColor" />
                      </button>
                      <button type="button" class="org__icon org__icon--danger" :title="$t('org.company.removeAction')" :aria-label="$t('org.company.removeEmployee', { name: employee.fullName })" @click="askRemove({ kind: 'employee', id: employee.id, name: employee.fullName })">
                        <UiIcon name="trash" :size="18" color="currentColor" />
                      </button>
                    </template>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="data.employees.length === 1" class="org__hint">
            <UiIcon name="profile-2user-fill" :size="22" color="currentColor" />
            <p>{{ $t('org.company.firstStaffHint') }}</p>
          </div>
          <p v-else-if="!employees.length" class="org__empty">{{ $t('org.company.nothingFound') }}</p>
        </section>

        <!-- Роли: таблица прав -->
        <section v-else-if="tab === 'roles'" class="org__panel">
          <header class="org__panel-head">
            <div>
              <h3 class="org__panel-title">{{ $t('org.company.rolesTitle') }}</h3>
              <p class="org__panel-text">{{ $t('org.company.rolesText') }}</p>
            </div>
            <UiButton @click="openRole(null)">
              <UiIcon name="add" :size="16" color="currentColor" />
              {{ $t('org.company.addRole') }}
            </UiButton>
          </header>

          <div class="org__matrix-wrap">
            <table class="org__matrix">
              <thead>
                <tr>
                  <th class="org__matrix-corner">{{ $t('org.role.permissions') }}</th>
                  <th v-for="role in data.roles" :key="role.id" class="org__matrix-role">
                    <span class="org__matrix-name">{{ roleTitle(role) }}</span>
                    <span class="org__matrix-meta">{{ $t('org.company.people', { count: role.employeesCount }) }}</span>
                    <span v-if="!role.preset" class="org__matrix-actions">
                      <button type="button" class="org__icon org__icon--sm" :title="$t('org.company.editShort')" :aria-label="$t('org.company.edit', { name: role.title })" @click="openRole(role)">
                        <UiIcon name="edit" :size="16" color="currentColor" />
                      </button>
                      <button type="button" class="org__icon org__icon--sm org__icon--danger" :title="$t('org.company.removeAction')" :aria-label="$t('org.company.removeRole', { name: role.title })" @click="askRemove({ kind: 'role', id: role.id, name: role.title })">
                        <UiIcon name="trash" :size="16" color="currentColor" />
                      </button>
                    </span>
                    <span v-else class="org__matrix-tag">{{ $t('org.company.preset') }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="permission in PERMISSIONS" :key="permission">
                  <th scope="row" class="org__matrix-permission">
                    <span class="org__name">{{ permissionTitle(permission) }}</span>
                    <span class="org__sub">{{ permissionText(permission) }}</span>
                  </th>
                  <td v-for="role in data.roles" :key="role.id" class="org__matrix-cell">
                    <UiIcon v-if="has(role, permission)" name="tick-circle-fill" :size="20" class="org__yes" />
                    <span v-else class="org__no" aria-hidden="true">—</span>
                    <span class="visually-hidden">{{ has(role, permission) ? $t('org.company.allowed') : $t('org.company.notAllowed') }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Отделы -->
        <section v-else-if="tab === 'departments'" class="org__panel">
          <header class="org__panel-head">
            <div>
              <h3 class="org__panel-title">{{ $t('org.company.departmentsTitle') }}</h3>
              <p class="org__panel-text">{{ $t('org.company.departmentsText') }}</p>
            </div>
            <UiButton v-if="data.departments.length" @click="openDepartment(null)">
              <UiIcon name="add" :size="16" color="currentColor" />
              {{ $t('org.company.addDepartment') }}
            </UiButton>
          </header>

          <!-- Быстрый старт по ОКЭД -->
          <div v-if="!data.departments.length" class="org__start">
            <p class="org__start-title">{{ $t('org.company.quickStart') }}</p>
            <p class="org__muted">{{ $t('org.company.quickStartText', { code: company.oked.code }) }}</p>
            <div class="org__templates">
              <label v-for="item in templates" :key="item.key" class="org__template" :class="{ 'org__template--on': picked.includes(item.key) }">
                <input type="checkbox" class="visually-hidden" :checked="picked.includes(item.key)" @change="togglePicked(item.key)">
                <span class="org__template-head">
                  <span class="org__template-box" aria-hidden="true">
                    <UiIcon v-if="picked.includes(item.key)" name="tick-square-fill" :size="20" color="currentColor" />
                  </span>
                  <span class="org__name">{{ item.title }}</span>
                  <span v-if="item.matches" class="org__badge">{{ $t('org.categories.byOked') }}</span>
                </span>
                <span class="org__sub">{{ item.categories.map(titleOf).join(', ') }}</span>
              </label>
            </div>
            <div class="org__start-actions">
              <UiButton :disabled="!picked.length || creatingTemplates" @click="createTemplates">{{ $t('org.company.createPicked', { count: picked.length }) }}</UiButton>
              <UiButton variant="secondary" @click="openDepartment(null)">{{ $t('org.company.ownDepartment') }}</UiButton>
            </div>
          </div>

          <ul v-else class="org__departments">
            <li v-for="department in data.departments" :key="department.id" class="org__department">
              <div class="org__department-head">
                <span class="org__name">{{ department.title }}</span>
                <span class="org__actions org__actions--always">
                  <button type="button" class="org__icon org__icon--sm" :title="$t('org.company.editShort')" :aria-label="$t('org.company.edit', { name: department.title })" @click="openDepartment(department)">
                    <UiIcon name="edit" :size="16" color="currentColor" />
                  </button>
                  <button type="button" class="org__icon org__icon--sm org__icon--danger" :title="$t('org.company.removeAction')" :aria-label="$t('org.company.removeDepartment', { name: department.title })" @click="askRemove({ kind: 'department', id: department.id, name: department.title })">
                    <UiIcon name="trash" :size="16" color="currentColor" />
                  </button>
                </span>
              </div>
              <ul v-if="department.categories.length" class="org__chips">
                <li v-for="slug in department.categories.slice(0, 4)" :key="slug" class="org__chip">{{ titleOf(slug) }}</li>
                <li v-if="department.categories.length > 4" class="org__chip org__chip--more">+{{ department.categories.length - 4 }}</li>
              </ul>
              <p v-else class="org__warning">{{ $t('org.department.emptyWarning') }}</p>
              <div class="org__department-foot">
                <span class="org__stack" aria-hidden="true">
                  <span v-for="person in peopleOf(department).slice(0, 4)" :key="person.id" class="org__avatar org__avatar--xs" :class="`org__avatar--${avatarTone(person.fullName)}`">{{ initials(person.fullName) }}</span>
                </span>
                <span class="org__sub">{{ $t('org.company.people', { count: department.employeesCount }) }}</span>
              </div>
            </li>
          </ul>
          <p v-if="data.departments.length" class="org__muted">{{ $t('org.company.departmentsNote') }}</p>
        </section>

        <!-- Реквизиты -->
        <section v-else class="org__panel">
          <header class="org__panel-head">
            <div>
              <h3 class="org__panel-title">{{ $t('org.company.tabDetails') }}</h3>
              <p class="org__panel-text">{{ $t('org.company.detailsNote') }}</p>
            </div>
          </header>
          <dl class="org__details">
            <div><dt>{{ $t('org.company.legalName') }}</dt><dd>{{ data.company.name }}</dd></div>
            <div><dt>{{ $t('org.register.inn') }}</dt><dd>{{ data.company.inn || $t('org.company.notSet') }}</dd></div>
            <div><dt>{{ $t('org.register.oked') }}</dt><dd>{{ data.company.oked.code }} — {{ data.company.oked.title }}</dd></div>
            <div><dt>{{ $t('org.register.director') }}</dt><dd>{{ data.company.director || $t('org.company.notSet') }}</dd></div>
            <div><dt>{{ $t('org.register.address') }}</dt><dd>{{ data.company.address || $t('org.company.notSet') }}</dd></div>
            <div><dt>{{ $t('org.company.registeredVia') }}</dt><dd>{{ $t(`org.company.via.${data.company.registeredVia}`) }}</dd></div>
          </dl>
          <div class="org__block">
            <p class="org__label">{{ $t('org.register.suggestedTitle', { code: data.company.oked.code }) }}</p>
            <ul class="org__chips">
              <li v-for="slug in data.company.suggestedCategories" :key="slug" class="org__chip">{{ titleOf(slug) }}</li>
            </ul>
          </div>
        </section>
      </template>
    </div>

    <AccountEmployeeModal
      v-if="data"
      v-model="employeeOpen"
      :employee="editing"
      :roles="data.roles"
      :departments="data.departments"
      :categories="categories"
      :suggested="suggested"
      @saved="onEmployeeSaved"
      @departments="employeeOpen = false; tab = 'departments'"
    />
    <AccountCredentialsModal v-model="credentialsOpen" :credentials="credentials" :full-name="credentialsFor" />
    <AccountRoleModal v-model="roleOpen" :role="editingRole" @saved="onRoleSaved" />
    <AccountDepartmentModal v-model="departmentOpen" :department="editingDepartment" :categories="categories" :suggested="suggested" @saved="onDepartmentSaved" />
    <AccountConfirmModal
      v-model="removalOpen"
      :title="$t('org.company.removeTitle')"
      :text="removalText"
      :action-label="$t('org.company.removeAction')"
      :busy="removing"
      @confirm="confirmRemove"
    />
  </AccountLayout>
</template>

<style scoped>
.org { display: flex; flex-direction: column; gap: 16px; }

/* ---------- Карточка компании ---------- */
.org__profile { display: flex; align-items: center; gap: 16px; padding: 24px; border-radius: 20px; background: var(--color-surface); }
.org__logo { display: grid; flex: none; place-items: center; width: 56px; height: 56px; border-radius: 16px; background: var(--color-navy); font: 700 18px/1 var(--font-display); letter-spacing: 0.02em; color: var(--color-surface); }
.org__profile-main { display: flex; flex: 1; flex-direction: column; gap: 4px; min-width: 0; }
.org__profile-name { margin: 0; font: var(--type-card-title); font-size: 19px; color: var(--color-text); }
.org__profile-meta { display: flex; flex-wrap: wrap; gap: 4px 0; margin: 0; font-size: var(--text-sm); color: var(--color-text-muted); }
.org__profile-meta span + span::before { content: '·'; margin: 0 10px; }
.org__verified { display: inline-flex; flex: none; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 8px; background: rgb(11 143 42 / 8%); font-weight: 500; font-size: var(--text-sm); color: var(--color-brand-text); }

/* ---------- Панель ---------- */
.org__panel { display: flex; flex-direction: column; gap: 20px; padding: 24px; border-radius: 20px; background: var(--color-surface); }
.org__panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
.org__panel-title { margin: 0 0 6px; font: var(--type-section-title); color: var(--color-text); }
.org__panel-text { max-width: 520px; margin: 0; font-size: var(--text-sm); line-height: 1.45; color: var(--color-text-muted); }
.org__panel-head :deep(.btn) { flex: none; }
.org__label { margin: 0 0 8px; font: var(--type-label); color: var(--label-color); }
.org__muted { margin: 0; font-size: var(--text-sm); line-height: 1.45; color: var(--color-text-muted); }
.org__warning { margin: 0; font-size: var(--text-sm); color: #8A5300; }
.org__block { display: flex; flex-direction: column; }
.org__empty { margin: 0; padding: 20px; font-size: var(--text-sm); text-align: center; color: var(--color-text-muted); }

.org__search { display: flex; align-items: center; gap: 10px; height: var(--field-height); padding: 0 16px; border: 1px solid var(--color-line); border-radius: var(--field-radius); background: var(--color-page); color: var(--color-text-muted); }
.org__search:focus-within { box-shadow: var(--focus-ring); }
.org__search-input { flex: 1; border: 0; outline: none; background: none; font: var(--type-input); color: var(--input-color); }

/* ---------- Таблица сотрудников ---------- */
.org__table { width: 100%; border-collapse: collapse; }
/* Имя и телефон в одну строку: колонка сотрудника шире остальных */
.org__table th:first-child { width: 38%; }
.org__table th { padding: 0 12px 10px 0; border-bottom: 1px solid var(--color-line); font-weight: 500; font-size: var(--text-xs); letter-spacing: 0.02em; text-align: left; white-space: nowrap; color: var(--color-text-muted); }
.org__table td { padding: 12px 12px 12px 0; border-bottom: 1px solid var(--color-line); vertical-align: middle; }
.org__table tr:last-child td { border-bottom: 0; }
.org__person { display: flex; align-items: center; gap: 12px; }
.org__person-text { display: flex; flex-direction: column; min-width: 0; }
.org__name { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: var(--text-base); color: var(--color-text); }
.org__person .org__name, .org__person .org__sub { white-space: nowrap; }
.org__sub { display: block; margin-top: 2px; font-size: var(--text-sm); line-height: 1.4; color: var(--color-text-muted); }
.org__you { padding: 1px 6px; border-radius: 5px; background: var(--color-field); font-weight: 500; font-size: var(--text-xs); color: var(--color-text-muted); }

.org__avatar { display: grid; flex: none; place-items: center; width: 36px; height: 36px; border-radius: 50%; font-weight: 600; font-size: 13px; }
.org__avatar--xs { width: 26px; height: 26px; border: 2px solid var(--color-surface); font-size: 10px; }
.org__avatar--0 { background: #E6F4EA; color: #0E6B22; }
.org__avatar--1 { background: #E8EEFB; color: #2A4C9E; }
.org__avatar--2 { background: #FCEFE3; color: #9A4D0E; }
.org__avatar--3 { background: #F1E9FA; color: #6B3FA0; }
.org__avatar--4 { background: #E5F3F6; color: #1D6576; }
.org__avatar--5 { background: #F6EDE8; color: #7A4A33; }

.org__role { display: inline-flex; font-weight: 500; font-size: var(--text-base); color: var(--color-text); }
.org__role--owner { color: var(--color-brand-text); }

.org__limit-text { display: block; font-weight: 500; font-size: var(--text-sm); white-space: nowrap; color: var(--color-text); }
.org__bar { display: block; width: 140px; height: 4px; margin-top: 6px; overflow: hidden; border-radius: 999px; background: var(--color-field); }
.org__bar-fill { display: block; height: 100%; border-radius: inherit; background: var(--color-brand); }
.org__bar-fill--warn { background: #D97706; }

.org__status { display: inline-flex; align-items: center; gap: 6px; font-weight: 500; font-size: var(--text-sm); white-space: nowrap; color: var(--color-text); }
.org__status::before { content: ''; width: 8px; height: 8px; border-radius: 50%; }
.org__status--active::before { background: var(--color-brand); }
.org__status--invited::before { background: #F59E0B; }
.org__status--blocked { color: var(--color-danger); }
.org__status--blocked::before { background: var(--color-danger); }

.org__actions { display: flex; justify-content: flex-end; gap: 2px; opacity: 0.35; transition: opacity 0.15s ease; }
.org__row:hover .org__actions, .org__actions:focus-within, .org__actions--always { opacity: 1; }
.org__icon { display: grid; place-items: center; width: 34px; height: 34px; border: 0; border-radius: 8px; background: none; color: var(--color-text-muted); cursor: pointer; }
.org__icon--sm { width: 30px; height: 30px; }
.org__icon:hover { background: var(--color-field); color: var(--color-text); }
.org__icon--danger:hover { color: var(--color-danger); }
.org__icon:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.org__hint { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 16px; background: var(--color-page); color: var(--color-text-muted); }
.org__hint p { margin: 0; font-size: var(--text-sm); line-height: 1.45; }

/* ---------- Таблица прав ---------- */
.org__matrix-wrap { overflow-x: auto; border: 1px solid var(--color-line); border-radius: var(--field-radius); }
.org__matrix { width: 100%; border-collapse: collapse; }
.org__matrix th, .org__matrix td { padding: 12px 14px; border-bottom: 1px solid var(--color-line); }
.org__matrix tbody tr:last-child th, .org__matrix tbody tr:last-child td { border-bottom: 0; }
.org__matrix thead th { vertical-align: bottom; background: var(--color-page); }
.org__matrix-corner { width: 34%; font-weight: 500; font-size: var(--text-xs); text-align: left; color: var(--color-text-muted); }
.org__matrix-role { text-align: center; }
.org__matrix-name { display: block; font-weight: 600; font-size: var(--text-sm); color: var(--color-text); }
.org__matrix-meta { display: block; font-weight: 400; font-size: var(--text-xs); color: var(--color-text-muted); }
.org__matrix-tag { display: inline-block; margin-top: 4px; padding: 1px 6px; border-radius: 5px; background: var(--color-field); font-weight: 500; font-size: var(--text-2xs); color: var(--color-text-muted); }
.org__matrix-actions { display: inline-flex; gap: 2px; margin-top: 2px; }
.org__matrix-permission { font-weight: 400; text-align: left; }
.org__matrix-permission .org__name { font-size: var(--text-sm); }
.org__matrix-cell { text-align: center; }
.org__yes { color: var(--color-brand); }
.org__no { font-weight: 600; color: var(--color-line); }

/* ---------- Отделы ---------- */
.org__start { display: flex; flex-direction: column; gap: 14px; padding: 20px; border-radius: 16px; background: var(--color-page); }
.org__start-title { margin: 0; font-weight: 600; font-size: var(--text-base); color: var(--color-text); }
.org__templates { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.org__template { display: flex; flex-direction: column; gap: 6px; padding: 16px; border: 1px solid var(--color-line); border-radius: var(--field-radius); background: var(--color-surface); cursor: pointer; }
.org__template--on { border-color: var(--color-brand); box-shadow: inset 0 0 0 1px var(--color-brand); }
.org__template:has(:focus-visible) { box-shadow: var(--focus-ring); }
.org__template-head { display: flex; align-items: center; gap: 8px; }
.org__template-box { display: grid; flex: none; place-items: center; width: 20px; height: 20px; border: 2px solid var(--color-line); border-radius: 5px; color: var(--color-brand); }
.org__template--on .org__template-box { border: 0; }
.org__badge { margin-left: auto; padding: 1px 6px; border-radius: 5px; background: rgb(11 143 42 / 10%); font-weight: 500; font-size: var(--text-2xs); white-space: nowrap; color: var(--color-brand-text); }
.org__start-actions { display: flex; gap: 8px; }
/* Серая кнопка на сером блоке не видна — здесь она белая */
.org__start-actions :deep(.btn--secondary) { background: var(--color-surface); }

.org__departments { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 0; padding: 0; list-style: none; }
.org__department { display: flex; flex-direction: column; gap: 12px; padding: 18px; border: 1px solid var(--color-line); border-radius: 16px; }
.org__department-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.org__department-foot { display: flex; align-items: center; gap: 8px; margin-top: auto; }
.org__department-foot .org__sub { margin: 0; }
.org__stack { display: flex; }
.org__stack .org__avatar + .org__avatar { margin-left: -8px; }

.org__chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.org__chip { padding: 4px 10px; border-radius: 8px; background: var(--color-field); font-size: var(--text-sm); color: var(--color-text); }
.org__chip--more { color: var(--color-text-muted); }

/* ---------- Реквизиты и свой доступ ---------- */
.org__details, .org__facts { display: grid; grid-template-columns: 1fr 1fr; margin: 0; border: 1px solid var(--color-line); border-radius: 16px; }
.org__facts { grid-template-columns: repeat(3, 1fr); }
.org__details div, .org__facts div { display: flex; flex-direction: column; gap: 3px; padding: 14px 16px; border-bottom: 1px solid var(--color-line); }
.org__details div:nth-child(odd) { border-right: 1px solid var(--color-line); }
.org__details div:nth-last-child(-n+2) { border-bottom: 0; }
.org__facts div { border-bottom: 0; }
.org__facts div + div { border-left: 1px solid var(--color-line); }
.org__details dt, .org__facts dt { font-size: var(--text-xs); color: var(--color-text-muted); }
.org__details dd, .org__facts dd { margin: 0; font-weight: 500; font-size: var(--text-base); line-height: 1.4; color: var(--color-text); }

.org__checks { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin: 0; padding: 0; list-style: none; }
.org__check { display: flex; align-items: center; gap: 8px; font-size: var(--text-sm); color: var(--color-text); }
.org__check :deep(svg) { color: var(--color-brand); }
.org__check--off { color: var(--color-text-muted); }
.org__check--off :deep(svg) { color: var(--color-line); }
</style>
