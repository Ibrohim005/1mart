<script setup lang="ts">
/**
 * Строка товара в корзине.
 * Квадратное фото слева на всю высоту строки, справа детали, чекбокс
 * и ряд со счётчиком: всё про товар читается в одной колонке.
 */
import type { CartItem } from '#shared/types/cart'
import iconPlus from '@zoo/shared/app/assets/icons/add.svg'

const props = defineProps<{
  item: CartItem
  /** Товар уже в избранном — от этого зависит вид сердца */
  favorite?: boolean
}>()
const { money, amount } = useMoney()
const localePath = useLocalePath()
const link = computed(() => localePath(`/product/${props.item.product.slug}`))
const emit = defineEmits<{ quantity: [number], remove: [], favorite: [boolean], select: [boolean] }>()


/**
 * Счётчик считаем от локального значения и блокируем кнопки до ответа:
 * раньше пять быстрых нажатий уходили пятью запросами с одним и тем же
 * количеством, и четыре клика пропадали.
 */
const pending = ref(false)
const shown = ref(props.item.quantity)
watch(() => props.item.quantity, (value) => {
  if (!pending.value) shown.value = value
})

let timer: ReturnType<typeof setTimeout> | undefined

function step(delta: number) {
  const next = shown.value + delta
  // Убрать товар можно корзиной справа: вторая такая же кнопка в счётчике только путала
  if (next < 1 || next > props.item.maxQuantity) return

  // Число меняем сразу, а запрос шлём один — на итоговое количество.
  // Раньше каждый клик считал количество от устаревшего prop, и из пяти
  // нажатий доезжало одно.
  shown.value = next
  pending.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    pending.value = false
    emit('quantity', shown.value)
  }, 220)
}

onUnmounted(() => clearTimeout(timer))

const price = computed(() => money(props.item.price))
const oldPrice = computed(() =>
  props.item.fullPrice ? amount(props.item.fullPrice) : null,
)
</script>

<template>
  <article class="row">
    <!-- UiImage: у части товаров файла по ссылке нет, он подставит заглушку -->
    <NuxtLink :to="link" class="row__photo">
      <UiImage
        :src="item.product.image"
        :alt="item.product.title"
        width="148"
        height="148"
        class="row__image"
      />
    </NuxtLink>

    <div class="row__main">
      <div class="row__details">
        <p class="row__price-line">
          <s v-if="oldPrice" class="row__old-price">{{ oldPrice }}</s>
          <span class="row__price">{{ price }}</span>
          <span v-if="shown > 1" class="row__times">× {{ shown }}</span>
        </p>

        <NuxtLink :to="link" class="row__title">{{ item.product.title }}</NuxtLink>

        <!--
          Состав варианта. Без него две строки одного товара — «Бык» и «Тёлка» —
          выглядят одинаково, и человек не понимает, что именно лежит в корзине.
        -->
        <p v-if="item.skuOptions?.length" class="row__options">
          {{ item.skuOptions.map(option => option.value).join(' · ') }}
        </p>

        <!-- Продавца показываем, только если площадка его открыла; по умолчанию его нет -->
        <p v-if="item.seller" class="row__seller">{{ $t('ui.cart.item.sellerLabel', { title: item.seller.title }) }}</p>
      </div>

      <label class="row__checkbox" :class="{ 'row__checkbox--on': item.selected }">
        <input
          class="row__checkbox-input"
          type="checkbox"
          :checked="item.selected"
          :aria-label="$t('ui.cart.item.selectProduct', { title: item.product.title })"
          @change="emit('select', ($event.target as HTMLInputElement).checked)"
        >
        <UiIcon v-if="item.selected" name="tick-square-fill" :size="28" />
      </label>
    </div>

    <div class="row__actions">
      <div class="row__counter">
        <button type="button" class="row__step" :disabled="shown <= 1" :aria-label="$t('ui.cart.item.umenshit')" @click="step(-1)">
          <UiIcon name="minus" :size="20" />
        </button>

        <span class="row__quantity">{{ shown }}</span>

        <button
          type="button"
          class="row__step"
          :disabled="shown >= item.maxQuantity"
          :aria-label="$t('ui.cart.item.uvelichit')"
          @click="step(1)"
        >
          <img :src="iconPlus" width="24" height="24" alt="">
        </button>
      </div>

      <div class="row__tools">
        <!--
          Сердце показывает состояние: контурное — товара нет в избранном,
          залитое — есть. Раньше оно было залитым всегда, будто товар уже
          выбран, а нажатие удаляло строку из корзины.
        -->
        <button
          type="button"
          class="row__tool"
          :aria-label="favorite ? $t('cart.fromFavorites') : $t('cart.toFavorites')"
          :aria-pressed="favorite"
          :class="{ 'row__tool--active': favorite }"
          @click="emit('favorite', !favorite)"
        >
          <UiIcon :name="favorite ? 'heart-fill' : 'heart'" :size="22" />
        </button>
        <button type="button" class="row__tool" :aria-label="$t('cart.remove')" @click="emit('remove')">
          <UiIcon name="trash" :size="22" />
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr);
  grid-template-rows: 1fr auto;
  column-gap: 20px;
  row-gap: 12px;
  padding: 16px;
  border-radius: 24px;
  background: var(--color-surface);
}

.row__photo {
  grid-row: 1 / 3;
  display: block;
  height: 148px;
  border-radius: 16px;
  background: #F4F5F7;
  overflow: hidden;
}

.row__main { display: flex; gap: 16px; }

/* Товар виден целиком: при cover у вытянутых снимков обрезались края */
.row__image {
  width: 100%;
  height: 100%;
  padding: 8px;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.row__details { flex: 1; min-width: 0; }

.row__price-line { display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 12px; margin: 0; }

.row__old-price {
  font-weight: 400;
  font-size: var(--text-md);
  line-height: 22px;
  color: var(--color-text-muted);
}

.row__price {
  font-weight: 700;
  font-size: var(--text-3xl);
  line-height: 28px;
  color: var(--color-text);
}

.row__times { font-size: var(--text-md); font-weight: 500; color: var(--color-text-muted); }

.row__title {
  margin: 4px 0 0;
  font-weight: 500;
  font-size: var(--text-base);
  line-height: 22px;
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-decoration: none;
}

.row__title:hover { color: var(--color-brand-text); }

.row__options,
.row__seller {
  margin: 4px 0 0;
  font-weight: 400;
  font-size: var(--text-sm);
  line-height: 20px;
  color: var(--color-text-muted);
}

/* Настоящий input, спрятанный под оформление из макета:
   работает автозаполнение, скринридеры и клавиатура */
.row__checkbox-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.row__checkbox:focus-within { box-shadow: var(--focus-ring); }

.row__checkbox {
  position: relative;
  display: grid;
  place-items: center;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: var(--color-field);
  color: transparent;
  cursor: pointer;
}

.row__checkbox--on { background: transparent; color: var(--color-text); }

.row__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.row__counter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 136px;
  height: 44px;
  padding-inline: 4px;
  border-radius: 12px;
  background: var(--color-field);
}

.row__step {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
}

.row__step:hover:not(:disabled) { color: var(--color-brand-text); }
.row__step:disabled { opacity: .4; cursor: not-allowed; }

.row__quantity {
  font-weight: 600;
  font-size: var(--text-base);
  line-height: 24px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.row__tools { display: flex; gap: 8px; }

.row__tool {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.row__tool:hover { background: var(--color-field); color: var(--color-text); }
.row__tool--active { color: var(--color-brand-text); }
</style>
