<script setup lang="ts">
/**
 * Полка товаров главной: заголовок-ссылка, «Смотреть все» справа
 * и сетка из пяти карточек в ряд. Акцентная полка («Скидки недели»)
 * выделена композицией: белый контейнер с рамкой, крупнее заголовок
 * и обратный отсчёт до конца недели.
 */
import type { ProductCard } from '#shared/types/catalog'

const { t } = useI18n()
const localePath = useLocalePath()

const props = defineProps<{
  title: string
  products: ProductCard[]
  /** Произвольная плашка справа от заголовка */
  timer?: string
  /** Обратный отсчёт до конца недели (воскресенье, 23:59:59) */
  countdown?: boolean
  /** Акцентная полка: контейнер с рамкой и крупный заголовок */
  accent?: boolean
  /** Куда ведёт «Смотреть все» */
  moreLink?: string
  /** Товары ещё едут — вместо карточек показываем скелетоны */
  loading?: boolean
  /** Сколько скелетонов рисовать — по числу ожидаемых карточек */
  skeletons?: number
}>()

/*
 * Отсчёт живёт только в браузере: на сервере и в браузере «сейчас» разное,
 * и цифры из SSR-разметки расходились бы с гидратацией. До монтирования
 * плашка не рисуется вовсе.
 */
const now = ref<number | null>(null)
let tick: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (!props.countdown) return
  now.value = Date.now()
  tick = setInterval(() => (now.value = Date.now()), 1000)
})
onUnmounted(() => clearInterval(tick))

const left = computed(() => {
  if (now.value === null) return null
  const current = new Date(now.value)
  const end = new Date(current)
  // До конца воскресенья: getDay() у воскресенья 0
  end.setDate(current.getDate() + ((7 - current.getDay()) % 7))
  end.setHours(23, 59, 59, 999)
  const total = Math.max(0, Math.floor((end.getTime() - now.value) / 1000))
  const pad = (value: number) => String(value).padStart(2, '0')
  return {
    days: Math.floor(total / 86400),
    hours: pad(Math.floor((total % 86400) / 3600)),
    minutes: pad(Math.floor((total % 3600) / 60)),
    seconds: pad(total % 60),
  }
})

const link = computed(() => props.moreLink ?? localePath('/search'))
</script>

<template>
  <section class="shelf" :class="{ 'shelf--accent': accent }">
    <div class="shelf__inner">
      <header class="shelf__header">
        <div class="shelf__title-group">
          <h2 class="shelf__title">
            <NuxtLink :to="link" class="shelf__title-link">
              {{ title }}
              <UiIcon name="alt-arrow-right" color="currentColor" :size="20" class="shelf__title-icon" />
            </NuxtLink>
          </h2>

          <span v-if="timer" class="shelf__timer">{{ timer }}</span>

          <span v-if="countdown && left" class="shelf__countdown" role="timer">
            <span class="shelf__countdown-label">{{ t('shell.home.endsIn') }}</span>
            <span v-if="left.days" class="shelf__countdown-cell">{{ t('shell.home.days', { count: left.days }) }}</span>
            <span class="shelf__countdown-cell">{{ left.hours }}</span>
            <span class="shelf__countdown-sep" aria-hidden="true">:</span>
            <span class="shelf__countdown-cell">{{ left.minutes }}</span>
            <span class="shelf__countdown-sep" aria-hidden="true">:</span>
            <span class="shelf__countdown-cell">{{ left.seconds }}</span>
          </span>
        </div>

        <NuxtLink :to="link" class="shelf__more">
          {{ t('shell.home.showAll') }}
        </NuxtLink>
      </header>

      <!-- Скелетонов столько же, сколько карточек, — высота секции не прыгает -->
      <div v-if="loading" class="shelf__grid" aria-busy="true" aria-live="polite">
        <span class="visually-hidden">{{ t('ui.shared.state.loading') }}</span>
        <UiProductCardSkeleton v-for="n in (skeletons ?? 5)" :key="n" />
      </div>

      <div v-else class="shelf__grid">
        <UiProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.shelf { padding-block: 20px; }

.shelf--accent { margin-block: 12px; padding-block: 8px; }

/* Контейнер шире сетки на свои поля и рамку: карточки стоят в одну линию с соседними полками */
.shelf--accent .shelf__inner {
  width: calc(var(--container-width) + 50px);
  padding: 24px 24px 28px;
  border: 1px solid var(--color-line);
  border-radius: 24px;
}

.shelf--accent .shelf__title {
  line-height: 36px;
}

.shelf__inner {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: var(--container-width);
  margin-inline: auto;
}

.shelf__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 36px;
}

.shelf__title-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.shelf__title {
  margin: 0;
  font: var(--type-section-title);
  color: var(--color-text);
}

.shelf__title-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.shelf__title-icon { transition: transform 0.15s ease; }
.shelf__title-link:hover { color: var(--color-brand-text); }
.shelf__title-link:hover .shelf__title-icon { transform: translateX(3px); }

.shelf__timer {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding-inline: 12px;
  border-radius: 8px;
  background: var(--color-accent);
  font-weight: 600;
  font-size: var(--text-xs);
  color: var(--color-surface);
}

.shelf__countdown {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.shelf__countdown-label {
  margin-right: 6px;
  font-size: var(--text-sm);
  color: var(--color-navy);
}

.shelf__countdown-cell {
  display: inline-grid;
  place-items: center;
  min-width: 32px;
  height: 30px;
  padding-inline: 6px;
  border-radius: 8px;
  background: var(--color-navy);
  font-weight: 600;
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
  color: var(--color-surface);
}

.shelf__countdown-sep {
  font-weight: 600;
  color: var(--color-navy);
}

.shelf__more {
  flex: none;
  font-weight: 500;
  font-size: var(--text-sm);
  line-height: 18px;
  color: var(--color-brand-text);
}

.shelf__more:hover { color: var(--color-brand-text-hover); }

.shelf__grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 24px 16px;
}
</style>
