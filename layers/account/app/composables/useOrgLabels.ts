import type { Permission, Requester, Role } from '#shared/types/company'

/**
 * Подписи ролей и прав. Готовая роль переводится по ключу пресета, своя
 * роль подписывается так, как её назвал руководитель.
 */
export function useOrgLabels() {
  const { t } = useI18n()

  function roleTitle(role: Pick<Role, 'preset' | 'title'> | Pick<Requester, 'rolePreset' | 'roleTitle'>) {
    const preset = 'preset' in role ? role.preset : role.rolePreset
    const title = 'title' in role ? role.title : role.roleTitle
    return preset ? t(`org.roles.preset.${preset}`) : title
  }

  const permissionTitle = (permission: Permission) => t(`org.permissions.${permission.replace('.', '_')}.title`)
  const permissionText = (permission: Permission) => t(`org.permissions.${permission.replace('.', '_')}.text`)

  /** «Иванова Анна · Бухгалтер · Бухгалтерия» */
  function requesterLine(requester: Requester) {
    return [requester.fullName, roleTitle(requester), requester.departmentTitle].filter(Boolean).join(' · ')
  }

  return { roleTitle, permissionTitle, permissionText, requesterLine }
}
