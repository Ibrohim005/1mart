<script setup lang="ts">
/**
 * Правая колонка карточки товара: цена, название, выбор опций и кнопки.
 * Макет: marketplace-web-page → Frame 2147226444 (479×614.6).
 */
import type { OptionGroup, Product } from '#shared/types/catalog'

const props = defineProps<{ product: Product }>()
const { money } = useMoney()
const { t } = useI18n()

const cart = useCartStore()
const auth = useAuthStore()
const localePath = useLocalePath()
const router = useRouter()
const pending = ref(false)

const selected = reactive<Record<string, string>>(
  Object.fromEntries(props.product.optionGroups.map(group => [group.code, group.selected])),
)

/**
 * Подпись выбранного значения для заголовка группы («МАСТЬ: Вороная»).
 *
 * `selected` хранит машинное значение — по нему сопоставляется SKU, — а
 * показывать надо переведённое. Без этого заголовок печатал «МАСТЬ: Qora».
 */
function selectedLabel(group: OptionGroup): string {
  const value = selected[group.code]
  if (!value) return ''
  return group.values.find(option => option.value === value)?.label ?? value
}

const isDeepDiscount = computed(() => (props.product.discountPercent ?? 0) >= 50)

// Процент рядом с ценой уже говорит о скидке, «Стало дешевле» рядом лишнее
const badges = computed(() => props.product.badges.filter(
  badge => !(badge.kind === 'cheaper' && props.product.discountPercent),
))

const reviewsLabel = computed(() => t('ui.shared.productCard.reviewsCount', {
  count: props.product.reviewsCount,
  word: t('common.otzyv', props.product.reviewsCount),
}))

/**
 * Вариант, который выбран прямо сейчас.
 *
 * Раньше брался `skus[0]`: человек переключал «Бык» на «Тёлку», цена не
 * менялась, а в корзину уходил всё тот же вариант. Сопоставляем выбор
 * с составом варианта — по значениям групп, у которых есть из чего выбирать.
 */
const currentSku = computed(() => {
  const wanted = props.product.optionGroups
    .filter(group => group.values.length > 1)
    .map((group) => {
      const value = group.values.find(item => item.value === selected[group.code])
      return { code: group.code, label: value?.label ?? '' }
    })

  const match = props.product.skus.find(sku =>
    wanted.every(item => sku.options.some(option => option.code === item.code && option.value === item.label)),
  )

  return match ?? props.product.skus[0] ?? null
})

const skuId = computed(() => currentSku.value?.id ?? 0)

/**
 * Цена и остаток идут за выбранным вариантом, а не за первым в списке.
 * У товара `available` — признак «есть в продаже», у варианта — число штук.
 */
const price = computed(() => currentSku.value?.price ?? props.product.price)
const fullPrice = computed(() => currentSku.value?.fullPrice ?? props.product.fullPrice)
const available = computed(() => currentSku.value?.available ?? (props.product.available ? 1 : 0))

/**
 * Счётчик рисуем только после монтирования: на сервере корзина ещё не
 * прочитана, и разметка разошлась бы с клиентской при гидратации.
 */
const mounted = ref(false)
onMounted(() => (mounted.value = true))

const quantity = computed(() => cart.quantityOf(skuId.value))
const inCart = computed(() => mounted.value && quantity.value > 0)

/** −1 на единице убирает товар из корзины, как в карточке списка */
async function change(delta: number) {
  if (!skuId.value) return
  pending.value = true
  try {
    const next = quantity.value + delta
    if (next <= 0) await cart.removeItem(skuId.value)
    else await cart.setQuantity(skuId.value, next)
  }
  finally {
    pending.value = false
  }
}

/** «Купить в 1 клик»: добавляем в корзину и сразу открываем оформление */
async function buyNow() {
  if (!auth.requireAuth()) return
  await addToCart()
  await router.push(localePath('/checkout'))
}

async function addToCart() {
  const sku = currentSku.value
  if (!sku) return
  pending.value = true
  try {
    await cart.addItem(sku.id, 1)
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <aside class="buybox">
    <!-- Карточка с ценой -->
    <div class="buybox__card buybox__card--price">
      <p v-if="fullPrice" class="buybox__old-line">
        <s class="buybox__old-price">{{ money(fullPrice) }}</s>
        <UiBadge
          v-for="badge in badges"
          :key="badge.kind"
          v-bind="badge"
          class="buybox__badge"
        />
      </p>

      <p class="buybox__price-line">
        <span class="buybox__price">{{ money(price) }}</span>
        <span
          v-if="product.discountPercent"
          class="buybox__discount"
          :class="{ 'buybox__discount--deep': isDeepDiscount }"
        >↓{{ product.discountPercent }}%</span>
      </p>
    </div>

    <!-- Карточка с названием и выбором опций -->
    <div class="buybox__card buybox__card--options">
      <h1 class="buybox__title">{{ product.title }}</h1>

      <a v-if="product.reviewsCount" href="#reviews" class="buybox__rating">
        <UiIcon name="star-fill" :size="16" color="#FFB800" />
        <span class="buybox__rating-value">{{ product.rating.toFixed(1) }}</span>
        <span class="buybox__rating-count">{{ reviewsLabel }}</span>
      </a>

      <!--
        Ноль здесь хуже пустоты: «0 человек купили на этой неделе» — это
        довод ПРОТИВ покупки, напечатанный там, где задумывалось social
        proof. Бэкенд честно отдаёт 0, когда покупок не было, поэтому строка
        просто не рисуется. Фраза была вшита по-русски и на узбекской версии
        оставалась русской.
      -->
      <p v-if="product.buyersThisWeek > 0" class="buybox__buyers">
        <UiIcon name="shopping-bag" :size="20" color="currentColor" />
        {{ $t('pdp.buyersThisWeek', product.buyersThisWeek, { named: { count: product.buyersThisWeek } }) }}
      </p>

      <hr class="buybox__divider">

      <section
        v-for="group in product.optionGroups"
        :key="group.code"
        class="buybox__group"
      >
        <h2 class="buybox__group-title">
          {{ group.title }}<template v-if="selectedLabel(group)">: <span class="buybox__group-value">{{ selectedLabel(group) }}</span></template>
        </h2>

        <div v-if="group.kind === 'color'" class="buybox__colors">
          <button
            v-for="value in group.values"
            :key="value.value"
            type="button"
            class="buybox__color"
            :class="{ 'buybox__color--selected': selected[group.code] === value.value }"
            :aria-label="value.label"
            @click="selected[group.code] = value.value"
          >
            <UiImage v-if="value.image" :src="value.image" :alt="value.label" width="54" height="54" />
          </button>
        </div>

        <div v-else class="buybox__chips">
          <button
            v-for="value in group.values"
            :key="value.value"
            type="button"
            class="buybox__chip"
            :class="{
              'buybox__chip--selected': selected[group.code] === value.value,
              'buybox__chip--disabled': !value.available,
            }"
            :disabled="!value.available"
            @click="selected[group.code] = value.value"
          >
            {{ value.label }}
          </button>
        </div>
      </section>

      <p v-if="product.deliveryNote" class="buybox__delivery">
        <UiIcon name="tick-circle-fill" :size="18" class="buybox__check" />
        {{ product.deliveryNote }}
      </p>

      <div class="buybox__meta">
        <span v-if="available > 0" class="buybox__stock">
          {{ $t('pdp.stockCount', { n: available }) }}
        </span>
        <span v-else-if="available === 0" class="buybox__stock buybox__stock--out">
          {{ $t('catalog.outOfStock') }}
        </span>
        <span v-if="currentSku?.barcode" class="buybox__sku">
          {{ $t('pdp.sku') }}: {{ currentSku.barcode }}
        </span>
      </div>
    </div>

    <!-- Кнопки -->
    <div class="buybox__actions">
      <!--
        Остаток берётся у выбранного варианта: нельзя предлагать в корзину
        то, чего нет именно в этой комбинации.
      -->
      <button
        v-if="!inCart"
        type="button"
        class="buybox__add"
        :disabled="pending || available <= 0"
        @click="addToCart"
      >
        <UiIcon v-if="available > 0" name="shopping-bag" :size="20" color="currentColor" />
        <span>{{ available > 0 ? $t('ui.pdp.buyBox.dobavitKorzinu') : $t('catalog.outOfStock') }}</span>
      </button>

      <!-- Товар в корзине: кнопка становится счётчиком, как в карточке списка -->
      <div v-else class="buybox__counter">
        <button
          type="button"
          class="buybox__step"
          :disabled="pending"
          :aria-label="quantity <= 1 ? $t('common.removeFromCart') : $t('common.decreaseQuantity')"
          @click="change(-1)"
        >
          <UiIcon :name="quantity <= 1 ? 'trash' : 'minus'" :size="22" />
        </button>

        <span class="buybox__quantity">{{ quantity }}</span>

        <button
          type="button"
          class="buybox__step"
          :disabled="pending"
          :aria-label="$t('common.uvelichitKolichestvo')"
          @click="change(1)"
        >
          <UiIcon name="add" :size="24" />
        </button>
      </div>

      <button type="button" class="buybox__oneclick" :disabled="pending || available <= 0" @click="buyNow">{{ $t('ui.pdp.buyBox.kupit1Klik') }}</button>
    </div>

    <!-- Чем можно заплатить — до оформления, без рассрочек и кредитов -->
    <p class="buybox__pay-hint">
      <UiIcon name="card" :size="18" />
      {{ $t('pay.pdp.buyBoxHint') }}
    </p>
  </aside>
</template>

<style scoped>
.buybox {
  display: flex;
  flex-direction: column;
  gap: 13.4px;
  width: 479px;
}

.buybox__card {
  padding: 17.9px;
  border-radius: 22.4px;
  background: var(--color-surface);
}

/* ---------- Цена ---------- */

.buybox__old-line {
  display: flex;
  align-items: center;
  gap: 13.6px;
  margin: 0 0 9px;
}

.buybox__old-price {
  font-weight: 400;
  font-size: var(--text-xl);
  line-height: 22.5px;
  color: var(--color-text-muted);
}

.buybox__badge { height: 23.2px; border-radius: 14.4px; font-size: var(--text-sm); line-height: 16.9px; }

.buybox__price-line {
  display: flex;
  align-items: center;
  gap: 23px;
  margin: 0;
}

.buybox__price {
  font-weight: 700;
  font-size: var(--text-9xl);
  line-height: 39.6px;
  color: var(--color-text);
}

.buybox__discount {
  display: inline-flex;
  align-items: center;
  height: 38.5px;
  padding-inline: 13.2px;
  border-radius: 204px;
  background: var(--badge-discount-bg);
  font-weight: 600;
  font-size: var(--text-2xl);
  line-height: 24.7px;
  color: var(--color-navy);
}

.buybox__discount--deep { background: var(--badge-discount-deep-bg); }

/* ---------- Название и опции ---------- */

.buybox__title {
  margin: 0;
  font: var(--type-section-title);
  color: var(--color-text);
}

.buybox__rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: var(--text-sm);
  line-height: 20px;
  text-decoration: none;
}
.buybox__rating-value { font-weight: 600; color: var(--color-text); }
.buybox__rating-count { color: var(--color-text-muted); }
.buybox__rating:hover .buybox__rating-count { color: var(--color-brand-text); }

.buybox__buyers {
  display: flex;
  align-items: center;
  gap: 4.7px;
  margin: 5.4px 0 0;
  font-weight: 600;
  font-size: var(--text-md);
  line-height: 20px;
  color: var(--color-brand-text);
}

.buybox__divider {
  margin: 15.2px 0 17.9px;
  border: 0;
  border-top: 1px solid #EBEFF2;
}

.buybox__group { margin-bottom: 22.4px; }

.buybox__group-title {
  margin: 0 0 8.3px;
  font-weight: 600;
  font-size: var(--text-2xs);
  line-height: 15.1px;
  color: #90949C;
  text-transform: uppercase;
}

/* Выбранное значение в заголовке группы («ВЕС: 15KG»). Подпись остаётся
   приглушённой, а сам выбор читается как текст — это он отвечает на вопрос
   «что я сейчас покупаю», когда чипов больше, чем помещается в строку. */
.buybox__group-value {
  color: var(--color-text, #1F2026);
}

.buybox__colors { display: flex; gap: 8.3px; }

.buybox__color {
  display: grid;
  place-items: center;
  width: 58.1px;
  height: 58.1px;
  padding: 0;
  border: 2.1px solid transparent;
  border-radius: 8.3px;
  background: none;
  cursor: pointer;
  overflow: hidden;
}

.buybox__color--selected { border-color: var(--color-brand); }
.buybox__color :deep(img) { width: 53.9px; height: 53.9px; border-radius: 6.2px; object-fit: cover; }

.buybox__chips { display: flex; gap: 6.2px; }

.buybox__chip {
  height: 31.6px;
  padding-inline: 14.5px;
  border: 1.04px solid #EBEFF2;
  border-radius: 8.3px;
  background: var(--color-surface);
  font-weight: 400;
  font-size: var(--text-2xs);
  line-height: 15.2px;
  color: #66686E;
  cursor: pointer;
}

.buybox__chip--selected {
  border-color: #111111;
  font-weight: 600;
  color: #111111;
}

.buybox__chip--disabled {
  background: rgb(242 244 247 / 25%);
  cursor: not-allowed;
}

.buybox__delivery {
  display: flex;
  align-items: center;
  gap: 7.9px;
  margin: 0;
  font-weight: 400;
  font-size: var(--text-base);
  line-height: 19.1px;
  color: #66686E;
}

.buybox__check { color: var(--color-brand-text); }

.buybox__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.buybox__stock {
  font-size: var(--text-sm);
  line-height: 16.9px;
  color: var(--color-brand-text);
  font-weight: 500;
}

.buybox__stock--out { color: #90949C; }

.buybox__sku {
  font-size: var(--text-sm);
  line-height: 16.9px;
  color: #90949C;
}

/* ---------- Кнопки ---------- */

.buybox__actions { display: flex; gap: 13.4px; }

.buybox__add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7.2px;
  width: 264.6px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.buybox__add:hover:not(:disabled) { background: var(--color-brand-dark); }
.buybox__add:disabled { background: var(--color-field); color: var(--color-text-muted); cursor: not-allowed; }

/* Счётчик занимает место кнопки — размеры и радиус те же */
.buybox__counter {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  height: 55px;
  padding: 5px;
  border-radius: 12px;
  background: #EDF0F4;
}

.buybox__step {
  display: grid;
  place-items: center;
  width: 45px;
  height: 45px;
  border: 0;
  border-radius: 9px;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
}

.buybox__step:disabled { opacity: .7; cursor: progress; }

.buybox__quantity {
  font-weight: 700;
  font-size: var(--text-xl);
  line-height: 22px;
  color: var(--color-text);
}

.buybox__oneclick {
  width: 201px;
  border: 1.5px solid var(--color-text);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.buybox__pay-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0 0;
  font-size: var(--text-sm);
  line-height: 18px;
  color: var(--color-text-muted);
}

.buybox__oneclick:hover:not(:disabled) { background: var(--color-text); color: var(--color-surface); }
.buybox__oneclick:disabled { border-color: var(--color-line); color: var(--color-text-muted); cursor: not-allowed; }
</style>
