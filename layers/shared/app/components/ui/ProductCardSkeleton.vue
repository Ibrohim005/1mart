<script setup lang="ts">
/**
 * Скелетон карточки товара. Повторяет её геометрию — те же единицы `--u`,
 * что и в UiProductCard, поэтому при загрузке сетка не дёргается: блоки
 * стоят ровно там, где потом появится содержимое.
 */
defineProps<{ compact?: boolean }>()
</script>

<template>
  <article class="card-skeleton" :class="{ 'card-skeleton--compact': compact }" aria-hidden="true">
    <UiSkeleton class="card-skeleton__photo" :radius="'calc(12 * var(--u))'" height="auto" />

    <div class="card-skeleton__info">
      <UiSkeleton width="55%" :height="'calc(20 * var(--u))'" :radius="'calc(6 * var(--u))'" />

      <div class="card-skeleton__title">
        <UiSkeleton width="100%" :height="'calc(13 * var(--u))'" />
        <UiSkeleton width="72%" :height="'calc(13 * var(--u))'" />
      </div>

      <UiSkeleton width="46%" :height="'calc(12 * var(--u))'" />
    </div>

    <UiSkeleton :height="'calc(36 * var(--u))'" :radius="'calc(10 * var(--u))'" />
  </article>
</template>

<style scoped>
.card-skeleton {
  --u: 1px;

  display: flex;
  flex-direction: column;
  gap: calc(10 * var(--u));
  padding: calc(6 * var(--u)) calc(6 * var(--u)) calc(8 * var(--u));
  border-radius: calc(16 * var(--u));
  background: var(--color-surface);
}

.card-skeleton--compact { --u: 1px; }

.card-skeleton__photo {
  aspect-ratio: 1 / 1;
  width: 100%;
}

.card-skeleton__info {
  display: flex;
  flex-direction: column;
  gap: calc(8 * var(--u));
  padding-inline: calc(2 * var(--u));
}

.card-skeleton__title {
  display: flex;
  flex-direction: column;
  gap: calc(5 * var(--u));
}
</style>
