<script setup lang="ts">
/** Лента подтверждений в правом нижнем углу. */
const { items, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toasts" role="status" aria-live="polite">
      <TransitionGroup name="toast">
        <button
          v-for="toast in items"
          :key="toast.id"
          type="button"
          class="toast"
          :class="`toast--${toast.kind}`"
          @click="dismiss(toast.id)"
        >
          <UiIcon :name="toast.kind === 'success' ? 'tick-circle-fill' : 'close'" color="#FFFFFF" :size="toast.kind === 'success' ? 20 : 16" />
          <span>{{ toast.text }}</span>

          <span
            v-if="toast.undo"
            class="toast__undo"
            role="button"
            tabindex="0"
            @click.stop="toast.undo.run(); dismiss(toast.id)"
            @keydown.enter.stop.prevent="toast.undo.run(); dismiss(toast.id)"
          >{{ toast.undo.label }}</span>
        </button>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/* Отмена необратимого действия — подчёркнутой ссылкой внутри подтверждения */
/* Цель нажатия не меньше 24px по WCAG 2.5.8 — была 63×19 */
.toast__undo {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  margin-left: 4px;
  padding-inline: 6px;
  border-radius: 6px;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.toast__undo:hover { background: rgb(255 255 255 / 30%); }

.toasts {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 400;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border: 0;
  border-radius: 14px;
  font-weight: 500;
  font-size: var(--text-md);
  color: var(--color-surface);
  box-shadow: 0 12px 30px rgb(31 32 38 / 22%);
  cursor: pointer;
  pointer-events: auto;
}

.toast--success { background: var(--color-brand); color: var(--color-on-brand); }
.toast--error { background: var(--color-danger); }

.toast-enter-active,
.toast-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }

.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
