<script setup lang="ts">
/**
 * Скелетон карточки заказа. Габариты те же, что у настоящей
 * (сетка превью 187.8×187.8 r18.8 в карточке r25), поэтому при подстановке
 * заказов список не перестраивается.
 */
</script>

<template>
  <article class="order-skeleton" aria-hidden="true">
    <div class="order-skeleton__body">
      <UiSkeleton width="187.8px" height="187.8px" radius="18.8px" />

      <div class="order-skeleton__info">
        <div class="order-skeleton__row">
          <UiSkeleton width="110px" height="16px" />
          <UiSkeleton width="140px" height="18px" />
        </div>

        <UiSkeleton width="175.1px" height="34.4px" radius="9.4px" />

        <div class="order-skeleton__row">
          <UiSkeleton width="90px" height="16px" />
          <UiSkeleton width="120px" height="18px" />
        </div>

        <div class="order-skeleton__row order-skeleton__row--divided">
          <UiSkeleton width="80px" height="16px" />
          <UiSkeleton width="130px" height="18px" />
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.order-skeleton {
  padding: 10px;
  border-radius: 25px;
  background: var(--color-surface);
}

.order-skeleton__body { display: flex; gap: 19px; }

.order-skeleton__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  padding-top: 6px;
}

.order-skeleton__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-skeleton__row--divided {
  margin-top: 4px;
  border-top: 1px solid #EBEFF2;
  padding-top: 14px;
}
</style>
