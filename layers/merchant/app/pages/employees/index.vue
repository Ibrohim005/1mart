<script setup lang="ts">
import type { Employee, MerchantRole } from '#shared/types/merchant'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const api = useApi()
const toast = useToast()
const sm = useStatusMeta()

const { data, status, refresh } = await useApiData<Employee[]>('m:employees', '/merchant/employees')

const ROLES: MerchantRole[] = ['owner', 'manager', 'storekeeper', 'accountant', 'viewer']
// Пригласить можно любую роль, кроме владельца — он один.
const roleOptions = computed(() =>
  ROLES.filter(r => r !== 'owner').map(r => ({ value: r, label: t(`m.role.${r}`) })))

const roleDescriptions = computed(() => ROLES.map(code => ({
  code,
  label: t(`m.role.${code}`),
  desc: t(`m.employees.roleDesc${code.charAt(0).toUpperCase()}${code.slice(1)}`),
})))

const columns = [
  { key: 'name', label: t('m.employees.colName') },
  { key: 'contacts', label: t('m.employees.colContacts') },
  { key: 'role', label: t('m.employees.colRole') },
  { key: 'status', label: t('m.common.status') },
  { key: 'lastActiveAt', label: t('m.employees.colLast') },
  { key: 'actions', label: '', align: 'right' as const, width: '90px' },
]

// Форма приглашения
const inviteOpen = ref(false)
// role держим строкой: MSelect работает со строковой моделью, а бэкенд
// принимает код роли как строку. Допустимые значения берём из roleOptions.
const invite = reactive({ name: '', phone: '', email: '', role: 'manager' })
const errName = ref('')
const errPhone = ref('')
const inviting = ref(false)

function resetInvite() {
  invite.name = ''
  invite.phone = ''
  invite.email = ''
  invite.role = 'manager'
  errName.value = ''
  errPhone.value = ''
}

async function sendInvite() {
  errName.value = ''
  errPhone.value = ''
  if (invite.name.trim().length < 2) { errName.value = t('m.employees.errName'); return }
  if (invite.phone.replace(/\D/g, '').length < 9) { errPhone.value = t('m.employees.errPhone'); return }
  inviting.value = true
  try {
    await api.post('/merchant/employees', { ...invite })
    toast.show(t('m.employees.invited'))
    inviteOpen.value = false
    resetInvite()
    refresh()
  }
  catch {
    toast.show(t('m.common.loadError'), 'error')
  }
  finally {
    inviting.value = false
  }
}

const removing = ref<Employee | null>(null)
const removeOpen = computed({ get: () => removing.value !== null, set: (value: boolean) => { if (!value) removing.value = null } })

function remove(employee: Employee) {
  removing.value = employee
}

async function confirmRemove() {
  if (!removing.value) return
  try {
    await api.delete(`/merchant/employees/${removing.value.id}`)
    toast.show(t('m.common.saved'))
    removing.value = null
    refresh()
  }
  catch {
    toast.show(t('m.common.loadError'), 'error')
  }
}

useSeoMeta({ title: () => `${t('m.employees.title')} — 1mart Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.employees.title')" :subtitle="$t('m.employees.subtitle')">
      <UiButton variant="primary" @click="inviteOpen = true">
        <UiIcon name="plus" :size="18" />{{ $t('m.employees.invite') }}
      </UiButton>
    </MPageHeader>

    <MCard flush>
      <div v-if="status === 'pending' && !data" class="emp__loading">
        <UiSkeleton v-for="n in 5" :key="n" height="52px" radius="10px" />
      </div>

      <MTable v-else-if="data && data.length" :columns="columns" :rows="data" row-key="id">
        <template #cell-name="{ row }">
          <span class="emp__name">{{ row.name }}</span>
        </template>
        <template #cell-contacts="{ row }">
          <span class="emp__contacts">
            <span>{{ row.phone }}</span>
            <span class="emp__muted">{{ row.email }}</span>
          </span>
        </template>
        <template #cell-role="{ value }">{{ $t(`m.role.${value}`) }}</template>
        <template #cell-status="{ value }">
          <MStatus :tone="sm.employee(value as string).tone">{{ $t(sm.employee(value as string).key) }}</MStatus>
        </template>
        <template #cell-lastActiveAt="{ value }">
          {{ value ? formatDate(new Date(value as string)) : $t('m.employees.neverActive') }}
        </template>
        <template #cell-actions="{ row }">
          <button
            v-if="row.role !== 'owner'"
            type="button"
            class="emp__remove"
            :aria-label="$t('m.employees.remove')"
            @click="remove(row)"
          >
            <UiIcon name="trash" :size="18" />
          </button>
        </template>
      </MTable>

      <MLoadError v-else-if="status === 'error'" @retry="refresh()" />
      <MEmpty v-else :title="$t('m.employees.empty')" icon="people-fill" />
    </MCard>

    <!-- Роли и права -->
    <MCard :title="$t('m.employees.rolesTitle')" class="emp__roles">
      <ul class="emp__roles-list">
        <li v-for="role in roleDescriptions" :key="role.code" class="emp__role">
          <span class="emp__role-name">{{ role.label }}</span>
          <span class="emp__role-desc">{{ role.desc }}</span>
        </li>
      </ul>
    </MCard>

    <MConfirm
      v-model="removeOpen"
      :title="$t('m.employees.remove')"
      :text="$t('m.employees.confirmRemove')"
      :confirm-label="$t('m.employees.remove')"
      @confirm="confirmRemove"
    />

    <!-- Приглашение -->
    <UiModal v-model="inviteOpen" :title="$t('m.employees.inviteTitle')">
      <form class="emp__invite" @submit.prevent="sendInvite">
        <MField v-model="invite.name" :label="$t('m.employees.name')" :error="errName" required />
        <MField v-model="invite.phone" :label="$t('m.employees.phone')" type="tel" inputmode="tel" placeholder="+998 90 123 45 67" :error="errPhone" required />
        <MField v-model="invite.email" :label="$t('m.employees.email')" type="email" inputmode="email" />
        <MSelect v-model="invite.role" :label="$t('m.employees.role')" :options="roleOptions" />
        <UiButton type="submit" variant="primary" size="lg" block :disabled="inviting">
          {{ $t('m.employees.send') }}
        </UiButton>
      </form>
    </UiModal>
  </div>
</template>

<style scoped>
.emp__loading { display: flex; flex-direction: column; gap: 8px; padding: 18px; }
.emp__name { font-weight: 500; color: var(--color-text); }
.emp__contacts { display: flex; flex-direction: column; }
.emp__muted { font-size: var(--text-xs); color: var(--color-text-muted); }

.emp__remove {
  display: grid; width: 34px; height: 34px;
  border: 1px solid var(--color-line); border-radius: 9px; background: var(--color-surface);
  color: var(--color-text-muted); cursor: pointer; place-items: center;
}
.emp__remove:hover { color: var(--color-danger); background: var(--color-page); }

.emp__roles { margin-top: 20px; }
.emp__roles-list { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }
.emp__role {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px;
  padding: 13px 0;
  border-bottom: 1px solid var(--color-line);
}
.emp__role:last-child { border-bottom: 0; }
.emp__role-name { font-weight: 600; font-size: var(--text-sm); color: var(--color-text); }
.emp__role-desc { font-size: var(--text-sm); color: var(--color-text-muted); }

.emp__invite { display: flex; flex-direction: column; gap: 16px; }
</style>
