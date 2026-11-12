<script setup lang="ts">
/**
 * Своя роль: название и права. Готовые роли (руководитель, закупщик, бухгалтер,
 * сотрудник) не меняются — их показываем только для чтения.
 */
import type { Permission, Role } from '#shared/types/company'
import { PERMISSIONS } from '#shared/types/company'

const props = defineProps<{ role: Role | null }>()
const open = defineModel<boolean>({ required: true })
const emit = defineEmits<{ saved: [Role] }>()

const { t } = useI18n()
const api = useApi()
const { roleTitle, permissionTitle, permissionText } = useOrgLabels()

const title = ref('')
const permissions = ref<Permission[]>([])
const error = ref('')
const busy = ref(false)
const readonly = computed(() => !!props.role?.preset)

watch(open, (value) => {
  if (!value) return
  title.value = props.role ? roleTitle(props.role) : ''
  permissions.value = [...(props.role?.permissions ?? ['requests.create'])]
  error.value = ''
}, { immediate: true })

function toggle(permission: Permission) {
  permissions.value = permissions.value.includes(permission)
    ? permissions.value.filter(item => item !== permission)
    : PERMISSIONS.filter(item => item === permission || permissions.value.includes(item))
}

const ERRORS: Record<string, string> = {
  role_title: 'org.role.errorTitle',
  role_title_taken: 'org.role.errorTitleTaken',
  role_permissions: 'org.role.errorPermissions',
}

async function save() {
  if (title.value.trim().length < 2) {
    error.value = t('org.role.errorTitle')
    return
  }
  if (!permissions.value.length) {
    error.value = t('org.role.errorPermissions')
    return
  }
  busy.value = true
  error.value = ''
  try {
    const body = { title: title.value.trim(), permissions: permissions.value }
    const role = props.role
      ? await api.patch<Role>(`/company/roles/${props.role.id}`, body)
      : await api.post<Role>('/company/roles', body)
    emit('saved', role)
    open.value = false
  }
  catch (caught) {
    const code = (caught as { data?: Array<{ code: string }> }).data?.[0]?.code ?? ''
    error.value = t(ERRORS[code] ?? 'org.common.errorGeneric')
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <UiModal v-model="open" :title="readonly ? roleTitle(role!) : role ? $t('org.role.editTitle') : $t('org.role.addTitle')" body-padding="8px 24px 24px" width="640px">
    <form class="role" novalidate @submit.prevent="save">
      <p v-if="readonly" class="role__note">{{ $t('org.role.presetNote') }}</p>
      <label v-else class="role__field">
        <span class="role__label">{{ $t('org.role.title') }}</span>
        <input v-model="title" class="role__input" :placeholder="$t('org.role.titlePlaceholder')" maxlength="40">
      </label>

      <fieldset class="role__permissions" :disabled="readonly">
        <legend class="role__label">{{ $t('org.role.permissions') }}</legend>
        <label v-for="permission in PERMISSIONS" :key="permission" class="role__permission" :class="{ 'role__permission--on': permissions.includes(permission) }">
          <input type="checkbox" class="visually-hidden" :checked="permissions.includes(permission)" @change="toggle(permission)">
          <span class="role__box" aria-hidden="true">
            <UiIcon v-if="permissions.includes(permission)" name="tick-square-fill" :size="22" color="currentColor" />
          </span>
          <span class="role__text">
            <span class="role__permission-title">{{ permissionTitle(permission) }}</span>
            <span class="role__permission-text">{{ permissionText(permission) }}</span>
          </span>
        </label>
      </fieldset>

      <p v-if="error" class="role__error" role="alert">{{ error }}</p>

      <div v-if="!readonly" class="role__actions">
        <UiButton variant="secondary" @click="open = false">{{ $t('org.common.cancel') }}</UiButton>
        <UiButton type="submit" :disabled="busy">{{ $t('org.common.save') }}</UiButton>
      </div>
    </form>
  </UiModal>
</template>

<style scoped>
.role { display: flex; flex-direction: column; gap: 18px; }
.role__note { margin: 0; padding: 12px 14px; border-radius: 10px; background: var(--color-field); font-size: var(--text-sm); line-height: 1.45; color: var(--color-text-muted); }
.role__field { display: flex; flex-direction: column; gap: 8px; }
.role__label { margin-bottom: 8px; font: var(--type-label); color: var(--label-color); }
.role__input { height: var(--field-height); padding-inline: 14px; border: 1px solid transparent; border-radius: var(--field-radius); background: var(--color-field); font: var(--type-input); color: var(--input-color); outline: none; }
.role__input:focus { border-color: var(--color-brand); }
.role__permissions { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; border: 0; }
.role__permission { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; border: 1px solid var(--color-line); border-radius: 10px; cursor: pointer; }
.role__permissions:disabled .role__permission { cursor: default; }
.role__permission--on { border-color: var(--color-brand); }
.role__permission:has(:focus-visible) { box-shadow: var(--focus-ring); }
.role__box { display: grid; flex: none; place-items: center; width: 22px; height: 22px; margin-top: 1px; border: 2px solid var(--color-line); border-radius: 5px; color: var(--color-brand); }
.role__permission--on .role__box { border: 0; }
.role__text { display: flex; flex-direction: column; gap: 2px; }
.role__permission-title { font-weight: 600; font-size: var(--text-base); color: var(--color-text); }
.role__permission-text { font-size: var(--text-sm); line-height: 1.4; color: var(--color-text-muted); }
.role__error { margin: 0; font-size: var(--text-sm); color: var(--color-danger); }
.role__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
</style>
