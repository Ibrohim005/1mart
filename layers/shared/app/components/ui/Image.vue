<script setup lang="ts">
/**
 * Картинка с запасным вариантом. У битой ссылки браузер рисует иконку
 * «сломанного файла» — вместо неё показываем ровную серую плашку, чтобы
 * вёрстка не разъезжалась и карточка не выглядела поломанной.
 *
 * Пока фото не пришло, на его месте бежит скелетон: место под картинку
 * занято с первой отрисовки, поэтому сетка не дёргается, а пустой
 * прямоугольник не выглядит поломанной карточкой.
 */
const props = withDefaults(defineProps<{
  src: string
  alt?: string
  width?: number | string
  height?: number | string
  /** Чем заменить, если картинка не загрузилась */
  fallback?: string
}>(), {
  alt: '',
  width: undefined,
  height: undefined,
  fallback: '/mock/empty-filters.svg',
})

const failed = ref(false)
const loaded = ref(false)

const image = useTemplateRef<{ $el?: HTMLImageElement } | HTMLImageElement>('image')

watch(() => props.src, () => {
  failed.value = false
  loaded.value = false
})

/**
 * Картинка из кеша браузера успевает отрисоваться до гидратации, и события
 * `load` уже не будет — тогда скелетон остался бы под ней навсегда.
 * Начальное значение одинаковое на сервере и в браузере, поэтому разметка
 * при гидратации не расходится.
 */
onMounted(() => {
  const node = (image.value && '$el' in image.value ? image.value.$el : image.value) as HTMLImageElement | undefined
  if (!node?.complete) return
  // complete при нулевой ширине — загрузка уже упала, события error не будет
  if (node.naturalWidth === 0) failed.value = true
  else loaded.value = true
})
</script>

<template>
  <NuxtImg
    v-if="!failed"
    ref="image"
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :class="{ 'image--loading': !loaded }"
    @load="loaded = true"
    @error="failed = true"
  />
  <img
    v-else
    :src="fallback"
    :alt="alt"
    :width="width"
    :height="height"
    class="image-fallback"
  >
</template>

<style scoped>
.image-fallback {
  background: var(--color-page);
  object-fit: contain;
}

/* Скелетон — фон самого <img>: обёртки нет, поэтому размеры и object-fit
   задаёт вызывающий компонент, как и раньше. Загруженное фото его закрывает. */
.image--loading {
  background: linear-gradient(
    90deg,
    var(--skeleton-base) 25%,
    var(--skeleton-shine) 37%,
    var(--skeleton-base) 63%
  );
  background-size: 400% 100%;
  animation: image-shimmer 1.4s ease infinite;
}

@keyframes image-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
}

@media (prefers-reduced-motion: reduce) {
  .image--loading { animation: none; }
}
</style>
