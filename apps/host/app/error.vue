<script setup lang="ts">
/**
 * Страница ошибки: 404 и 500.
 * В макете такого экрана нет — собрана в стиле проекта:
 * те же цвета, радиусы и кнопки, что и на пустых состояниях корзины.
 */
import type { NuxtError } from '#app'

const { t } = useI18n()

const props = defineProps<{ error: NuxtError }>()
const localePath = useLocalePath()

const isNotFound = computed(() => props.error?.statusCode === 404)

/**
 * Страница ошибки рисуется раньше, чем догрузятся сообщения локали, — тогда
 * вместо текста показывался сырой ключ «ui.host.error.genericTitle».
 * Если перевода ещё нет, подставляем русский текст.
 */
const { te } = useI18n()
function message(key: string, fallback: string) {
  return te(key) ? t(key) : fallback
}

const title = computed(() =>
  isNotFound.value
    ? message('ui.host.error.notFoundTitle', 'Такой страницы нет')
    : message('ui.host.error.genericTitle', 'Что-то пошло не так'),
)

const text = computed(() =>
  isNotFound.value
    ? message('ui.host.error.notFoundText', 'Возможно, страницу удалили или в ссылке опечатка. Начните с главной — нужный товар найдётся быстро')
    : message('ui.host.error.genericText', 'Мы уже чиним. Попробуйте обновить страницу или вернуться на главную'),
)

// Без своего title в заголовок вкладки утекало служебное сообщение
// с путём: «404 - Page not found: /net-takoy-stranicy-xyz»
useSeoMeta({ title: () => title.value, robots: 'noindex, nofollow' })
</script>

<template>
  <div class="error">
    <AppHeader />

    <main class="error__main">
      <p class="error__code">{{ error?.statusCode ?? 500 }}</p>
      <h1 class="error__title">{{ title }}</h1>
      <p class="error__text">{{ text }}</p>

      <div class="error__actions">
        <NuxtLink :to="localePath('/')" class="error__button error__button--primary" @click="() => clearError()">
          {{ $t('common.glavnuyu') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/account/orders')" class="error__button" @click="() => clearError()">
          {{ $t('breadcrumbs.orders') }}
        </NuxtLink>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.error {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.error__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-block: 120px;
  text-align: center;
}

.error__code {
  margin: 0;
  font-weight: 800;
  font-size: 96px;
  line-height: 1;
  color: var(--color-brand);
}

.error__title {
  margin: 24px 0 0;
  font-weight: 700;
  font-size: 31.3px;
  line-height: 37.5px;
  color: #000000;
}

.error__text {
  max-width: 511px;
  margin: 6.3px 0 0;
  font-weight: 400;
  font-size: 18.8px;
  line-height: 24.4px;
  color: #7C8A94;
}

.error__actions { display: flex; gap: 36px; margin-top: 33.9px; }

.error__button {
  display: grid;
  place-items: center;
  width: 237.5px;
  height: 50px;
  border-radius: 13.9px;
  background: #D8DED9;
  font-weight: 500;
  font-size: 16.7px;
  color: #000000;
}

.error__button--primary { background: var(--color-brand); color: var(--color-surface); }
.error__button:hover { filter: brightness(.96); }
</style>
