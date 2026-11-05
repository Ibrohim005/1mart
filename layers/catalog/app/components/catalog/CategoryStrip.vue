<script setup lang="ts">
/**
 * Ряд категорий под баннером: квадратные плитки с картинкой раздела
 * и подписью — 9 корневых разделов и последней «Все категории».
 * Остальные разделы живут в каталоге шапки и в строке под поиском.
 */
import type { Category } from '#shared/types/catalog'

const props = defineProps<{
  categories: Category[]
  /** Разделы ещё едут — вместо плиток показываем скелетон */
  loading?: boolean
}>()

// Сводная «Все» в моках приходит как обычная категория — её отсекаем,
// чтобы плитка не задвоилась: своя плитка «Все категории» стоит последней.
const ALL_SLUG = 'vse'
const visible = computed(() => props.categories.filter(c => c.slug !== ALL_SLUG).slice(0, 9))
const localePath = useLocalePath()
</script>

<template>
  <div v-if="loading" class="strip" aria-busy="true" aria-live="polite">
    <span class="visually-hidden">{{ $t('ui.shared.state.loading') }}</span>
    <span v-for="n in 10" :key="n" class="strip__item">
      <UiSkeleton width="100%" height="auto" radius="16px" class="strip__tile-skeleton" />
      <UiSkeleton width="72%" height="12px" class="strip__label-skeleton" />
    </span>
  </div>

  <nav v-else class="strip" :aria-label="$t('shell.header.categoriesNav')">
    <NuxtLink
      v-for="category in visible"
      :key="category.id"
      :to="localePath(`/category/${category.slug}`)"
      class="strip__item"
    >
      <!-- Плитка рисуется ВСЕГДА: у категории без картинки раньше <img>
           просто пропускался, подпись всплывала к верху, и лента выглядела
           рваной — половина подписей на одной высоте, половина на другой. -->
      <span class="strip__tile" aria-hidden="true">
        <img
          v-if="category.image"
          :src="category.image"
          :alt="''"
          class="strip__image"
          loading="lazy"
        >
        <span v-else class="strip__placeholder">{{ category.title.slice(0, 1) }}</span>
      </span>
      <span class="strip__label">{{ category.title }}</span>
    </NuxtLink>

    <!-- «Все» нет в справочнике бэкенда — сводную категорию держит адаптер
         (api-backend/server/utils/categories.ts), поэтому плитка своя -->
    <NuxtLink :to="localePath(`/category/${ALL_SLUG}`)" class="strip__item">
      <span class="strip__tile" aria-hidden="true">
        <UiIcon name="category-2-fill" :size="44" class="strip__all-icon" />
      </span>
      <span class="strip__label">{{ $t('shell.home.allCategories') }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.strip {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 16px;
  width: var(--container-width);
  margin-inline: auto;
}

.strip__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  /* Без этого min-content элемента считается по натуральной ширине
     картинки, и колонки раздувало до горизонтальной прокрутки */
  min-width: 0;
}

/* Квадратная плитка рисуется всегда — есть картинка или нет,
   подписи всех плиток стоят на одной высоте */
.strip__tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 16px;
  background: var(--color-topbar);
  transition: background 0.2s ease, transform 0.2s ease;
}

.strip__item:hover .strip__tile {
  background: var(--color-line);
  transform: translateY(-2px);
}

.strip__image {
  width: 78%;
  height: 78%;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.strip__tile-skeleton { aspect-ratio: 1 / 1; }
.strip__label-skeleton { margin-bottom: 20px; }

.strip__all-icon { color: var(--color-brand-text); }

.strip__placeholder {
  font-weight: 600;
  font-size: var(--text-7xl);
  color: var(--color-gray);
}

.strip__label {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 36px;
  overflow: hidden;
  font-weight: 500;
  font-size: var(--text-xs);
  line-height: 18px;
  text-align: center;
  color: var(--color-navy);
}

.strip__item:hover .strip__label { color: var(--color-brand-text); }
</style>
