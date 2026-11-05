<script setup lang="ts">
/**
 * «Может пригодиться» — подборка товаров поверх корзины.
 * Макет: Может пригодиться → Tab Bar 906×599, r30; лента карточек
 * 1206.8 шире панели, поэтому прокручивается вбок.
 */
import type { ProductCard } from '#shared/types/catalog'

const props = defineProps<{ modelValue: boolean, products: ProductCard[] }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

function close() {
  emit('update:modelValue', false)
}

// Блокировка фона, ловушка фокуса, Esc и возврат фокуса — общие для всех диалогов
const panel = ref<HTMLElement | null>(null)
useDialog(toRef(props, 'modelValue'), { panel, onClose: close })
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="useful-overlay" @click.self="close">
      <div ref="panel" class="useful" role="dialog" aria-modal="true" :aria-label="$t('cart.useful')" tabindex="-1">
        <header class="useful__head">
          <h2 class="useful__title">{{ $t('cart.useful') }}</h2>
          <UiCloseButton @click="close" />
        </header>

        <div class="useful__list scroll-x">
          <UiProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            class="useful__card"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.useful-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--overlay-z);
  display: grid;
  place-items: center;
  background: var(--overlay-bg);
}

.useful {
  display: flex;
  flex-direction: column;
  width: 906px;
  padding: 26px 23px;
  border-radius: var(--dialog-radius);
  background: var(--color-surface);
}

.useful__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.useful__title {
  margin: 0;
  font: var(--type-dialog-title);
  color: var(--color-text);
}

/* Лента шире панели — листается вбок, как в макете */
/*
 * Карточка в этой ленте — та же, что на полках главной, уменьшенная в 0.95
 * (макет «Может пригодиться»: 227×488 против 239×532, кегли и радиус в том же
 * отношении). Масштаб задаётся одним числом, см. UI-KIT.
 */
.useful__list :deep(.card) { --u: 0.95px; }

.useful__list {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 227.3px;
  gap: 17.9px;
  margin-top: 22px;
  padding-bottom: 8px;
  overflow-x: auto;
  scroll-snap-type: x proximity;
}

.useful__card { scroll-snap-align: start; }
</style>
