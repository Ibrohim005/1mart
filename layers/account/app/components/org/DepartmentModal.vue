<script setup lang="ts">
/**
 * Отдел и открытые ему разделы каталога. Сотрудник отдела видит только их:
 * бухгалтерии — бумагу и канцелярию, а не одежду. Подсказка по ОКЭД отмечает
 * разделы, подходящие виду деятельности компании.
 */
import type { Category } from '#shared/types/catalog'
import type { Department } from '#shared/types/company'

const props = defineProps<{ department: Department | null, categories: Category[], suggested: string[] }>()
const open = defineModel<boolean>({ required: true })
const emit = defineEmits<{ saved: [Department] }>()

const { t } = useI18n()
const api = useApi()

const title = ref('')
const selected = ref<string[]>([])
const error = ref('')
const busy = ref(false)

watch(open, (value) => {
  if (!value) return
  title.value = props.department?.title ?? ''
  selected.value = [...(props.department?.categories ?? [])]
  error.value = ''
}, { immediate: true })

const ERRORS: Record<string, string> = {
  department_title: 'org.department.errorTitle',
  department_title_taken: 'org.department.errorTitleTaken',
}

async function save() {
  if (title.value.trim().length < 2) {
    error.value = t('org.department.errorTitle')
    return
  }
  busy.value = true
  error.value = ''
  try {
    const body = { title: title.value.trim(), categories: selected.value }
    const department = props.department
      ? await api.patch<Department>(`/company/departments/${props.department.id}`, body)
      : await api.post<Department>('/company/departments', body)
    emit('saved', department)
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
  <UiModal v-model="open" :title="department ? $t('org.department.editTitle') : $t('org.department.addTitle')" body-padding="8px 24px 24px" width="640px">
    <form class="department" novalidate @submit.prevent="save">
      <label class="department__field">
        <span class="department__label">{{ $t('org.department.title') }}</span>
        <input v-model="title" class="department__input" :placeholder="$t('org.department.titlePlaceholder')" maxlength="60">
      </label>

      <div class="department__field">
        <span class="department__label">{{ $t('org.department.categories') }}</span>
        <p class="department__hint">{{ $t('org.department.categoriesHint') }}</p>
        <AccountCategoryPicker v-model="selected" :categories="categories" :suggested="suggested" />
        <p v-if="!selected.length" class="department__warning">{{ $t('org.department.emptyWarning') }}</p>
      </div>

      <p v-if="error" class="department__error" role="alert">{{ error }}</p>

      <div class="department__actions">
        <UiButton variant="secondary" @click="open = false">{{ $t('org.common.cancel') }}</UiButton>
        <UiButton type="submit" :disabled="busy">{{ $t('org.common.save') }}</UiButton>
      </div>
    </form>
  </UiModal>
</template>

<style scoped>
.department { display: flex; flex-direction: column; gap: 18px; }
.department__field { display: flex; flex-direction: column; gap: 8px; }
.department__label { font: var(--type-label); color: var(--label-color); }
.department__input { height: var(--field-height); padding-inline: 14px; border: 1px solid transparent; border-radius: var(--field-radius); background: var(--color-field); font: var(--type-input); color: var(--input-color); outline: none; }
.department__input:focus { border-color: var(--color-brand); }
.department__hint { margin: 0; font-size: var(--text-sm); line-height: 1.45; color: var(--color-text-muted); }
.department__warning { margin: 0; font-size: var(--text-sm); color: #A15C00; }
.department__error { margin: 0; font-size: var(--text-sm); color: var(--color-danger); }
.department__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
</style>
