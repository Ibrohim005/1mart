<script setup lang="ts">
/**
 * Карточка «Возврат и гарантия» / «Оплата и доставка».
 * Строки устроены как в соседнем блоке «Способы оплаты»: чёрная иконка на
 * нейтральной плитке, между строками один и тот же разделитель.
 */
import type { InfoRow } from '#shared/types/catalog'

const props = defineProps<{
  title: string
  rows: InfoRow[]
  /** Выбирает иконку строки по умолчанию: щит для гарантии, иначе грузовик */
  roundIcons?: boolean
  linkLabel?: string
}>()

/**
 * Иконки строк — набор Iconsax из Figma вместо иконок шаблона.
 * Данные приходят с прежними именами (return, seal-check, card, truck),
 * поэтому сопоставляем их здесь, не трогая API.
 */
const ICONS: Record<string, string> = {
  'return': 'rotate-left',
  'seal-check': 'shield-tick-fill',
  'card': 'card-fill',
  'truck': 'truck-fill',
}
function iconOf(row: InfoRow) {
  const name = row.icon ?? (props.roundIcons ? 'seal-check' : 'truck')
  return ICONS[name] ?? name
}
</script>

<template>
  <section class="info">
    <h2 class="info__title">{{ title }}</h2>

    <div v-for="row in rows" :key="row.title" class="info__row">
      <span class="info__icon">
        <UiIcon :name="iconOf(row)" :size="22" />
      </span>

      <div class="info__text">
        <p class="info__row-title">{{ row.title }}</p>
        <p class="info__row-description">{{ row.description }}</p>
        <p v-if="row.note" class="info__row-note">
          <UiIcon name="location-fill" :size="14" class="info__note-icon" />
          <span>{{ row.note }}</span>
        </p>
      </div>
    </div>

    <NuxtLink v-if="linkLabel" to="/info/delivery" class="info__link">
      <span>{{ linkLabel }}</span>
      <UiIcon name="alt-arrow-right" :size="16" class="info__link-icon" />
    </NuxtLink>
  </section>
</template>

<style scoped>
/* Обе карточки растягивает сетка родителя; ссылка прижата к низу своей карточки */
.info {
  display: flex;
  flex-direction: column;
  padding: 20px 20px 4px;
  border-radius: 22.4px;
  background: var(--color-surface);
}

.info__title {
  margin: 0 0 4px;
  color: var(--color-text);
  font: var(--type-card-title);
}

.info__row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-block: 16px;
}

/* Единственное правило разделителя: только между соседними элементами */
.info__row + .info__row,
.info__link { border-top: 1px solid var(--color-line); }

.info__icon {
  display: grid;
  place-items: center;
  flex: 0 0 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-field);
  color: var(--color-text);
}

.info__text { flex: 1; min-width: 0; }

.info__row-title {
  margin: 0;
  font-weight: 600;
  font-size: var(--text-md);
  line-height: 20px;
  color: var(--color-text);
}

.info__row-description,
.info__row-note {
  margin: 4px 0 0;
  font-size: var(--text-sm);
  line-height: 18px;
  color: var(--color-text-muted);
}

.info__row-note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
  color: var(--color-text);
}

.info__note-icon { flex: none; margin-top: 2px; color: var(--color-text-muted); }

.info__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  margin-top: auto;
  font-weight: 500;
  font-size: var(--text-sm);
  line-height: 18px;
  color: var(--color-brand-text);
}

.info__link:hover { color: var(--color-brand-text-hover); }
.info__link:focus-visible { outline: none; border-radius: 8px; box-shadow: var(--focus-ring); }
.info__link-icon { flex: none; }
</style>
