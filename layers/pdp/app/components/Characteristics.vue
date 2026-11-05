<script setup lang="ts">
/**
 * Блок «Характеристики». Макет: animal-characteristics-card 740×607.7, r16.3.
 * Характеристики-подтверждения («Вакцинация пройдена») в макете выделены
 * зелёной галочкой — их помечает флаг `checked` у самой характеристики.
 */
import type { Attribute } from '#shared/types/catalog'

defineProps<{ attributes: Attribute[] }>()
const collapsed = ref(false)
</script>

<template>
  <section class="chars">
    <header class="chars__header">
      <h2 class="chars__title">{{ $t('ui.pdp.characteristics.harakteristiki') }}</h2>
      <button
        type="button"
        class="chars__toggle"
        :aria-expanded="!collapsed"
        :aria-label="$t('ui.pdp.characteristics.svernutHarakteristiki')"
        @click="collapsed = !collapsed"
      >
        <UiIcon :name="collapsed ? 'alt-arrow-down' : 'alt-arrow-up'" color="currentColor" :size="16.3" />
      </button>
    </header>

    <dl v-show="!collapsed" class="chars__grid">
      <div v-for="attribute in attributes" :key="attribute.id" class="chars__row">
        <dt class="chars__label">{{ attribute.title }}</dt>
        <dd class="chars__value">
          <!-- Галочка идёт по `checked`, а не по тексту значения: значение
               переведено («Да» / «Ha»), и сравнение со словом не работало ни
               на одной локали. `false` («не привит») галочку не получает. -->
          <span v-if="attribute.checked === true" class="chars__check" aria-hidden="true">
            <UiIcon name="tick-square-fill" :size="20" />
          </span>
          {{ attribute.value }}
        </dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.chars {
  padding: 20.4px;
  border-radius: 16.3px;
  background: var(--color-surface);
}

.chars__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 29px;
  border-bottom: 1px solid #EBEFF2;
}

.chars__title {
  margin: 0;
  font: var(--type-section-title);
  color: var(--color-text);
}

.chars__toggle {
  display: grid;
  place-items: center;
  width: 24.5px;
  height: 24.5px;
  padding: 0;
  border: 0;
  background: none;
  font-size: var(--text-base);
  color: #111111;
  cursor: pointer;
}

.chars__grid {
  display: flex;
  flex-direction: column;
  gap: 12.3px;
  margin: 16.3px 0 0;
}

.chars__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  /* Макет animal-characteristics-card: строка 699×33 — текст 25px и по 4px сверху и снизу */
  padding-block: 4px;
}

.chars__label {
  font-family: var(--font-specs);
  font-weight: 500;
  font-size: var(--text-xl);
  line-height: 25.1px;
  color: #8A8A8A;
}

.chars__value {
  display: flex;
  align-items: center;
  gap: 6.1px;
  margin: 0;
  font-family: var(--font-specs);
  /* В макете значение жирнее метки: value w700 против label w500 */
  font-weight: 700;
  font-size: var(--text-xl);
  line-height: 25.1px;
  color: #111111;
  text-align: right;
}

/* Галочка в залитом квадрате: подложки нет, квадрат рисует сама иконка.
   Подтверждение прививок и осмотра должно читаться. */
.chars__check {
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-right: 2px;
  color: var(--color-brand);
  vertical-align: -4px;
}
</style>
