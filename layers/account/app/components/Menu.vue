<script setup lang="ts">
/**
 * Меню личного кабинета, колонка 404.
 * Макет: Мои заказы → Frame 2147226460: группы карточек r20.6,
 * строки 69.5, активная строка #E2E6EC.
 *
 * 1mart: иконки заменены на собственный набор `pl-*`;
 * приглашений, аукционов и объявлений в маркетплейсе 1mart нет.
 */
const localePath = useLocalePath()
const route = useRoute()

const { sellerLandingUrl } = useRuntimeConfig().public

// Компонент ссылки разрешаем здесь: в выражении :is шаблона он не находится
const Link = resolveComponent('NuxtLink')

/*
 * У пункта либо `to` — внутренний маршрут, либо `href` — внешний адрес:
 * заявка продавца живёт в кабинете продавца 1mart.
 */
type MenuItem =
  | { label: string, icon: string, to: string, href?: never }
  | { label: string, icon: string, href: string, to?: never }

// Пункты по правам роли: баланс видит тот, кто им управляет; «Компания» есть у всех —
// руководитель управляет там сотрудниками, остальные видят свой доступ
const { can } = useAccessState()

const groups = computed<MenuItem[][]>(() => [
  [
    { label: 'breadcrumbs.orders', to: '/account/orders', icon: 'receipt-item-fill' },
    { label: 'org.company.title', to: '/account/company', icon: 'building-fill' },
    ...(can('balance.manage') ? [{ label: 'pay.balance.title', to: '/account/balance', icon: 'wallet-3-fill' }] : []),
    { label: 'account.reviews', to: '/account/reviews', icon: 'star-fill' },
    { label: 'common.becomeSeller', href: sellerLandingUrl, icon: 'shop-fill' },
  ],
  [{ label: 'account.promo', to: '/account/promo', icon: 'ticket' }],
  [{ label: 'account.settings', to: '/account/settings', icon: 'setting-2' }],
])

function isActive(to: string | undefined) {
  return to ? route.path.endsWith(to) : false
}

/** Внешний пункт открываем в новой вкладке, внутренний — обычной ссылкой */
function linkProps(item: MenuItem) {
  return item.href
    ? { href: item.href, target: '_blank', rel: 'noopener' }
    : { to: localePath(item.to) }
}
</script>

<template>
  <nav class="menu" :aria-label="$t('ui.account.menu.lichnyyKabinet')">
    <div v-for="(group, index) in groups" :key="index" class="menu__group">
      <component
        :is="item.href ? 'a' : Link"
        v-for="item in group"
        :key="item.href || item.to"
        v-bind="linkProps(item)"
        class="menu__row"
        :class="{ 'menu__row--active': !item.href && isActive(item.to) }"
      >
        <UiIcon :name="item.icon" :size="26" class="menu__icon" />
        <span class="menu__label">{{ $t(item.label) }}</span>
        <UiIcon name="alt-arrow-right" color="currentColor" :size="20" class="menu__chevron" />
      </component>
    </div>
  </nav>
</template>

<style scoped>
.menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 404px;
}

.menu__group {
  border-radius: 20.6px;
  background: var(--color-surface);
  overflow: hidden;
}

.menu__row {
  display: flex;
  align-items: center;
  gap: 15px;
  height: 69.5px;
  padding-inline: 21px;
}

.menu__row--active { background: #E2E6EC; }

/* Линейные иконки pl-* рисуются через currentColor */
.menu__icon { width: 26px; height: 26px; color: #101010; }

.menu__label {
  flex: 1;
  font-weight: 500;
  font-size: var(--text-2xl);
  line-height: 23.4px;
  color: #101010;
}

.menu__row:hover { background: #F3F5F8; }

.menu__chevron { font-size: var(--text-2xl); color: var(--color-text-muted); }
</style>
