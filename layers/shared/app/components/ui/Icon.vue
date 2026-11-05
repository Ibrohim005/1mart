<script setup lang="ts">
/**
 * Иконка из макета. Все SVG выгружены из Figma и лежат
 * в layers/shared/app/assets/icons — рисованных вручную нет.
 *
 * SVG подставляется инлайном, а не через <img src>: часть иконок
 * выгрузилась из Figma белой (они лежали на цветной подложке),
 * и на светлом фоне их не видно. Пропс `color` перекрашивает
 * белую заливку и обводку, не трогая многоцветные иконки.
 */
const props = defineProps<{
  name: string
  size?: number
  width?: number
  height?: number
  /** Чем заменить белый цвет исходной выгрузки */
  color?: string
}>()

const sources = import.meta.glob('../../assets/icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const markup = computed(() => {
  const entry = Object.entries(sources).find(([path]) => path.endsWith(`/${props.name}.svg`))
  if (!entry)
    return ''

  const width = props.width ?? props.size ?? 24
  const height = props.height ?? props.size ?? 24

  let svg = entry[1].replace(
    /<svg\b[^>]*>/,
    tag => tag
      .replace(/\s(?:width|height)="[^"]*"/g, '')
      .replace('<svg', `<svg width="${width}" height="${height}"`),
  )

  /*
   * Одноцветные иконки рисуются через currentColor, поэтому цвет достаточно
   * задать стилем. Замена строкой оставлена для иконок, где цвет зашит:
   * у шагов заказа он был #7C8A94, и белый на зелёной плитке не применялся —
   * иконки оставались серыми.
   */
  if (props.color)
    svg = svg.replace(/(fill|stroke)="(?:white|#fff|#ffffff)"/gi, `$1="${props.color}"`)

  return svg
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- разметка из собственных ассетов -->
  <span v-if="markup" class="icon" :style="color ? { color } : undefined" aria-hidden="true" v-html="markup" />
</template>

<style scoped>
.icon { display: block; flex: 0 0 auto; line-height: 0; }
.icon :deep(svg) { display: block; }
</style>
