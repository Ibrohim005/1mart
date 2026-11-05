<script setup lang="ts">
/**
 * Скелетон корзины. Повторяет раскладку из макета «Корзинка»:
 * левая колонка 708 со строками товара (высота 198.6 + отступы, радиус 25)
 * и правая колонка 483 с карточкой расчёта.
 */
</script>

<template>
  <div class="cart-skeleton" aria-busy="true" aria-live="polite">
    <span class="visually-hidden">{{ $t('ui.shared.state.loading') }}</span>

    <div class="cart-skeleton__list">
      <!-- Шапка группы доставки: 88px по макету -->
      <div class="cart-skeleton__group-header">
        <UiSkeleton width="180px" height="18px" />
        <UiSkeleton width="220px" height="28px" class="cart-skeleton__group-name" />
      </div>

      <article v-for="n in 3" :key="n" class="cart-skeleton__row">
        <UiSkeleton width="125px" height="198.6px" radius="18.8px" />

        <div class="cart-skeleton__details">
          <UiSkeleton width="45%" height="26px" />
          <UiSkeleton width="90%" height="16px" />
          <UiSkeleton width="70%" height="16px" />
          <UiSkeleton width="35%" height="14px" />
        </div>

        <UiSkeleton width="24px" height="24px" radius="6px" />
      </article>
    </div>

    <div class="cart-skeleton__summary">
      <UiSkeleton width="60%" height="28px" />
      <UiSkeleton v-for="n in 4" :key="n" width="100%" height="18px" />
      <UiSkeleton width="100%" height="56px" radius="16px" class="cart-skeleton__button" />
    </div>
  </div>
</template>

<style scoped>
.cart-skeleton { display: flex; gap: 30px; align-items: flex-start; }

.cart-skeleton__list { width: 708px; padding: 10px; }

.cart-skeleton__group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 23.4px 10px;
}

.cart-skeleton__group-name { margin-left: auto; }

.cart-skeleton__row {
  display: flex;
  gap: 19px;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 25px;
  background: var(--color-surface);
}

.cart-skeleton__details {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
}

.cart-skeleton__summary {
  display: flex;
  flex-direction: column;
  gap: 17.6px;
  width: 483px;
  padding: 20px;
  border-radius: 25px;
  background: var(--color-surface);
}

.cart-skeleton__button { margin-top: 6px; }
</style>
