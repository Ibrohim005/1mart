<script setup lang="ts">
/**
 * Галерея карточки товара.
 * Узкая колонка превью и крупное квадратное фото: товар виден целиком,
 * а скидку показывает блок с ценой рядом.
 */
import type { Id, ProductImage } from '#shared/types/catalog'

const props = defineProps<{
  productId: Id
  images: ProductImage[]
  title: string
  hasVideo?: boolean
}>()

const activeIndex = ref(0)
const active = computed(() => props.images[activeIndex.value])

/**
 * Ссылка на фото может быть в данных, а файла за ней нет (товар завели
 * скриптом, файл потеряли при переносе). Битый <img> рисует иконку сломанного
 * файла и alt-текст — страница выглядит сломанной. Помечаем упавшие ссылки и
 * показываем вместо них ту же плашку «фото пока нет», что и при пустом списке.
 */
const failedUrls = reactive(new Set<string>())
const activeBroken = computed(() => !!active.value && failedUrls.has(active.value.url))

/**
 * Страница приходит с сервера, и битая картинка успевает упасть ДО гидратации —
 * событие error к этому моменту уже отгремело, слушатель его не застаёт.
 * Поэтому на монтировании смотрим на сам <img>: complete при naturalWidth 0 —
 * это и есть упавшая загрузка. Свежие падения после гидратации ловит @error.
 */
/** Фото, которые уже загрузились: пока URL здесь нет — на месте снимка скелетон */
const loadedUrls = reactive(new Set<string>())

function checkImg(el: unknown, url: string) {
  const node = (el && typeof el === 'object' && '$el' in el ? (el as { $el: unknown }).$el : el) as HTMLImageElement | null
  if (node?.complete && node.naturalWidth === 0) failedUrls.add(url)
  // Из кеша картинка приходит уже готовой, и событие load не срабатывает
  if (node?.complete && node.naturalWidth > 0) loadedUrls.add(url)
}
// Настоящее избранное, не локальный ref: см. useFavorite.
const { isFavorite, toggle: toggleFavorite } = useFavorite(() => props.productId)

// Просмотр фото во весь экран — по клику на главное фото
const zoomed = ref(false)

/**
 * Видео товара. Пока показываем демо-ролик из фотографий.
 * TODO: Connect to backend endpoint — подставить product.videoUrl
 */
const videoOpen = ref(false)
const demoVideo = '/mock/demo-product.mp4'

// Колесо мыши листает фото, чтобы не тянуться к стрелкам
function onWheel(event: WheelEvent) {
  if (Math.abs(event.deltaY) < 8) return
  event.preventDefault()
  if (event.deltaY > 0) next()
  else prev()
}

// Esc, блокировку фона и возврат фокуса берёт useDialog; здесь только стрелки
function onKey(event: KeyboardEvent) {
  if (!zoomed.value) return
  if (event.key === 'ArrowRight') next()
  if (event.key === 'ArrowLeft') prev()
}

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))

const zoomPanel = ref<HTMLElement | null>(null)
const videoPanel = ref<HTMLElement | null>(null)
useDialog(zoomed, { panel: zoomPanel, onClose: () => (zoomed.value = false) })
useDialog(videoOpen, { panel: videoPanel, onClose: () => (videoOpen.value = false) })

function prev() {
  activeIndex.value = (activeIndex.value - 1 + props.images.length) % props.images.length
}

function next() {
  activeIndex.value = (activeIndex.value + 1) % props.images.length
}
</script>

<template>
  <div class="gallery">
    <div class="gallery__thumbs">
      <button
        v-for="(image, index) in images"
        :key="image.id"
        type="button"
        class="gallery__thumb"
        :class="{ 'gallery__thumb--active': index === activeIndex }"
        :aria-current="index === activeIndex"
        @mouseenter="activeIndex = index"
        @click="activeIndex = index"
      >
        <span v-if="failedUrls.has(image.url)" class="gallery__thumb-blank">
          <UiIcon name="camera" :size="28" />
        </span>
        <NuxtImg v-else :ref="(el) => checkImg(el, image.url)" :src="image.url" :alt="image.alt ?? title" width="72" height="72" class="gallery__thumb-image" :class="{ 'gallery__skeleton': !loadedUrls.has(image.url) }" @load="loadedUrls.add(image.url)" @error="failedUrls.add(image.url)" />
      </button>
    </div>

    <div class="gallery__main" @wheel="onWheel">
      <!--
        Товар без фото — обычный случай, а не край: продавец заводит карточку
        и загружает снимки позже. Раньше при пустом списке внутри не
        рисовалось НИЧЕГО, и оставалась пустая белая область 539×696 —
        страница выглядела сломанной, а не «фото пока нет».
      -->
      <div v-if="!active || activeBroken" class="gallery__blank">
        <UiIcon name="camera" :size="56" />
        <p class="gallery__blank-text">{{ $t('ui.pdp.gallery.noPhoto') }}</p>
      </div>

      <NuxtImg
        v-else
        :key="active.url"
        :ref="(el) => checkImg(el, active!.url)"
        :src="active.url"
        :alt="active.alt ?? title"
        preset="productGallery"
        preload
        fetchpriority="high"
        loading="eager"
        class="gallery__image"
        :class="{ 'gallery__skeleton': !loadedUrls.has(active.url) }"
        @load="loadedUrls.add(active!.url)"
        @click="zoomed = true"
        @error="failedUrls.add(active.url)"
      />

      <button v-if="hasVideo" type="button" class="gallery__video" @click="videoOpen = true">
        <span class="gallery__video-play"><UiIcon name="play" :size="18.2" /></span>
        <span class="gallery__video-text">{{ $t('ui.pdp.gallery.smotretVideo') }}</span>
      </button>

      <button
        type="button"
        class="gallery__favorite"
        :class="{ 'gallery__favorite--active': isFavorite }"
        :aria-pressed="isFavorite"
        :aria-label="$t('cart.toFavorites')"
        @click="toggleFavorite"
      >
        <UiIcon :name="isFavorite ? 'heart-fill' : 'heart'" :size="22" />
      </button>

      <button v-if="images.length > 1" type="button" class="gallery__arrow gallery__arrow--prev" :aria-label="$t('ui.pdp.gallery.predyduscheeFoto')" @click="prev"><UiIcon name="alt-arrow-right" color="currentColor" :size="18" class="gallery__arrow-icon gallery__arrow-icon--flip" /></button>
      <button v-if="images.length > 1" type="button" class="gallery__arrow gallery__arrow--next" :aria-label="$t('ui.pdp.gallery.sleduyuscheeFoto')" @click="next"><UiIcon name="alt-arrow-right" color="currentColor" :size="18" /></button>

    </div>

    <Teleport to="body">
      <div v-if="zoomed && active" ref="zoomPanel" class="gallery__lightbox" role="dialog" aria-modal="true" :aria-label="$t('ui.pdp.gallery.fotoTovara')" tabindex="-1" @click.self="zoomed = false" @wheel.prevent="onWheel">
        <figure class="gallery__lightbox-figure">
          <img :key="active.url" :src="active.url" :alt="active.alt ?? title" class="gallery__lightbox-image gallery__skeleton" @load="($event.target as HTMLImageElement).classList.remove('gallery__skeleton')">

          <button type="button" class="gallery__lightbox-close" :aria-label="$t('common.close')" @click.stop="zoomed = false">
            <UiIcon name="close" color="#FFFFFF" :size="22" />
          </button>

          <button type="button" class="gallery__lightbox-arrow gallery__lightbox-arrow--prev" :aria-label="$t('ui.pdp.gallery.predyduscheeFoto')" @click.stop="prev">
            <UiIcon name="alt-arrow-right" color="#FFFFFF" :size="22" class="gallery__arrow-icon--flip" />
          </button>

          <button type="button" class="gallery__lightbox-arrow gallery__lightbox-arrow--next" :aria-label="$t('ui.pdp.gallery.sleduyuscheeFoto')" @click.stop="next">
            <UiIcon name="alt-arrow-right" color="#FFFFFF" :size="22" />
          </button>

          <figcaption class="gallery__lightbox-counter">{{ activeIndex + 1 }} / {{ images.length }}</figcaption>
        </figure>
      </div>

      <div v-if="videoOpen" ref="videoPanel" class="gallery__lightbox" role="dialog" aria-modal="true" :aria-label="$t('ui.pdp.gallery.videoTovare')" tabindex="-1" @click.self="videoOpen = false">
        <div class="gallery__lightbox-figure">
          <button type="button" class="gallery__lightbox-close" :aria-label="$t('common.close')" @click.stop="videoOpen = false">
            <UiIcon name="close" color="#FFFFFF" :size="22" />
          </button>

          <video
            class="gallery__video-player"
            :poster="active?.url"
            :src="demoVideo"
            controls
            autoplay
            playsinline
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.gallery { display: flex; gap: 12px; }

.gallery__image { cursor: zoom-in; }

.gallery__thumb--active { outline: 2px solid var(--color-brand); outline-offset: -2px; }

/* Оверлей должен накрывать всю раскладку: у body min-width 1440,
   поэтому fixed-элемент растягиваем минимум на ту же ширину. */
.gallery__lightbox {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  min-width: 1440px;
  padding: 72px 96px;
  background: rgb(0 0 0 / 80%);
  cursor: zoom-out;
}

/* Стрелки и счётчик прижаты к самому снимку, а не к краям экрана */
.gallery__lightbox-figure {
  position: relative;
  margin: 0;
  line-height: 0;
}

.gallery__lightbox-image {
  max-width: min(1040px, calc(100vw - 260px));
  max-height: calc(100vh - 144px);
  border-radius: 18px;
  object-fit: contain;
  cursor: default;
}

.gallery__video-player {
  width: min(1040px, calc(100vw - 200px));
  max-height: calc(100vh - 144px);
  border-radius: 18px;
  background: #000;
  cursor: default;
}

/* Крестик висит на самом снимке, а не в углу экрана: на широком мониторе
   до угла окна мышь ехала через весь экран мимо фотографии. */
.gallery__lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: rgb(255 255 255 / 15%);
  cursor: pointer;
}

.gallery__lightbox-close { background: rgb(0 0 0 / 45%); }
.gallery__lightbox-close:hover { background: rgb(0 0 0 / 65%); }

.gallery__lightbox-arrow {
  position: absolute;
  top: 50%;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 50%;
  background: rgb(0 0 0 / 45%);
  transform: translateY(-50%);
  cursor: pointer;
}

.gallery__lightbox-arrow--prev { left: 16px; }
.gallery__lightbox-arrow--next { right: 16px; }

.gallery__lightbox-arrow:hover { background: rgb(0 0 0 / 65%); }

.gallery__lightbox-counter {
  position: absolute;
  bottom: 16px;
  left: 50%;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgb(0 0 0 / 45%);
  font-weight: 600;
  font-size: var(--text-sm);
  line-height: 20px;
  color: #FFFFFF;
  transform: translateX(-50%);
}

.gallery__thumbs {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 8px;
  width: 72px;
  max-height: 656px;
  overflow-y: auto;
  scrollbar-width: none;
}

.gallery__thumb {
  position: relative;
  flex: none;
  height: 72px;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: #F4F5F7;
  overflow: hidden;
  cursor: pointer;
}

.gallery__thumb-image { width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply; }

/* Превью с битой ссылкой — та же серая плашка, что и главное «фото пока нет» */
.gallery__thumb-blank {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  background: #F2F4F7;
  color: #98A2B3;
}

.gallery__main {
  position: relative;
  width: 656px;
  height: 656px;
  border-radius: 24px;
  background: #F4F5F7;
  overflow: hidden;
}

/* Товар виден целиком: при cover у вытянутых снимков обрезались края */
.gallery__image { width: 100%; height: 100%; padding: 32px; object-fit: contain; mix-blend-mode: multiply; }

/* Занимает ровно то же место, что и снимок, и центрирует содержимое —
   иначе соседняя колонка «поднимается» и вёрстка едет. */
.gallery__blank {
  /* Не 696px: пустой блок в полный рост снимка — это дыра в странице.
     Высоту секции и так задаёт правая колонка с ценой и кнопками. */
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 100%;
  background: #F2F4F7;
  color: #98A2B3;
}

/* Карточка без снимка перестаёт держать фиксированную высоту и садится
   по содержимому — иначе min-height выше ничего не меняет. */
.gallery__main:has(.gallery__blank) { height: auto; }
.gallery__blank-text { margin: 0; font-size: 15px; }

.gallery__video {
  position: absolute;
  top: 15px;
  left: 17.1px;
  display: flex;
  align-items: center;
  gap: 6.1px;
  height: 38px;
  padding: 3.8px;
  border: 0;
  border-radius: 22.8px;
  background: var(--color-surface);
  cursor: pointer;
}

.gallery__video-play {
  display: grid;
  place-items: center;
  width: 30.4px;
  height: 30.4px;
  border-radius: 45.6px;
  background: #6BF57C;
}

.gallery__video-text {
  padding-right: 8px;
  font-weight: 600;
  font-size: var(--text-2xs);
  line-height: 14.5px;
  color: #454545;
}

.gallery__favorite {
  position: absolute;
  top: 15px;
  right: 15px;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 0;
  border-radius: 25px;
  background: rgb(255 255 255 / 85%);
  color: var(--color-navy);
  cursor: pointer;
  transition: color 0.15s ease;
}

.gallery__favorite:hover,
.gallery__favorite--active { color: var(--color-brand-text); }

.gallery__arrow {
  position: absolute;
  top: 50%;
  margin-top: -15px;
  display: grid;
  place-items: center;
  width: 30.3px;
  height: 30.3px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgb(255 255 255 / 80%);
  font-size: var(--text-xl);
  line-height: 1;
  color: #1F2026;
  cursor: pointer;
}

.gallery__arrow--prev { left: 23.6px; }
.gallery__arrow-icon--flip { transform: rotate(180deg); }
.gallery__arrow--next { right: 23.6px; }

/* Скелетон загрузки — фон самого <img>, как в UiImage: загруженное фото его закрывает */
.gallery__skeleton {
  background: linear-gradient(90deg, var(--skeleton-base) 25%, var(--skeleton-shine) 37%, var(--skeleton-base) 63%);
  background-size: 400% 100%;
  animation: gallery-shimmer 1.4s ease infinite;
}

@keyframes gallery-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
}

@media (prefers-reduced-motion: reduce) {
  .gallery__skeleton { animation: none; }
}
</style>
