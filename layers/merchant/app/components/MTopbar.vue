<script setup lang="ts">
// Верхняя полоса кабинета: магазин и его статус слева; язык, уведомления,
// витрина и меню профиля справа.
const merchant = useMerchantStore()
const localePath = useLocalePath()
const { locale, setLocale, availableLocales } = useI18n()
const config = useRuntimeConfig()

const menuOpen = ref(false)
const profileEl = ref<HTMLElement | null>(null)
onClickOutside(profileEl, () => { menuOpen.value = false })

const user = computed(() => merchant.user)

const { data: notifications } = await useApiData<{ read: boolean }[]>('m:notifs', '/merchant/notifications', { lazy: true })
const hasUnread = computed(() => (notifications.value ?? []).some(item => !item.read))
const statusCode = computed(() => user.value?.company.status ?? 'active')

async function switchLocale() {
  const next = locale.value === 'ru' ? 'uz' : 'ru'
  await setLocale(next)
}

async function onLogout() {
  menuOpen.value = false
  await merchant.logout()
  await navigateTo(localePath('/login'))
}

const otherLocale = computed(() => (locale.value === 'ru' ? "O'zbekcha" : 'Русский'))
void availableLocales
</script>

<template>
  <header class="mtopbar">
    <div class="mtopbar__shop">
      <span class="mtopbar__shop-name">{{ user?.company.shopName ?? 'spotshop Business' }}</span>
      <span class="mtopbar__status" :class="`mtopbar__status--${statusCode}`">
        {{ $t(`m.companyStatus.${statusCode}`) }}
      </span>
    </div>

    <div class="mtopbar__actions">
      <button type="button" class="mtopbar__btn" :aria-label="$t('m.topbar.switchLang')" @click="switchLocale">
        <UiIcon name="global-fill" :size="20" />
        <span>{{ otherLocale }}</span>
      </button>

      <NuxtLink :to="localePath('/notifications')" class="mtopbar__icon-btn" :aria-label="$t('m.nav.notifications')">
        <UiIcon name="notification-bing-fill" :size="20" />
        <span v-if="hasUnread" class="mtopbar__dot" />
      </NuxtLink>

      <a :href="config.public.storefrontUrl" target="_blank" rel="noopener" class="mtopbar__btn">
        <UiIcon name="export-fill" :size="18" />
        <span>{{ $t('m.topbar.storefront') }}</span>
      </a>

      <div ref="profileEl" class="mtopbar__profile">
        <button type="button" class="mtopbar__avatar-btn" @click="menuOpen = !menuOpen">
          <span class="mtopbar__avatar">{{ (user?.name ?? '1').charAt(0) }}</span>
          <span class="mtopbar__who">
            <span class="mtopbar__who-name">{{ user?.name ?? '—' }}</span>
            <span class="mtopbar__who-role">{{ $t(`m.role.${user?.role ?? 'owner'}`) }}</span>
          </span>
          <UiIcon name="alt-arrow-down" :size="16" />
        </button>

        <div v-if="menuOpen" class="mtopbar__menu">
          <NuxtLink :to="localePath('/company')" class="mtopbar__menu-item" @click="menuOpen = false">
            <UiIcon name="building-fill" :size="18" />{{ $t('m.nav.company') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/employees')" class="mtopbar__menu-item" @click="menuOpen = false">
            <UiIcon name="people-fill" :size="18" />{{ $t('m.nav.employees') }}
          </NuxtLink>
          <button type="button" class="mtopbar__menu-item mtopbar__menu-item--danger" @click="onLogout">
            <UiIcon name="logout-fill" :size="18" />{{ $t('m.topbar.logout') }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.mtopbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  padding: 0 32px;
  border-bottom: 1px solid var(--m-line);
  background: rgb(255 255 255 / 86%);
  backdrop-filter: saturate(180%) blur(10px);
  box-shadow: var(--m-shadow-xs);
}

.mtopbar__shop { display: flex; align-items: center; gap: 12px; }
.mtopbar__shop-name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-xl);
  letter-spacing: -0.01em;
  color: var(--m-ink);
}

.mtopbar__status {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding-inline: 11px;
  border-radius: var(--m-radius-pill);
  font-size: var(--text-2xs);
  font-weight: 600;
}
.mtopbar__status--active { background: var(--m-success-bg); color: var(--m-success-fg); }
.mtopbar__status--pending { background: var(--m-warning-bg); color: var(--m-warning-fg); }
.mtopbar__status--rejected,
.mtopbar__status--suspended { background: var(--m-danger-bg); color: var(--m-danger-fg); }

.mtopbar__actions { display: flex; align-items: center; gap: 10px; }

.mtopbar__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding-inline: 14px;
  border: 1px solid var(--m-line);
  border-radius: var(--m-radius-sm);
  background: var(--m-surface);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--m-ink-soft);
  cursor: pointer;
  text-decoration: none;
  transition: background var(--m-dur-fast) var(--m-ease), border-color var(--m-dur-fast) var(--m-ease);
}
.mtopbar__btn:hover { background: var(--m-surface-sunken); border-color: var(--m-line-strong); }

.mtopbar__icon-btn {
  position: relative;
  display: grid;
  width: 40px;
  height: 40px;
  border: 1px solid var(--m-line);
  border-radius: var(--m-radius-sm);
  color: var(--m-ink-soft);
  place-items: center;
  transition: background var(--m-dur-fast) var(--m-ease), border-color var(--m-dur-fast) var(--m-ease);
}
.mtopbar__icon-btn:hover { background: var(--m-surface-sunken); border-color: var(--m-line-strong); }
.mtopbar__dot {
  position: absolute;
  top: 8px;
  right: 9px;
  width: 8px;
  height: 8px;
  border: 2px solid var(--m-surface);
  border-radius: 50%;
  background: var(--m-danger);
}

.mtopbar__profile { position: relative; }
.mtopbar__avatar-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 4px 4px;
  border: 1px solid var(--m-line);
  border-radius: var(--m-radius);
  background: var(--m-surface);
  cursor: pointer;
  transition: background var(--m-dur-fast) var(--m-ease), border-color var(--m-dur-fast) var(--m-ease);
}
.mtopbar__avatar-btn:hover { background: var(--m-surface-sunken); border-color: var(--m-line-strong); }
.mtopbar__avatar {
  display: grid;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--m-brand-gradient);
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--m-on-brand);
  place-items: center;
}
.mtopbar__who { display: flex; flex-direction: column; line-height: 1.2; text-align: left; }
.mtopbar__who-name { font-size: var(--text-sm); font-weight: 600; color: var(--m-ink); }
.mtopbar__who-role { font-size: var(--text-2xs); color: var(--m-slate); }

.mtopbar__menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 50;
  display: flex;
  min-width: 220px;
  flex-direction: column;
  padding: 6px;
  border: 1px solid var(--m-line);
  border-radius: var(--m-radius);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-lg);
  animation: m-scale-in var(--m-dur) var(--m-ease) both;
  transform-origin: top right;
}
.mtopbar__menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 0;
  border-radius: var(--m-radius-sm);
  background: none;
  font-size: var(--text-sm);
  color: var(--m-ink-soft);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}
.mtopbar__menu-item:hover { background: var(--m-surface-sunken); }
.mtopbar__menu-item--danger { color: var(--m-danger-fg); }
</style>
