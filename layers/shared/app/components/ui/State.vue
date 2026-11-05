<script setup lang="ts">
/**
 * Состояния динамических блоков: загрузка, ошибка, пусто.
 * В макете их нет — собраны в UI-системе проекта (те же радиусы, цвета и кнопки).
 */
defineProps<{
  status: 'idle' | 'pending' | 'success' | 'error'
  empty?: boolean
  /** Сколько карточек-скелетонов показывать */
  skeletons?: number
  emptyTitle?: string
  emptyText?: string
  /** Картинка из макета 5141:135876 и кнопка сброса фильтров */
  emptyIllustration?: string
  resetLabel?: string
}>()

const emit = defineEmits<{ retry: [], reset: [] }>()
</script>

<template>
  <div v-if="status === 'pending'" class="state state--loading" aria-busy="true" aria-live="polite">
    <span class="visually-hidden">{{ $t('ui.shared.state.loading') }}</span>
    <UiProductCardSkeleton v-for="n in (skeletons ?? 5)" :key="n" />
  </div>

  <div v-else-if="status === 'error'" class="state state--error" role="alert">
    <p class="state__title">{{ $t('ui.shared.state.udalosZagruzit') }}</p>
    <p class="state__text">{{ $t('ui.shared.state.proverteSoedineniePoprobuyteEsche') }}</p>
    <button type="button" class="state__retry" @click="emit('retry')">{{ $t('common.retry') }}</button>
  </div>

  <div v-else-if="empty" class="state state--empty">
    <img v-if="emptyIllustration" :src="emptyIllustration" alt="" width="263.5" height="263.5" class="state__illustration">
    <p class="state__title">{{ emptyTitle ?? $t('common.zdesPokaPusto') }}</p>
    <p v-if="emptyText" class="state__text">{{ emptyText }}</p>
    <!-- Место под подсказку «возможно, вы искали» и прочие уточнения пустой выдачи -->
    <slot name="empty-extra" />
    <button v-if="resetLabel" type="button" class="state__reset" @click="emit('reset')">{{ resetLabel }}</button>
  </div>

  <slot v-else />
</template>

<style scoped>
/* Пусто по фильтрам. Макет 5141:135876: картинка 263.5, заголовок 31.3/700,
   текст 18.8/400 #7C8A94, кнопка сброса 511×50 r13.9 на #D8DED9 */
.state--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-block: 40px;
  text-align: center;
}

.state__illustration {
  width: 263.5px;
  height: 263.5px;
  margin-bottom: 35.9px;
  object-fit: contain;
}

.state--empty .state__title {
  max-width: 511px;
  margin: 0;
  font-weight: 700;
  font-size: var(--text-9xl);
  line-height: 37.5px;
  color: #000000;
}

.state--empty .state__text {
  max-width: 511px;
  margin: 6.3px 0 0;
  font-weight: 400;
  font-size: var(--text-xl);
  line-height: 24.4px;
  color: #7C8A94;
}

.state__reset {
  width: 511px;
  margin-top: 35.9px;
  border: 0;
  background: #D8DED9;
  color: #000000;
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.state__reset:hover { background: #CBD2CC; }

.state--loading {
  display: grid;
  grid-template-columns: repeat(var(--columns, 5), 1fr);
  gap: 12px;
}



.state--error,
.state--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  border-radius: 20px;
  background: var(--color-surface);
  text-align: center;
}

.state__title {
  margin: 0;
  font-weight: 700;
  font-size: var(--text-3xl);
  line-height: 28px;
  color: #101010;
}

.state__text {
  margin: 8px 0 0;
  font-weight: 400;
  font-size: var(--text-xl);
  line-height: 24px;
  color: #7C8A94;
}

.state__retry {
  margin-top: 20px;
  padding-inline: 32px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.state__retry:hover { filter: brightness(.96); }
</style>
