<script setup lang="ts">
/** Урезанная шапка оформления заказа: только знак и название шага */
const localePath = useLocalePath()
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <NuxtLink :to="localePath('/')" class="header__logo" :aria-label="$t('shell.header.home')">
        <img src="/1mart-logo.svg" alt="1mart" class="header__logo-img" width="117" height="36">
      </NuxtLink>
      <span class="header__divider" aria-hidden="true" />
      <span class="header__title">{{ $t('shell.checkout.title') }}</span>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--color-surface);
  box-shadow: 0 1px 0 var(--color-line);
}

.header__inner {
  display: flex;
  align-items: center;
  gap: 20px;
  width: var(--container-width);
  height: 72px;
  margin-inline: auto;
}

.header__logo {
  display: inline-flex;
  line-height: 0;
}

.header__logo-img { display: block; height: 36px; width: auto; }

.header__divider {
  width: 1px;
  height: 28px;
  background: var(--color-line);
}

.header__title {
  font-weight: 500;
  font-size: var(--text-base);
  line-height: 20px;
  color: var(--color-gray);
}
</style>
