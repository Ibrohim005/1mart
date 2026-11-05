<script setup lang="ts">
const { t } = useI18n()
const api = useApi()
const auth = useAuthStore()

definePageMeta({ middleware: 'auth' })

/**
 * «Настройки». Макет 5058:105414 — колонка 816, зазор между блоками 20.
 * Поля 53.3 с заливкой #EDF0EF и обводкой #C6CECB: «Полное имя» и «Дата
 * рождения» r16.16, телефон и плитки пола r10.77. Кнопка 816×55.5 r12.62.
 */
interface Profile {
  name: string
  phone: string
  avatar: string
}

const { data: profile } = await useApiData<Profile>('account:profile', '/user/profile')

const form = reactive({
  fullName: '',
  phone: '',
})

// Телефон меняется через отдельный сценарий с OTP (см. `pen`-иконку рядом —
// поле только для показа), поэтому не входит в save().
watch(profile, (value) => {
  if (!value) return
  form.fullName = value.name
  form.phone = value.phone
}, { immediate: true })

const saving = ref(false)
const saved = ref(false)

// Загрузка аватара: реальный <input type="file">, превью — сразу локально,
// а следом настоящая загрузка; если она не удалась, откатываем превью.
const fileInput = ref<HTMLInputElement | null>(null)
const avatarUrl = ref('')
const uploadingAvatar = ref(false)

watch(profile, (value) => {
  if (value?.avatar) avatarUrl.value = value.avatar
}, { immediate: true })

function pickAvatar() {
  fileInput.value?.click()
}

async function onAvatarPicked(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const previous = avatarUrl.value
  const isBlob = previous.startsWith('blob:')
  const localPreview = URL.createObjectURL(file)
  avatarUrl.value = localPreview

  const body = new FormData()
  body.append('avatar', file)

  uploadingAvatar.value = true
  try {
    const uploaded = await api.post<{ avatar: string }>('/user/avatar', body)
    if (isBlob) URL.revokeObjectURL(previous)
    URL.revokeObjectURL(localPreview)
    avatarUrl.value = uploaded.avatar
  }
  catch {
    URL.revokeObjectURL(localPreview)
    avatarUrl.value = previous
  }
  finally {
    uploadingAvatar.value = false
    input.value = ''
  }
}

onUnmounted(() => {
  if (avatarUrl.value.startsWith('blob:')) URL.revokeObjectURL(avatarUrl.value)
})

const localePath = useLocalePath()
const router = useRouter()
async function logout() {
  await auth.logout()
  router.push(localePath('/'))
}

async function save() {
  saving.value = true
  try {
    await api.patch('/user/profile', {
      fullName: form.fullName,
    })
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  }
  finally {
    saving.value = false
  }
}

const saveLabel = computed(() => {
  if (saving.value) return t('ui.account.settings.saving')
  if (saved.value) return t('ui.account.settings.savedDone')
  return t('common.save')
})

useSeoMeta({ title: () => t('ui.account.settings.seoTitle'), robots: 'noindex, nofollow' })
</script>

<template>
  <AccountLayout :title="$t('account.settings')">
    <form class="settings" @submit.prevent="save">
      <div class="settings__avatar">
        <button type="button" class="settings__avatar-button" :disabled="uploadingAvatar" :aria-label="$t('ui.account.settings.zagruzitFoto')" @click="pickAvatar">
          <img v-if="avatarUrl" :src="avatarUrl" alt="" class="settings__avatar-preview">
          <UiIcon v-else name="camera" :size="49" />
        </button>
        <button type="button" class="settings__avatar-link" :disabled="uploadingAvatar" @click="pickAvatar">{{ $t('ui.account.settings.zagruzitFoto') }}</button>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="settings__avatar-input"
          @change="onAvatarPicked"
        >
      </div>

      <div class="settings__row">
        <label class="settings__field settings__field--name">
          <span class="settings__label">{{ $t('ui.account.settings.polnoeImya') }}</span>
          <!-- Ограничение длины: серверной проверки ещё нет, а поле свободное -->
          <input v-model="form.fullName" type="text" maxlength="120" :placeholder="$t('ui.account.settings.vvediteTekst')">
        </label>

        <label class="settings__field settings__field--phone">
          <span class="settings__label">{{ $t('common.nomerTelefona') }}</span>
          <span class="settings__control">
            <input v-model="form.phone" type="tel" maxlength="20" placeholder="+998">
            <span class="settings__pen"><UiIcon name="pen" :size="22" /></span>
          </span>
        </label>
      </div>

      <button type="submit" class="settings__save" :disabled="saving">{{ saveLabel }}</button>

      <button type="button" class="settings__logout" @click="logout">{{ $t('ui.account.settings.logout') }}</button>
    </form>
  </AccountLayout>
</template>

<style scoped>
/* Колонка 816, между блоками 20; от заголовка до формы 40 (у заголовка уже 10) */
.settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 816px;
  margin-top: 30px;
}

.settings__avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18.4px;
}

.settings__avatar-button {
  display: grid;
  place-items: center;
  width: 122.5px;
  height: 122.5px;
  padding: 0;
  border: 1.53px solid var(--color-surface);
  border-radius: 50%;
  background: #EDF0EF;
  cursor: pointer;
}

.settings__avatar-button:hover { background: #E3E7E6; }

.settings__avatar-preview {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.settings__avatar-link {
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  font: var(--type-button-sm);
  color: var(--color-brand-text);
}

.settings__avatar-link:hover { text-decoration: underline; }
.settings__avatar-input { display: none; }

.settings__row { display: flex; gap: 8.6px; }

.settings__field--name,
.settings__field--phone { flex: 0 0 403.7px; }


.settings__label {
  display: block;
  margin-bottom: 10px;
  font: var(--type-label);
  color: var(--label-color);
}

.settings__field input {
  width: 100%;
  height: 53.3px;
  padding-inline: 16px;
  border: 1.35px solid #C6CECB;
  border-radius: 16.16px;
  background: #EDF0EF;
  font: var(--type-input);
  color: var(--input-color);
}

/* Телефон и плитки пола в макете скруглены слабее остальных полей */
.settings__field--phone input { border-radius: 10.77px; }

.settings__field input:focus { outline: none; box-shadow: var(--focus-ring); }

.settings__control {
  position: relative;
  display: block;
}

.settings__control input { padding-right: 56px; }

.settings__pen {
  position: absolute;
  top: 50%;
  right: 3px;
  display: grid;
  place-items: center;
  width: 37.7px;
  height: 37.7px;
  border-radius: 8.08px;
  background: var(--color-surface);
  transform: translateY(-50%);
}

/* Родной значок календаря растянут на всю иконку: клик открывает выбор даты */
/* Скрытый radio под оформлением из макета */
/* Значок пола зелёный только у выбранной плитки — в макете второй серый */
.settings__save {
  width: 100%;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.settings__save:hover { background: #22C636; }
.settings__save:active { background: #119A24; }
.settings__save:disabled { opacity: 0.6; cursor: default; }

.settings__logout {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  font-weight: 500;
  font-size: var(--text-base);
  line-height: 19.2px;
  color: #000000;
  cursor: pointer;
}

.settings__logout:hover { color: var(--color-danger); }
</style>
