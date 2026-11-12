<script setup lang="ts">
/**
 * Базовое модальное окно.
 * Макет: экраны SIng / Card / Location / Procode — затемнение #525252 60%
 * и белая панель 586 с радиусом 30, заголовок Inter 700 27.1/32.8.
 */
const props = defineProps<{
  modelValue: boolean
  title: string
  /** Скрыть шапку — у диалогов результата оплаты её нет */
  hideHeader?: boolean
  /**
   * Внутренние поля тела. В макете они у каждого окна свои — 20, 23, 25, 31, —
   * поэтому значение задаётся окном, а не одним общим числом.
   */
  bodyPadding?: string
  /** Ширина панели, если содержимому тесно в стандартных 586 (формы кабинета компании) */
  width?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

function close() {
  emit('update:modelValue', false)
}

// Esc, ловушка фокуса, блокировка фона и возврат фокуса — общие для всех диалогов
const panel = ref<HTMLElement | null>(null)
useDialog(toRef(props, 'modelValue'), { panel, onClose: close })
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="close">
      <div
        ref="panel"
        class="dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
        :style="{ ...(bodyPadding ? { '--dialog-body-padding': bodyPadding } : {}), ...(width ? { '--dialog-width': width } : {}) }"
      >
        <header v-if="!hideHeader" class="dialog__header">
          <h2 class="dialog__title">{{ title }}</h2>
          <UiCloseButton @click="close" />
        </header>

        <div class="dialog__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="dialog__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: var(--overlay-z);
  display: grid;
  place-items: center;
  background: var(--overlay-bg);
}

.dialog {
  width: var(--dialog-width);
  /* Высокая форма не уходит за край экрана, а прокручивается внутри окна */
  max-height: calc(100vh - 48px);
  outline: none;
  border-radius: var(--dialog-radius);
  background: var(--color-surface);
  overflow-y: auto;
}

.dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--dialog-padding) 23px 0;
}

.dialog__title {
  margin: 0;
  font: var(--type-dialog-title);
  color: var(--color-text);
}


.dialog__body { padding: var(--dialog-body-padding, 20px); }

.dialog__footer {
  padding: 20px 16px;
  border-top: 1px solid #EBEFF2;
}
</style>
