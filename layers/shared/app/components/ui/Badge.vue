<script setup lang="ts">
import type { BadgeKind } from '#shared/types/catalog'

const props = defineProps<{ kind: BadgeKind, label: string }>()

const { t, te } = useI18n()

/**
 * Подпись переводим по виду бейджа. Из API она приходит по-русски, и на
 * узбекской локали «СТАЛО ДЕШЕВЛЕ» оставалось русским. Если перевода для
 * вида нет — показываем то, что прислал сервер.
 */
const text = computed(() => (te(`badge.${props.kind}`) ? t(`badge.${props.kind}`) : props.label))
</script>

<template>
  <span class="badge" :class="`badge--${kind}`">{{ text }}</span>
</template>

<style scoped>
/* Размеры и цвета — из макета: Promo Badge, высота 20.3, радиус 12.4 */
.badge {
  display: inline-flex;
  align-items: center;
  height: 20.3px;
  padding-inline: 12.4px;
  border-radius: 12.4px;
  font-weight: 600;
  font-size: var(--text-2xs);
  line-height: 14.6px;
  white-space: nowrap;
}

.badge--cheaper {
  background: var(--badge-cheaper-bg);
  color: var(--badge-cheaper-text);
}

.badge--freeShipping {
  background: var(--badge-shipping-bg);
  color: var(--badge-shipping-text);
}

/* «Новинка» в макете крупнее и с большим радиусом */
.badge--new {
  height: 23.6px;
  border-radius: 19.9px;
  background: var(--badge-new-bg);
  color: var(--badge-new-text);
}
</style>
