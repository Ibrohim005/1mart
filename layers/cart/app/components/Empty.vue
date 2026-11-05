<script setup lang="ts">
/** Пустая корзина. Макет: Корзинка (5058:104511). Иллюстрация подключится с остальными фото. */
const localePath = useLocalePath()

// Путь к файлу в public отдаём строкой, иначе сборщик ищет его как модуль
const illustration = '/mock/empty-cart.png'
</script>

<template>
  <div class="empty">
    <img :src="illustration" alt="" class="empty__illustration">

    <h1 class="empty__title">{{ $t('ui.cart.empty.pustayaKorzinaEtoKak') }}</h1>
    <p class="empty__text">
      {{ $t('ui.cart.empty.nachniteGlavnoyStranicyNuzhnyy') }}
    </p>

    <div class="empty__actions">
      <NuxtLink :to="localePath('/')" class="empty__button empty__button--primary">{{ $t('common.glavnuyu') }}</NuxtLink>
      <NuxtLink :to="localePath('/account/orders')" class="empty__button">{{ $t('breadcrumbs.orders') }}</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 511px;
  margin-inline: auto;
  padding-block: 52px;
  text-align: center;
}

.empty__illustration { width: 264.2px; height: 264.2px; object-fit: contain; }

.empty__title {
  margin: 35.9px 0 0;
  font: var(--type-page-title);
  color: var(--color-text);
}

.empty__text {
  margin: 6.3px 0 0;
  font-weight: 400;
  font-size: var(--text-xl);
  line-height: 24.4px;
  color: var(--color-text-muted);
}

.empty__actions { display: flex; gap: 36px; margin-top: 33.9px; }

.empty__button {
  display: grid;
  place-items: center;
  width: 237.5px;
  background: var(--color-field);
  color: var(--color-text);
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.empty__button--primary { background: var(--color-brand); color: var(--color-on-brand); }
</style>
