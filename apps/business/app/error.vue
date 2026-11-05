<script setup lang="ts">
import type { NuxtError } from '#app'

/** Страница ошибки кабинета: без неё показывалась английская заглушка Nuxt. */
const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()
const localePath = useLocalePath()

const isMissing = computed(() => props.error.statusCode === 404)

function goHome() {
  clearError({ redirect: localePath('/dashboard') })
}

useSeoMeta({ title: () => `${t(isMissing.value ? 'm.common.notFoundTitle' : 'm.common.loadError')} — 1mart Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <main class="berror">
    <img src="/1mart-logo.svg" alt="1mart" width="120" height="36" class="berror__logo">
    <p class="berror__code">{{ error.statusCode }}</p>
    <h1 class="berror__title">{{ $t(isMissing ? 'm.common.notFoundTitle' : 'm.common.loadError') }}</h1>
    <p class="berror__text">{{ $t(isMissing ? 'm.common.notFoundText' : 'm.common.loadErrorText') }}</p>
    <UiButton variant="primary" @click="goHome">{{ $t('m.common.toDashboard') }}</UiButton>
  </main>
</template>

<style scoped>
.berror {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 100vh;
  padding: 24px;
  background: var(--color-page);
  text-align: center;
}

.berror__logo { margin-bottom: 24px; }
.berror__code { margin: 0; font: var(--type-page-title); color: var(--color-gray); }
.berror__title { margin: 0; font: var(--type-section-title); color: var(--color-text); }
.berror__text { margin: 0 0 16px; font-size: var(--text-md); line-height: 22px; color: var(--color-text-muted); }
</style>
