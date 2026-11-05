<script setup lang="ts">
/**
 * Столбчатый график без внешних библиотек: инлайновый SVG, тянется по ширине.
 * Тонкие горизонтальные линии сетки, фирменный градиент в столбцах, скруглённая
 * вершина и «прорастание» столбцов при появлении (уважает prefers-reduced-motion).
 */
const props = defineProps<{
  points: { label: string, value: number }[]
}>()

const W = 720
const H = 240
const PAD = { top: 16, right: 4, bottom: 28, left: 4 }

const max = computed(() => Math.max(1, ...props.points.map(p => p.value)))
const bandWidth = computed(() => (W - PAD.left - PAD.right) / Math.max(1, props.points.length))
const barWidth = computed(() => Math.min(30, bandWidth.value * 0.56))
const usable = H - PAD.top - PAD.bottom

/** Четыре линии сетки: 0 / 25 / 50 / 75 / 100 % высоты. */
const gridLines = [0, 0.25, 0.5, 0.75, 1].map(f => PAD.top + usable * f)

function barHeight(v: number) {
  return Math.max(2, (v / max.value) * usable)
}
</script>

<template>
  <div class="mchart">
    <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="mchart__svg" role="img">
      <defs>
        <linearGradient id="mchartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--m-brand-bright)" />
          <stop offset="100%" stop-color="var(--m-brand-strong)" />
        </linearGradient>
      </defs>

      <!-- сетка -->
      <line
        v-for="(y, i) in gridLines"
        :key="`g${i}`"
        :x1="PAD.left" :x2="W - PAD.right"
        :y1="y" :y2="y"
        class="mchart__grid"
        :class="{ 'mchart__grid--base': i === gridLines.length - 1 }"
      />

      <!-- столбцы -->
      <g v-for="(p, i) in points" :key="i">
        <rect
          :x="PAD.left + i * bandWidth + (bandWidth - barWidth) / 2"
          :y="H - PAD.bottom - barHeight(p.value)"
          :width="barWidth"
          :height="barHeight(p.value)"
          rx="6"
          class="mchart__bar"
          :style="{ animationDelay: `${i * 35}ms` }"
        >
          <title>{{ p.label }}: {{ p.value.toLocaleString('ru-RU') }}</title>
        </rect>
        <text
          v-if="i % 2 === 0"
          :x="PAD.left + i * bandWidth + bandWidth / 2"
          :y="H - 9"
          text-anchor="middle"
          class="mchart__tick"
        >{{ p.label }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.mchart { width: 100%; }
.mchart__svg { display: block; width: 100%; height: 240px; overflow: visible; }

.mchart__grid { stroke: var(--m-line-soft); stroke-width: 1; }
.mchart__grid--base { stroke: var(--m-line-strong); }

.mchart__bar {
  fill: url(#mchartFill);
  transform-box: fill-box;
  transform-origin: bottom;
  animation: m-grow 0.6s var(--m-ease) both;
  transition: opacity var(--m-dur-fast) var(--m-ease);
}
.mchart__svg:hover .mchart__bar { opacity: 0.45; }
.mchart__svg:hover .mchart__bar:hover { opacity: 1; }

.mchart__tick {
  font-size: 11px;
  fill: var(--m-slate-soft);
  font-family: var(--font-ui);
  font-variant-numeric: tabular-nums;
}

@keyframes m-grow {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
@media (prefers-reduced-motion: reduce) {
  .mchart__bar { animation: none; }
}
</style>
