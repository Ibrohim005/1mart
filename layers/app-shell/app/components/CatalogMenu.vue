<script setup lang="ts">
/**
 * Выпадающий каталог по кнопке «Каталог» и «Ещё» — раскладка Uzum Market:
 * слева список корневых разделов с картинками, справа подкатегории
 * раздела под курсором в несколько колонок. Если у подкатегории есть свои
 * дети, она становится заголовком группы, а дети идут ссылками под ней.
 *
 * Данные: GET /categories/root (в моках отдаются вместе с children).
 * Ключ общий со строкой категорий в шапке — повторного запроса нет.
 *
 * Справа живое превью: популярные товары раздела или подкатегории под
 * курсором. Запрашиваются только в браузере и при наведении, а ответ на
 * устаревшее наведение отбрасывается.
 */
import type { Category, Id, ProductCard, SearchResult } from '#shared/types/catalog'

const props = defineProps<{
  /** Раздел, с которого открыть панель: наведение на строку категорий в шапке */
  rootSlug?: string | null
}>()
const emit = defineEmits<{ close: [], panelEnter: [], panelLeave: [] }>()
const localePath = useLocalePath()
const { locale } = useI18n()
const { money } = useMoney()
const api = useApi()

const { data: categories } = await useApiData<Category[]>('catalog-menu', '/categories/root')

/** Сводная «Все» — не раздел каталога, а ссылка на всю выдачу */
const roots = computed(() => (categories.value ?? []).filter(item => item.slug !== 'vse'))

const activeId = ref<Id | null>(null)
const active = computed(() =>
  roots.value.find(item => item.id === activeId.value) ?? roots.value[0],
)

watch([() => props.rootSlug, roots], () => {
  const picked = roots.value.find(item => item.slug === props.rootSlug)
  if (picked) activeId.value = picked.id
  else if (activeId.value === null && roots.value.length) activeId.value = roots.value[0]!.id
}, { immediate: true })

/*
 * Смена раздела с задержкой: пока мышь идёт по диагонали к подкатегориям или
 * товарам, она пересекает соседние разделы, и панель не должна за ними прыгать.
 */
let rootTimer: ReturnType<typeof setTimeout> | undefined
function hoverRoot(id: Id) {
  clearTimeout(rootTimer)
  rootTimer = setTimeout(() => { activeId.value = id }, 90)
}

const PREVIEW_SIZE = 3
/** null - идёт загрузка */
const preview = ref<ProductCard[] | null>(null)
const previewTitle = ref('')
const previewCache = new Map<string, ProductCard[]>()
let previewTimer: ReturnType<typeof setTimeout> | undefined
let previewTicket = 0

async function loadPreview(category: Category) {
  clearTimeout(previewTimer)
  const ticket = ++previewTicket
  previewTitle.value = category.title

  // Слаги переводятся, поэтому язык входит в ключ
  const key = `${locale.value}:${category.slug}`
  const cached = previewCache.get(key)
  if (cached) {
    preview.value = cached
    return
  }

  preview.value = null
  try {
    const found = await api.get<SearchResult>('/search', {
      categorySlug: category.slug,
      page: 1,
      // С запасом: товары не в наличии в превью не показываем
      perPage: PREVIEW_SIZE * 3,
      sort: 'popular',
    })
    const items = (found?.items ?? []).filter(item => item.available).slice(0, PREVIEW_SIZE)
    previewCache.set(key, items)
    if (ticket === previewTicket) preview.value = items
  }
  catch {
    // Превью - удобство: без него ссылки каталога работают
    if (ticket === previewTicket) preview.value = []
  }
}

function hoverChild(child: Category) {
  clearTimeout(previewTimer)
  previewTimer = setTimeout(() => loadPreview(child), 120)
}

watch(active, (category) => {
  if (category) loadPreview(category)
}, { immediate: true })

onBeforeUnmount(() => {
  clearTimeout(rootTimer)
  clearTimeout(previewTimer)
  previewTicket++
})

// Esc закрывает меню, как и клик по затемнению
onMounted(() => {
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape')
      emit('close')
  }
  document.addEventListener('keydown', onKey)
  onUnmounted(() => document.removeEventListener('keydown', onKey))
})
</script>

<template>
  <div class="catalog-menu">
    <!-- Затемнение под шапкой: клик мимо панели закрывает каталог -->
    <div class="catalog-menu__backdrop" @click="emit('close')" />

    <div class="catalog-menu__panel" @mouseenter="emit('panelEnter')" @mouseleave="emit('panelLeave')">
      <aside class="catalog-menu__aside">
        <p class="catalog-menu__aside-title">{{ $t('shell.catalog.title') }}</p>

        <ul class="catalog-menu__roots">
          <li v-for="category in roots" :key="category.id">
            <NuxtLink
              :to="localePath(`/category/${category.slug}`)"
              class="catalog-menu__root"
              :class="{ 'catalog-menu__root--active': category.id === active?.id }"
              @mouseenter="hoverRoot(category.id)"
              @focus="activeId = category.id"
              @click="emit('close')"
            >
              <span class="catalog-menu__root-thumb" aria-hidden="true">
                <img v-if="category.image" :src="category.image" width="28" height="28" alt="" loading="lazy">
                <span v-else>{{ category.title.slice(0, 1) }}</span>
              </span>
              <span class="catalog-menu__root-title">{{ category.title }}</span>
              <UiIcon name="alt-arrow-right" color="currentColor" :size="14" class="catalog-menu__root-chevron" />
            </NuxtLink>
          </li>
        </ul>
      </aside>

      <section v-if="active" class="catalog-menu__content">
        <div class="catalog-menu__links">
          <NuxtLink :to="localePath(`/category/${active.slug}`)" class="catalog-menu__heading" @click="emit('close')">
            <span>{{ active.title }}</span>
            <UiIcon name="alt-arrow-right" color="currentColor" :size="18" />
          </NuxtLink>

          <ul v-if="active.children?.length" class="catalog-menu__children">
            <li v-for="child in active.children" :key="child.id" class="catalog-menu__group">
              <NuxtLink
                :to="localePath(`/category/${child.slug}`)"
                class="catalog-menu__child"
                :class="{ 'catalog-menu__child--group': child.children?.length }"
                @mouseenter="hoverChild(child)"
                @focus="loadPreview(child)"
                @click="emit('close')"
              >
                {{ child.title }}
              </NuxtLink>

              <ul v-if="child.children?.length" class="catalog-menu__grandchildren">
                <li v-for="grand in child.children" :key="grand.id">
                  <NuxtLink :to="localePath(`/category/${grand.slug}`)" class="catalog-menu__grandchild" @click="emit('close')">
                    {{ grand.title }}
                  </NuxtLink>
                </li>
              </ul>
            </li>
          </ul>

          <p v-else class="catalog-menu__empty">{{ $t('shell.catalog.empty') }}</p>

          <NuxtLink :to="localePath(`/category/${active.slug}`)" class="catalog-menu__all" @click="emit('close')">
            {{ $t('shell.catalog.allIn') }}
          </NuxtLink>
        </div>

        <aside v-if="preview === null || preview.length" class="catalog-menu__preview" :aria-busy="preview === null">
          <p class="catalog-menu__preview-title">{{ $t('shell.catalog.popular', { title: previewTitle }) }}</p>

          <ul class="catalog-menu__products">
            <template v-if="preview">
              <li v-for="product in preview" :key="product.id">
                <NuxtLink :to="localePath(`/product/${product.slug}`)" class="catalog-menu__product" @click="emit('close')">
                  <UiImage :src="product.image" :alt="product.title" width="180" height="180" class="catalog-menu__product-image" />
                  <span class="catalog-menu__product-text">
                    <span class="catalog-menu__product-name">{{ product.title }}</span>
                    <span class="catalog-menu__product-price">{{ money(product.price) }}</span>
                  </span>
                </NuxtLink>
              </li>
            </template>
            <template v-else>
              <li v-for="n in PREVIEW_SIZE" :key="n" class="catalog-menu__product">
                <UiSkeleton width="100%" height="160px" radius="12px" />
                <span class="catalog-menu__product-text">
                  <UiSkeleton width="100%" height="14px" />
                  <UiSkeleton width="60%" height="16px" />
                </span>
              </li>
            </template>
          </ul>
        </aside>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Меню висит под шапкой и прижато к её нижнему краю */
.catalog-menu {
  position: absolute;
  inset-inline: 0;
  top: 100%;
  z-index: 40;
}

/* Затемнение только под шапкой: сама шапка с поиском остаётся рабочей */
.catalog-menu__backdrop {
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 100vh;
  background: rgb(39 49 64 / 40%);
  animation: catalog-fade 0.2s ease;
}

@keyframes catalog-fade {
  from { opacity: 0; }
}

@keyframes catalog-drop {
  from { opacity: 0; transform: translateY(-6px); }
}

/*
 * Высота ограничена экраном, а колонки прокручиваются сами.
 * `grid-template-rows: minmax(0, 1fr)` нужен, чтобы строка слушалась
 * `max-height`, иначе её высоту задаёт содержимое и прокручивать нечего.
 */
.catalog-menu__panel {
  position: relative;
  display: grid;
  grid-template-columns: 320px 1fr;
  grid-template-rows: minmax(0, 1fr);
  width: var(--container-width);
  min-height: 480px;
  max-height: calc(100vh - var(--header-height) - var(--header-topbar-height) - 24px);
  margin: 0 auto;
  overflow: hidden;
  border-radius: 0 0 20px 20px;
  background: var(--color-surface);
  box-shadow: 0 24px 60px rgb(39 49 64 / 18%);
  animation: catalog-drop 0.18s ease;
}

@media (prefers-reduced-motion: reduce) {
  .catalog-menu__backdrop,
  .catalog-menu__panel { animation: none; }
}

/* `overscroll-behavior: contain` — колесо не подхватывает страницу за панелью */
.catalog-menu__aside,
.catalog-menu__content {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.catalog-menu__aside {
  padding: 16px 8px 16px 12px;
  border-right: 1px solid var(--color-line);
  background: #FAFBFC;
}

.catalog-menu__aside-title {
  margin: 0 0 8px;
  padding-left: 12px;
  font-weight: 600;
  font-size: var(--text-2xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-gray);
}

.catalog-menu__roots {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.catalog-menu__root {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 7px 12px;
  border-radius: 10px;
  color: var(--color-navy);
}

.catalog-menu__root--active {
  background: var(--color-surface);
  box-shadow: 0 1px 4px rgb(39 49 64 / 8%);
  color: var(--color-brand-text);
}

.catalog-menu__root-thumb {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--color-topbar);
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-gray);
}

.catalog-menu__root-thumb img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.catalog-menu__root-title {
  flex: 1;
  min-width: 0;
  font-weight: 400;
  font-size: var(--text-sm);
  line-height: 18px;
}

.catalog-menu__root-chevron { color: #B6BCC6; }
.catalog-menu__root--active .catalog-menu__root-chevron { color: var(--color-brand-text); }

.catalog-menu__content {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  align-items: start;
  gap: 24px;
  padding: 24px 24px 24px 32px;
}

.catalog-menu__preview {
  padding: 16px;
  border-radius: 16px;
  background: var(--color-page);
}

.catalog-menu__preview-title {
  margin: 0 0 12px;
  font-weight: 600;
  font-size: var(--text-sm);
  line-height: 18px;
  color: var(--color-navy);
}

.catalog-menu__products {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.catalog-menu__product {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  padding: 8px;
  border-radius: 14px;
  background: var(--color-surface);
  transition: box-shadow 0.15s ease;
}

a.catalog-menu__product:hover { box-shadow: 0 6px 18px rgb(39 49 64 / 10%); text-decoration: none; }

.catalog-menu__product-image {
  flex: none;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  border-radius: 12px;
  background: var(--color-field);
  object-fit: contain;
}

.catalog-menu__product-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 0 4px 4px;
}

.catalog-menu__product-name {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: var(--text-sm);
  line-height: 18px;
  color: var(--color-navy);
}

a.catalog-menu__product:hover .catalog-menu__product-name { color: var(--color-brand-text); }

.catalog-menu__product-price {
  font-weight: 700;
  font-size: var(--text-md);
  line-height: 20px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.catalog-menu__heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: var(--color-navy);
  font: var(--type-card-title);
}

.catalog-menu__heading:hover { color: var(--color-brand-text); }

/* Колонки, как у Uzum: группы перетекают сверху вниз */
.catalog-menu__children {
  margin: 0;
  padding: 0;
  list-style: none;
}

.catalog-menu__group {
  break-inside: avoid;
  padding-bottom: 12px;
}

.catalog-menu__child {
  display: inline-block;
  font-weight: 400;
  font-size: var(--text-sm);
  line-height: 20px;
  color: var(--color-navy);
}

.catalog-menu__child--group { font-weight: 600; }

.catalog-menu__child:hover,
.catalog-menu__grandchild:hover { color: var(--color-brand-text); }

.catalog-menu__grandchildren {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}

.catalog-menu__grandchild {
  font-size: var(--text-sm);
  line-height: 18px;
  color: var(--color-gray);
}

.catalog-menu__empty {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-gray);
}

.catalog-menu__all {
  display: inline-block;
  margin-top: 16px;
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--color-brand-text);
}

.catalog-menu__all:hover { color: var(--color-brand-text-hover); }

/* Общее правило подчёркивает ссылки внутри li при наведении — здесь цвет и так меняется */
.catalog-menu__root:hover,
.catalog-menu__child:hover,
.catalog-menu__grandchild:hover { text-decoration: none; }
</style>
