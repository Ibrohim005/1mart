<script setup lang="ts">
/**
 * Плитка KPI: подпись, крупное число и изменение к прошлому периоду.
 * Число — класс .m-metric (Rubik, табличные знаки, плотный трекинг): именно это
 * читается как «спроектировано». Иконка-чип и дельта-пилюля красятся тоном.
 */
const props = withDefaults(defineProps<{
  label: string
  value: string
  icon?: string
  /** Изменение в процентах; null — скрыть */
  deltaPct?: number | null
  /** Для метрик, где рост — это плохо (например, отказы), инвертирует цвет */
  invert?: boolean
  /** Цвет иконки-чипа */
  tone?: 'brand' | 'info' | 'violet' | 'warning' | 'success' | 'accent'
}>(), { deltaPct: null, invert: false, tone: 'brand' })

const deltaTone = computed(() => {
  if (props.deltaPct === null || props.deltaPct === 0) return 'flat'
  const positive = props.deltaPct > 0
  return (props.invert ? !positive : positive) ? 'up' : 'down'
})
const deltaText = computed(() =>
  props.deltaPct === null ? '' : `${props.deltaPct > 0 ? '+' : ''}${props.deltaPct}%`)
</script>

<template>
  <div class="mstat">
    <div class="mstat__top">
      <span class="mstat__label">{{ label }}</span>
      <span v-if="icon" class="mstat__icon" :class="`mstat__icon--${tone}`"><UiIcon :name="icon" :size="18" /></span>
    </div>
    <div class="mstat__value m-metric">{{ value }}</div>
    <div v-if="deltaPct !== null" class="mstat__delta" :class="`mstat__delta--${deltaTone}`">
      <UiIcon v-if="deltaTone !== 'flat'" :name="deltaTone === 'up' ? 'alt-arrow-up' : 'alt-arrow-down'" :size="13" color="currentColor" />
      <span class="m-tnum">{{ deltaText }}</span>
      <span class="mstat__delta-note">{{ $t('m.dashboard.vsPrev') }}</span>
    </div>
  </div>
</template>

<style scoped>
.mstat {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 22px;
  overflow: hidden;
  border: 1px solid var(--m-line);
  border-radius: var(--m-radius-lg);
  background: var(--m-surface);
  box-shadow: var(--m-shadow-sm);
  transition: box-shadow var(--m-dur) var(--m-ease), transform var(--m-dur) var(--m-ease);
}
/* Тонкая бирюзовая «подсветка» сверху — фирменная деталь, не крикливая */
.mstat::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  background: var(--m-brand-gradient);
  opacity: 0;
  transition: opacity var(--m-dur) var(--m-ease);
}
.mstat:hover {
  transform: translateY(-2px);
  box-shadow: var(--m-shadow-md);
}
.mstat:hover::before { opacity: 1; }

.mstat__top { display: flex; align-items: center; justify-content: space-between; }
.mstat__label { font-size: var(--text-sm); font-weight: 500; color: var(--m-slate); }
.mstat__icon {
  display: grid;
  width: 36px;
  height: 36px;
  border-radius: var(--m-radius-sm);
  place-items: center;
}
.mstat__icon--brand { background: var(--m-brand-tint); color: var(--m-brand-strong); }
.mstat__icon--info { background: var(--m-info-bg); color: var(--m-info-fg); }
.mstat__icon--violet { background: var(--m-violet-bg); color: var(--m-violet-fg); }
.mstat__icon--warning { background: var(--m-warning-bg); color: var(--m-warning-fg); }
.mstat__icon--success { background: var(--m-success-bg); color: var(--m-success-fg); }
.mstat__icon--accent { background: var(--m-accent-bg); color: var(--m-accent-fg); }

.mstat__value { font-size: var(--text-3xl); line-height: 1.15; white-space: nowrap; }

.mstat__delta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  align-self: flex-start;
  height: 24px;
  padding-inline: 9px;
  border-radius: var(--m-radius-pill);
  font-size: var(--text-xs);
  font-weight: 600;
  white-space: nowrap;
}
.mstat__delta--up { background: var(--m-success-bg); color: var(--m-success-fg); }
.mstat__delta--down { background: var(--m-danger-bg); color: var(--m-danger-fg); }
.mstat__delta--flat { background: var(--m-surface-sunken); color: var(--m-slate); }
.mstat__delta-note { margin-left: 5px; font-weight: 500; opacity: 0.72; }
</style>
