<script setup lang="ts">
/**
 * Карточка товара в духе Uzum Market: квадратное фото с сердцем и скидкой,
 * крупная цена с зачёркнутой старой, название в две строки, строка рейтинга
 * «★ 4.8 (123 отзыва)» и небольшая кнопка «В корзину», которая после
 * добавления превращается в счётчик. Рассрочки на маркетплейсе 1mart нет —
 * платёж в месяц карточка не показывает.
 *
 * Все длины заданы в единицах `--u` (см. UI-KIT.md): место, где карточка
 * крупнее или мельче, меняет только `--u`.
 */
import type { ProductCard } from '#shared/types/catalog'

const props = defineProps<{
  product: ProductCard
  /** На странице избранного сердце залито сразу */
  favorite?: boolean
}>()

const localePath = useLocalePath()
const { money, amount } = useMoney()
const { t } = useI18n()
const cart = useCartStore()
const toast = useToast()
const pending = ref(false)

/*
 * SKU для кнопки «в корзину». Настоящий бэкенд присылает его в карточке
 * (`defaultSkuId` — самый дешёвый активный вариант, тот же, чью цену
 * карточка и показывает), и тогда берём его.
 *
 * Мок такого поля не отдаёт и выводит SKU из номера карточки (id * 10 + 1)
 * — это его собственный счётчик. Формула остаётся запасным путём только
 * ради мока: на бэкенде id это UUID, `Number(uuid)` даёт NaN, и кнопка
 * «в корзину» в гриде молча переставала работать.
 */
const skuId = computed(() => props.product.defaultSkuId ?? Number(props.product.id) * 10 + 1)

/**
 * После добавления кнопка доставки превращается в счётчик —
 * макет Product Card → Delivery Button (5058:104509):
 * подложка #F2F4F7 r16, слева корзина/минус, справа плюс.
 */
/*
 * Счётчик показываем только после гидратации: на сервере состав корзины
 * уже известен, а на клиенте подгружается позже — без этого разметка
 * сервера и клиента расходятся.
 */
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
  cart.ensureDetail()
})

const quantity = computed(() => cart.quantityOf(skuId.value))
const inCart = computed(() => mounted.value && quantity.value > 0)

async function addToCart() {
  await change(1)
}

async function change(delta: number) {
  if (pending.value) return
  pending.value = true
  try {
    const next = quantity.value + delta
    // false — сервер отказал (категория отдела, лимит), причину корзина уже показала
    if (!quantity.value) {
      if (await cart.addItem(skuId.value, 1)) toast.show(t('ui.shared.productCard.addedToCart'))
    }
    else if (await cart.setQuantity(skuId.value, Math.max(0, next))) {
      if (next <= 0) toast.show(t('ui.shared.productCard.removedFromCart'))
    }
  }
  finally {
    pending.value = false
  }
}
// Настоящее избранное, не локальный ref: см. useFavorite.
const { isFavorite, toggle: toggleFavorite } = useFavorite(() => props.product.id, () => props.favorite)

/** Фото карточки листаются наведением на зоны и точками под снимком */
const photos = computed(() => props.product.gallery?.length ? props.product.gallery : [props.product.image])
const photoIndex = ref(0)
watch(() => props.product.id, () => { photoIndex.value = 0 })

const link = computed(() => localePath(`/product/${props.product.slug}`))

// Бейдж процента и старая цена уже говорят о скидке, «Стало дешевле» рядом лишнее
const badges = computed(() => props.product.badges.filter(
  badge => !(badge.kind === 'cheaper' && props.product.discountPercent),
))

// Глубокая скидка выделена другим цветом плашки
const isDeepDiscount = computed(() => (props.product.discountPercent ?? 0) >= 50)

/** Подпись «4.8 (123 отзыва)» — слово склоняется по числу */
const reviewsLabel = computed(() => t('ui.shared.productCard.reviewsCount', {
  count: props.product.reviewsCount,
  word: t('common.otzyv', props.product.reviewsCount),
}))
</script>

<template>
  <article class="card">
    <NuxtLink :to="link" class="card__photo">
      <UiImage
        :src="photos[photoIndex] ?? product.image"
        :alt="product.title"
        preset="productCard"
        loading="lazy"
        class="card__image"
      />

      <!-- Невидимые зоны: наведение на них листает фото, как в маркетплейсах -->
      <span class="card__zones" aria-hidden="true">
        <span
          v-for="(photo, index) in photos"
          :key="photo"
          class="card__zone"
          @mouseenter="photoIndex = index"
        />
      </span>

      <span
        v-if="product.discountPercent"
        class="card__discount"
        :class="{ 'card__discount--deep': isDeepDiscount }"
      >−{{ product.discountPercent }}%</span>

      <button
        type="button"
        class="card__favorite"
        :class="{ 'card__favorite--active': isFavorite }"
        :aria-pressed="isFavorite"
        :aria-label="$t('cart.toFavorites')"
        @click.prevent="toggleFavorite"
      >
        <UiIcon :name="isFavorite ? 'heart-fill' : 'heart'" :size="20" class="card__heart" />
      </button>

      <span v-if="photos.length > 1" class="card__dots">
        <button
          v-for="(photo, index) in photos"
          :key="photo"
          type="button"
          class="card__dot"
          :class="{ 'card__dot--active': index === photoIndex }"
          :aria-label="$t('ui.shared.productCard.photoNumber', { index: index + 1 })"
          @click.prevent="photoIndex = index"
        />
      </span>
    </NuxtLink>

    <div class="card__info">
      <div class="card__prices">
        <p class="card__price" :class="{ 'card__price--sale': product.fullPrice }">{{ money(product.price) }}</p>
        <s v-if="product.fullPrice" class="card__old-price">{{ amount(product.fullPrice) }}</s>
      </div>

      <NuxtLink :to="link" class="card__title">{{ product.title }}</NuxtLink>

      <p v-if="product.reviewsCount" class="card__rating">
        <UiIcon name="star-fill" :size="14" class="card__star" />
        <span class="card__rating-value">{{ product.rating.toFixed(1) }}</span>
        <span class="card__rating-count">{{ reviewsLabel }}</span>
      </p>

      <p v-if="badges.length" class="card__badges">
        <UiBadge
          v-for="badge in badges"
          :key="badge.kind"
          v-bind="badge"
        />
      </p>
    </div>

    <button
      v-if="!inCart"
      type="button"
      class="card__cart"
      :disabled="pending || !product.available"
      :aria-label="$t('ui.shared.productCard.addWithDelivery', { date: product.deliveryDate })"
      @click="addToCart"
    >
      <UiIcon v-if="product.available" name="shopping-bag" :size="18" class="card__cart-icon" />
      <span>{{ product.available ? $t('shell.card.toCart') : $t('catalog.outOfStock') }}</span>
    </button>

    <div v-else class="card__counter">
      <button
        type="button"
        class="card__step"
        :disabled="pending"
        :aria-label="quantity <= 1 ? $t('common.removeFromCart') : $t('common.decreaseQuantity')"
        @click="change(-1)"
      >
        <UiIcon :name="quantity <= 1 ? 'trash' : 'minus'" :size="18" />
      </button>

      <span class="card__quantity" aria-live="polite">{{ quantity }}</span>

      <button
        type="button"
        class="card__step"
        :disabled="pending"
        :aria-label="$t('common.uvelichitKolichestvo')"
        @click="change(1)"
      >
        <UiIcon name="add" :size="20" />
      </button>
    </div>
  </article>
</template>

<style scoped>
.card {
  /* Единица масштаба карточки: полки главной — 1px, сетка каталога — 1.199px,
     лента «Может пригодиться» — 0.95px. Все длины ниже — от неё. */
  --u: 1px;

  position: relative;
  display: flex;
  flex-direction: column;
  gap: calc(10 * var(--u));
  /* Элемент сетки по умолчанию не уже своего содержимого: длинное слово
     в названии раздвигало колонку и ломало ряд. */
  min-width: 0;
  padding: calc(6 * var(--u)) calc(6 * var(--u)) calc(8 * var(--u));
  border-radius: calc(8 * var(--u));
  /* Белая подложка: карточка одинаково читается и на белой главной,
     и на сером фоне каталога */
  background: var(--color-surface);
  transition: box-shadow 0.2s ease;
}

.card:hover { box-shadow: 0 6px 24px rgb(39 49 64 / 10%); }

/* ---------- Фото ---------- */

.card__photo {
  position: relative;
  display: block;
  aspect-ratio: 1 / 1;
  border-radius: calc(6 * var(--u));
  overflow: hidden;
  background: #F4F5F7;
}

/* Фото товаров бывают на прозрачном и белом фоне — вписываем целиком */
.card__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
  transition: transform 0.3s ease;
}

.card:hover .card__image { transform: scale(1.03); }

.card__discount {
  position: absolute;
  bottom: calc(10 * var(--u));
  left: calc(10 * var(--u));
  display: inline-flex;
  align-items: center;
  height: calc(22 * var(--u));
  padding-inline: calc(7 * var(--u));
  border-radius: calc(6 * var(--u));
  background: var(--color-accent);
  font-weight: 600;
  font-size: calc(12.5 * var(--u));
  line-height: calc(16 * var(--u));
  color: var(--color-navy);
}

.card__discount--deep { background: var(--color-danger); }

.card__favorite {
  z-index: 2;
  position: absolute;
  top: calc(8 * var(--u));
  right: calc(8 * var(--u));
  display: grid;
  place-items: center;
  width: calc(32 * var(--u));
  height: calc(32 * var(--u));
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgb(255 255 255 / 85%);
  color: var(--color-navy);
  cursor: pointer;
  transition: transform 0.15s ease, color 0.15s ease;
}

.card__favorite:hover { transform: scale(1.08); color: var(--color-brand-text); }

.card__heart {
  width: calc(20 * var(--u));
  height: calc(20 * var(--u));
}

/* Размер иконок идёт от --u: svg занимает обёртку UiIcon целиком */
.card__heart :deep(svg),
.card__star :deep(svg),
.card__cart-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.card__favorite--active { color: var(--color-brand-text); }

/* Зоны наведения поверх фото, под кнопками и точками */
.card__zones {
  position: absolute;
  inset: 0;
  display: flex;
}

.card__zone { flex: 1; }

.card__dots {
  z-index: 2;
  position: absolute;
  bottom: calc(6 * var(--u));
  left: 50%;
  display: flex;
  align-items: center;
  gap: calc(3 * var(--u));
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.card:hover .card__dots { opacity: 1; }

.card__dot {
  width: calc(5 * var(--u));
  height: calc(5 * var(--u));
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgb(39 49 64 / 25%);
  cursor: pointer;
  transition: width 0.2s ease, background 0.2s ease;
}

.card__dot--active {
  width: calc(14 * var(--u));
  background: var(--color-navy);
}

/* ---------- Текст ---------- */

.card__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: calc(6 * var(--u));
  padding-inline: calc(2 * var(--u));
}

.card__prices {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: calc(8 * var(--u));
}

.card__price {
  margin: 0;
  font-weight: 700;
  font-size: calc(18 * var(--u));
  line-height: calc(24 * var(--u));
  color: var(--color-navy);
  white-space: nowrap;
}

.card__price--sale { color: var(--color-brand-text); }

.card__old-price {
  font-weight: 400;
  font-size: calc(13 * var(--u));
  line-height: calc(18 * var(--u));
  color: var(--color-gray);
  white-space: nowrap;
}

.card__title {
  font-weight: 400;
  font-size: calc(14 * var(--u));
  line-height: calc(19 * var(--u));
  color: var(--color-navy);
  /* Ровно две строки: иначе карточки в ряду разъезжаются по высоте */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: calc(2 * 19 * var(--u));
  overflow: hidden;
}

.card__title:hover { color: var(--color-brand-text); }

.card__rating {
  display: flex;
  align-items: center;
  gap: calc(4 * var(--u));
  margin: 0;
  font-size: calc(12.5 * var(--u));
  line-height: calc(16 * var(--u));
}

.card__star {
  width: calc(14 * var(--u));
  height: calc(14 * var(--u));
  color: #FFB800;
}

.card__rating-value { font-weight: 500; color: var(--color-navy); }
.card__rating-count { font-weight: 400; color: var(--color-gray); }

.card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: calc(4 * var(--u));
  margin: 0;
}

/* ---------- Кнопка «В корзину» и счётчик ---------- */

.card__cart {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(6 * var(--u));
  height: calc(36 * var(--u));
  margin-top: auto;
  padding-inline: calc(12 * var(--u));
  border: 0;
  border-radius: calc(6 * var(--u));
  /* Спокойная нейтральная кнопка: сплошной зелёный на каждой карточке спорил с фото
     и ценой. Заливка брендом появляется только у карточки под курсором. */
  background: var(--color-field);
  font-family: var(--font-ui);
  font-weight: 500;
  font-size: calc(13.5 * var(--u));
  line-height: calc(18 * var(--u));
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.card:hover .card__cart:not(:disabled),
.card__cart:focus-visible { background: var(--color-brand); color: var(--color-on-brand); }
.card .card__cart:hover:not(:disabled) { background: var(--color-brand-dark); }
.card .card__cart:active:not(:disabled) { background: var(--color-brand-darker); }
.card__cart:disabled { background: var(--color-page); color: var(--color-text-muted); cursor: not-allowed; }

.card__cart-icon {
  width: calc(18 * var(--u));
  height: calc(18 * var(--u));
}

.card__counter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(36 * var(--u));
  margin-top: auto;
  padding: calc(3 * var(--u));
  border-radius: calc(6 * var(--u));
  background: var(--color-field);
}

.card__step {
  display: grid;
  place-items: center;
  width: calc(30 * var(--u));
  height: calc(30 * var(--u));
  border: 0;
  border-radius: calc(4 * var(--u));
  background: var(--color-surface);
  color: var(--color-navy);
  cursor: pointer;
}

.card__step:hover { background: var(--color-page); }
.card__step:disabled { cursor: progress; }

.card__quantity {
  font-weight: 600;
  font-size: calc(15 * var(--u));
  line-height: calc(20 * var(--u));
  color: var(--color-navy);
}
</style>
