<script setup lang="ts">
/** Запись не найдена: вместо пустого экрана объясняем и ведём обратно к списку. */
defineProps<{ to: string, backLabel: string }>()
const localePath = useLocalePath()
</script>

<template>
  <MCard>
    <div class="mnotfound">
      <span class="mnotfound__icon"><UiIcon name="search-normal" :size="24" /></span>
      <h1 class="mnotfound__title">{{ $t('m.common.notFoundTitle') }}</h1>
      <p class="mnotfound__text">{{ $t('m.common.notFoundText') }}</p>
      <NuxtLink :to="localePath(to)">
        <UiButton variant="secondary">{{ backLabel }}</UiButton>
      </NuxtLink>
    </div>
  </MCard>
</template>

<style scoped>
.mnotfound {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 24px;
  text-align: center;
}

.mnotfound__icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin-bottom: 4px;
  border-radius: 50%;
  background: var(--color-field);
  color: var(--m-slate);
}

.mnotfound__title { margin: 0; font: var(--type-card-title); color: var(--m-ink); }
.mnotfound__text { margin: 0 0 8px; font-size: var(--text-sm); line-height: 20px; color: var(--m-slate); }
</style>
