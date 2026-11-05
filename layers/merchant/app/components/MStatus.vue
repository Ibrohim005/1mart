<script setup lang="ts">
/**
 * Статус-бейдж. Цвет задаётся тоном, а не переведённой строкой — ветвиться по
 * тексту в этом проекте уже ломалось (CLAUDE.md). Подпись приходит слотом.
 * Палитра тонов — семантические семейства из business.css.
 */
withDefaults(defineProps<{
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}>(), { tone: 'neutral' })
</script>

<template>
  <span class="mstatus" :class="`mstatus--${tone}`">
    <span class="mstatus__dot" />
    <slot />
  </span>
</template>

<style scoped>
.mstatus {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 26px;
  padding-inline: 11px;
  border-radius: var(--m-radius-pill);
  font-size: var(--text-xs);
  font-weight: 600;
  white-space: nowrap;
}
.mstatus__dot { width: 7px; height: 7px; border-radius: 50%; background: currentcolor; }
.mstatus--success { background: var(--m-success-bg); color: var(--m-success-fg); }
.mstatus--warning { background: var(--m-warning-bg); color: var(--m-warning-fg); }
.mstatus--danger { background: var(--m-danger-bg); color: var(--m-danger-fg); }
.mstatus--info { background: var(--m-info-bg); color: var(--m-info-fg); }
.mstatus--neutral { background: var(--m-surface-sunken); color: var(--m-slate); }
</style>
