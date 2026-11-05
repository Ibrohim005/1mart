<script setup lang="ts">
/** Блок «О товаре или животном». Макет: about-card 740×356.1, r25.5. */
defineProps<{ description: string }>()
const expanded = ref(false)
</script>

<template>
  <section class="about">
    <h2 class="about__title">{{ $t('ui.pdp.about.tovareIliZhivotnom') }}</h2>

    <p class="about__text" :class="{ 'about__text--expanded': expanded }">{{ description }}</p>

    <button type="button" class="about__more" @click="expanded = !expanded">
      {{ expanded ? $t('common.collapse') : $t('common.more') }}
      <UiIcon name="alt-arrow-down" color="currentColor" :size="21" class="about__chevron" :class="{ 'about__chevron--up': expanded }" />
    </button>
  </section>
</template>

<style scoped>
.about {
  padding: 20.4px 20.4px 25.5px;
  border-radius: 25.5px;
  background: var(--color-surface);
}

.about__title {
  margin: 5.1px 0 0;
  font: var(--type-section-title);
  color: var(--color-text);
}

.about__text {
  margin: 18px 0 0;
  font-weight: 400;
  font-size: var(--text-xl);
  line-height: 27px;
  color: #111111;
  white-space: pre-line;
  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.about__text--expanded { -webkit-line-clamp: unset; }

.about__more {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 18px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-brand-text);
  cursor: pointer;
  font: var(--type-button-sm);
}

.about__chevron { display: inline-block; line-height: 1; }
.about__chevron--up { transform: rotate(180deg); }
</style>
