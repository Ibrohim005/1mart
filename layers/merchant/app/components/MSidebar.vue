<script setup lang="ts">
// Боковая навигация кабинета. Активный пункт — тот, чей путь совпадает с
// текущим или является самым длинным его префиксом (чтобы «Финансы» не
// подсвечивались на «Финансы → Баланс»).
const groups = useMerchantNav()
const localePath = useLocalePath()
const route = useRoute()

const activeKey = computed(() => {
  const path = route.path
  let best: { key: string, len: number } | null = null
  for (const group of groups) {
    for (const item of group.items) {
      const target = localePath(item.to)
      const hit = path === target || path.startsWith(`${target}/`)
      if (hit && (!best || target.length > best.len)) best = { key: item.key, len: target.length }
    }
  }
  return best?.key ?? ''
})
</script>

<template>
  <aside class="msidebar">
    <NuxtLink :to="localePath('/dashboard')" class="msidebar__brand">
      <img src="/1mart-mark.svg" alt="spotshop" class="msidebar__logo" width="42" height="42">
      <span class="msidebar__brand-text">
        <span class="msidebar__brand-name">spotshop</span>
        <span class="msidebar__brand-sub">{{ $t('m.brand.business') }}</span>
      </span>
    </NuxtLink>

    <nav class="msidebar__nav">
      <div v-for="group in groups" :key="group.titleKey" class="msidebar__group">
        <p class="msidebar__group-title">{{ $t(group.titleKey) }}</p>
        <ul class="msidebar__list">
          <li v-for="item in group.items" :key="item.key">
            <NuxtLink
              :to="localePath(item.to)"
              class="msidebar__link"
              :class="{ 'msidebar__link--active': activeKey === item.key }"
            >
              <UiIcon :name="item.icon" :size="20" class="msidebar__icon" />
              <span>{{ $t(item.labelKey) }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.msidebar {
  display: flex;
  overflow-y: auto;
  height: 100%;
  flex-direction: column;
  padding: 20px 16px 28px;
  border-right: 1px solid var(--m-line);
  background: var(--m-surface);
}

.msidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px 22px;
  text-decoration: none;
}

.msidebar__logo {
  display: block;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  object-fit: contain;
  box-shadow: var(--m-shadow-brand);
}

.msidebar__brand-text { display: flex; flex-direction: column; line-height: 1.1; }
.msidebar__brand-name {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-3xl);
  letter-spacing: -0.02em;
  color: var(--m-ink);
}
.msidebar__brand-sub {
  margin-top: 2px;
  font-size: var(--text-2xs);
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--m-slate-soft);
}

.msidebar__nav { display: flex; flex-direction: column; gap: 20px; }
.msidebar__group { display: flex; flex-direction: column; gap: 3px; }
.msidebar__group-title {
  margin: 0 0 2px;
  padding: 2px 12px;
  font-size: var(--text-2xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--m-slate-soft);
}

.msidebar__list { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }

.msidebar__link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--m-radius-sm);
  font-size: var(--text-md);
  font-weight: 500;
  color: var(--m-slate);
  text-decoration: none;
  transition: background var(--m-dur-fast) var(--m-ease), color var(--m-dur-fast) var(--m-ease);
}
.msidebar__link:hover { background: var(--m-surface-sunken); color: var(--m-ink-soft); }
.msidebar__icon { color: var(--m-slate-soft); transition: color var(--m-dur-fast) var(--m-ease); }
.msidebar__link:hover .msidebar__icon { color: var(--m-slate); }

/* Активный пункт: мягкая бирюзовая подложка + вертикальная акцентная риска слева */
.msidebar__link--active {
  background: var(--m-brand-tint);
  color: var(--m-brand-strong);
  font-weight: 600;
}
.msidebar__link--active::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  width: 4px;
  height: 22px;
  border-radius: 0 4px 4px 0;
  background: var(--m-brand-gradient);
  transform: translateY(-50%);
}
.msidebar__link--active .msidebar__icon { color: var(--m-brand); }
</style>
