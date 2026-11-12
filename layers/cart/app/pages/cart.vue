<script setup lang="ts">
/**
 * Корзина. Макет: Корзинка (1440×3684) — левая колонка 708, правая 483.
 * Пустое состояние — отдельный фрейм того же экрана.
 */
import type { Banner, Id, ProductCard } from '#shared/types/catalog'
import type { CartGroup, CartItem } from '#shared/types/cart'
const { t } = useI18n()

const cart = useCartStore()
const auth = useAuthStore()
const localePath = useLocalePath()

/**
 * Состав корзины.
 *
 * На сервере и на гидратации дожидаемся ответа. На гидратации — потому что
 * идентификатор устройства заводится только в браузере: на первом заходе сервер
 * нарисовал общую гостевую корзину, и до перезапроса на экране была бы она.
 *
 * А при переходе внутри сайта не блокируем: идентификатор уже есть, и корзина
 * открывается сразу — на месте строк, которых ещё нет, стоит скелетон.
 */
const nuxtApp = useNuxtApp()
if (import.meta.server || nuxtApp.isHydrating) await cart.loadDetail()
else cart.loadDetail()

const { data: recommended, status: recommendedStatus } = await useApiData<ProductCard[]>('cart:recommended', '/products/shelf', { query: { kind: 'recommended', limit: 5 }, lazy: true })
const { data: banners, status: bannersStatus } = await useApiData<Banner[]>('cart:banners', '/banners', { lazy: true })

/** Пока состава нет, «корзина пуста» показывать нельзя — там скелетон */
const loading = computed(() => cart.pending && !cart.detail)
const isEmpty = computed(() => !cart.detail?.items.length)

const itemsTotal = computed(() => (cart.detail?.items ?? []).reduce((sum, item) => sum + item.quantity, 0))

/**
 * `groups` only holds SELECTED items (delivery groups are computed from
 * what the buyer is actually about to pay for) - rendering purely from
 * `groups` meant unticking a row made it vanish from the screen entirely,
 * and unticking the last one left a blank panel: `isEmpty` stayed false
 * (items.length still > 0) while `groups` had nothing left to iterate.
 * Unselected rows get their own section so they stay visible and re-tickable.
 */
const unselectedItems = computed(() => (cart.detail?.items ?? []).filter(item => !item.selected))

// «Может пригодиться» открывает подборку товаров (макет 5089:126805)
const isUsefulOpen = ref(false)

const allSelected = computed(() =>
  (cart.detail?.items.length ?? 0) > 0 && cart.detail!.items.every(item => item.selected),
)

function toggleAll() {
  const lineIds = (cart.detail?.items ?? []).map(item => item.id)
  return cart.setSelected(lineIds, !allSelected.value)
}

// «В избранное» из корзины: товар уезжает в раздел избранного и уходит из корзины
// TODO: Connect to backend endpoint POST /favorites { productId }
/** Оформление доступно только вошедшему — иначе открываем вход */
function goToCheckout() {
  if (!auth.requireAuth()) return
  return navigateTo(localePath('/checkout'))
}

const toast = useToast()

/**
 * Избранное: список нужен, чтобы сердце в строке показывало настоящее
 * состояние. Раньше оно было залито всегда, будто товар уже отмечен.
 */
/** Адрес доставки общий с шапкой и оформлением */
const { selectedId: deliveryAddressId, select: selectDeliveryAddress } = useDeliveryAddress()
function chooseDeliveryAddress(id: string) {
  const address = addresses.value.find(item => item.id === id)
  if (address) selectDeliveryAddress(address)
}

const { data: favorites, refresh: refreshFavorites } = await useApiData<{ id: number }[]>('cart:favorites', '/favorites')
const favoriteIds = computed(() => new Set<Id>((favorites.value ?? []).map(item => item.id)))

/**
 * Сердце переключает избранное и только его. Раньше оно уносило товар
 * в избранное и заодно удаляло строку — рядом с корзиной это выглядело
 * как вторая кнопка удаления, чего никто не ждёт.
 */
async function toFavorites(productId: Id, next: boolean) {
  await cart.toggleFavorite(productId, next)
  await refreshFavorites()

  toast.show(
    next ? t('ui.cart.cart.tovarIzbrannom') : t('cart.removedFromFavorites'),
    'success',
    {
      label: t('common.undo'),
      run: async () => {
        await cart.toggleFavorite(productId, !next)
        await refreshFavorites()
      },
    },
  )
}

/**
 * Ноль в счётчике — это удаление. Раньше строка исчезала молча через
 * setQuantity(…, 0), а тост с отменой показывал только отдельный крестик:
 * два пути удаления, отмена у одного. Теперь путь один.
 */
function changeQuantity(item: CartItem, quantity: number) {
  if (quantity <= 0) return removeItem(item)
  return cart.setQuantity(item.skuId, quantity, item.id)
}

/** Чужая заявка — её убирает закупщик; вернуть её «от себя» нельзя, поэтому без отмены */
const isMine = (item: CartItem) => !item.requestedBy || item.requestedBy.employeeId === access.value?.employee.id

async function removeItem(item: CartItem) {
  await cart.removeItem(item.skuId, item.id)
  if (!isMine(item)) {
    toast.show(t('org.cart.requestRemoved', { name: item.requestedBy!.fullName }))
    return
  }
  // Количество до удаления — чтобы вернуть строку в прежнем виде
  const quantity = item.quantity || 1
  toast.show(t('ui.cart.cart.tovarUdalenKorziny'), 'success', {
    label: t('common.undo'),
    run: () => { cart.addItem(item.skuId, quantity) },
  })
}

/* ---------- Заявки сотрудников ---------- */

const { access } = useAccessState()
const { roleTitle } = useOrgLabels()
const { money } = useMoney()

/** Подпись группы: у закупщика группа — заявки одного человека (имя, роль, отдел, сумма) */
function groupLabel(group: CartGroup) {
  const author = group.items[0]?.requestedBy
  if (!author) return { title: group.title, kicker: group.kicker, total: '' }
  const total = group.items.reduce((acc, item) => acc + item.price.amount * item.quantity, 0)
  return {
    title: author.fullName,
    kicker: [roleTitle(author), author.departmentTitle].filter(Boolean).join(' · '),
    total: money({ amount: total, currency: 'UZS' }),
  }
}

/** Сотрудник без права оформлять: его корзина — это его заявки */
const isRequester = computed(() => (cart.detail ? !cart.detail.canCheckout : false))

// Диалоги оформления из макета: адреса (Location), карты (Card), промокоды (Procode)
const openModal = ref<'address' | 'address-details' | 'cards' | 'promo' | null>(null)

/**
 * Адреса и карты приходят с сервера, а не лежат в разметке страницы:
 * бэкенду достаточно подменить эти два эндпоинта.
 * TODO: Connect to backend endpoints GET /user/addresses, GET /user/cards
 */
type Option = { id: string, title: string, subtitle: string }

const { data: addressList } = await useApiData<Option[]>('user:addresses', '/user/addresses')
const { data: cardList } = await useApiData<Option[]>('user:cards', '/user/cards')

const addresses = computed(() => addressList.value ?? [])
const cards = computed(() => cardList.value ?? [])

/** Промокоды тоже с сервера: даты их окончания задаёт не фронт */
type Promo = { id: string, code: string, description: string, until: string }
const { data: promoList } = await useApiData<Promo[]>('cart:promos', '/cart/promocodes')
const promos = computed(() => promoList.value ?? [])

// В макете в ряду ровно три баннера
const promoRow = computed(() => {
  const list = banners.value ?? []
  return list.length ? [list[0]!, list[1] ?? list[0]!, list[0]!] : []
})

useSeoMeta({ title: () => t('ui.cart.cart.seoTitle'), robots: 'noindex, nofollow' })
</script>

<template>
  <div class="cart">
    <div class="cart__container">
      <nav class="cart__breadcrumbs" :aria-label="$t('common.hlebnyeKroshki')">
        <NuxtLink :to="localePath('/')">{{ t('breadcrumbs.home') }}</NuxtLink> / {{ t('breadcrumbs.cart') }}
      </nav>

      <!-- У пустой корзины заголовок свой -->
      <h1 v-if="loading || !isEmpty" class="cart__title">
        {{ isRequester ? $t('org.cart.myRequests') : $t('breadcrumbs.cart') }}
        <span v-if="itemsTotal" class="cart__count">{{ $t('common.itemsCount', { count: itemsTotal, word: $t('common.tovar', itemsTotal) }) }}</span>
      </h1>

      <CartSkeleton v-if="loading" />

      <CartEmpty v-else-if="isEmpty" />

      <div v-else class="cart__layout">
        <div class="cart__list">
          <!-- Was nested inside the first delivery group's header, so
               unticking every row (no group left to render) took this
               control with it - the one thing on the page that could have
               re-selected the item was gone right when it was needed. -->
          <button
            type="button"
            class="cart__select-all cart__select-all--standalone"
            :aria-pressed="allSelected"
            @click="toggleAll"
          >
            {{ t('cart.selectAll') }}
            <span class="cart__select-mark" :class="{ 'cart__select-mark--off': !allSelected }">
              <UiIcon v-if="allSelected" name="tick-square-fill" :size="28" />
            </span>
          </button>

          <section
            v-for="group in cart.detail?.groups ?? []"
            :key="group.id"
            class="cart__group"
          >
            <header class="cart__group-header">
              <div>
                <p class="cart__group-name">{{ groupLabel(group).title }}</p>
                <p class="cart__group-kicker">{{ groupLabel(group).kicker }}</p>
              </div>
              <span v-if="groupLabel(group).total" class="cart__group-total">{{ groupLabel(group).total }}</span>
            </header>

            <CartItem
              v-for="item in group.items"
              :key="item.id"
              :item="item"
              :favorite="favoriteIds.has(item.productId)"
              @quantity="changeQuantity(item, $event)"
              @select="cart.setSelected([item.id], $event)"
              @remove="removeItem(item)"
              @favorite="toFavorites(item.productId, $event)"
            />
          </section>

          <!-- Unticked rows have no delivery group (the backend only groups
               what it would actually deliver) - without this section they
               simply disappeared from the page on untick, even though the
               item was still in the cart server-side. -->
          <section v-if="unselectedItems.length" class="cart__group">
            <header class="cart__group-header">
              <p class="cart__group-name">{{ t('cart.notSelected') }}</p>
            </header>

            <CartItem
              v-for="item in unselectedItems"
              :key="item.id"
              :item="item"
              :favorite="favoriteIds.has(item.productId)"
              @quantity="changeQuantity(item, $event)"
              @select="cart.setSelected([item.id], $event)"
              @remove="removeItem(item)"
              @favorite="toFavorites(item.productId, $event)"
            />
          </section>

          <button
            type="button"
            class="cart__recommendation"
            @click="isUsefulOpen = true"
          >
            <span class="cart__recommendation-images" aria-hidden="true">
              <!-- UiImage ради заглушки: битая ссылка рисовала иконку
                   «сломанный файл» прямо в кнопке-подсказке. -->
              <UiImage
                v-for="product in (recommended ?? []).slice(0, 2)"
                :key="product.id"
                :src="product.image"
                width="40"
                height="53"
                alt=""
                class="cart__recommendation-image"
              />
            </span>

            <span class="cart__recommendation-text">
              <span class="cart__recommendation-title">{{ t('cart.useful') }}</span>
              <span class="cart__recommendation-subtitle">{{ t('cart.usefulNote') }}</span>
            </span>

            <UiIcon name="alt-arrow-right" color="currentColor" :size="23.6" class="cart__recommendation-chevron" />
          </button>
        </div>

        <CartSummary
          v-if="cart.detail"
          class="sticky-aside"
          :cart="cart.detail"
          @checkout="goToCheckout"
        />
      </div>
    </div>

    <AppChoiceModal
      :model-value="openModal === 'address'"
      :title="$t('common.vyberiteAdresDostavki')"
      :options="addresses"
      :value="deliveryAddressId ?? undefined"
      :action-label="$t('common.addAddress')"
      @select="chooseDeliveryAddress($event)"
      @update:model-value="openModal = null"
      @add="openModal = 'address-details'"
    />

    <AppChoiceModal
      :model-value="openModal === 'cards'"
      :title="$t('ui.cart.cart.vseKarty')"
      :hint="$t('ui.cart.cart.vyberiteKartuOplaty')"
      :options="cards"
      :action-label="$t('common.addCard')"
      @update:model-value="openModal = null"
    />

    <LazyCartUsefulModal v-model="isUsefulOpen" :products="recommended ?? []" />

    <LazyAppAddressDetailsModal
      :model-value="openModal === 'address-details'"
      @update:model-value="openModal = null"
      @submit="openModal = null"
    />

    <LazyAppPromoModal
      :model-value="openModal === 'promo'"
      :promos="promos"
      @update:model-value="openModal = null"
    />

    <HomePromoBanners :banners="promoRow" :loading="bannersStatus === 'pending'" />
    <HomeShelf
      :title="$t('home.recommended')"
      :more-link="localePath('/search?kind=recommended')"
      :products="recommended ?? []"
      :loading="recommendedStatus === 'pending'"
    />
  </div>
</template>

<style scoped>
.cart { display: flex; flex-direction: column; }

.cart__container {
  width: 1240px;
  margin-inline: auto;
  padding-bottom: var(--section-gap);
}

.cart__breadcrumbs {
  padding-top: 24px;
  padding-bottom: 16px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.cart__title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 0 0 24px;
  font: var(--type-page-title);
  color: var(--color-text);
}

.cart__count {
  font-family: var(--font-ui);
  font-weight: 400;
  font-size: var(--text-base);
  letter-spacing: 0;
  color: var(--color-text-muted);
}

.cart__layout { display: flex; gap: 30px; align-items: flex-start; }

.cart__list { width: 708px; }

.cart__group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.cart__group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 4px;
}

.cart__group-name {
  margin: 0;
  font-weight: 700;
  font-size: var(--text-2xl);
  line-height: 28px;
  color: var(--color-text);
}

.cart__group-kicker {
  margin: 2px 0 0;
  font-weight: 400;
  font-size: var(--text-sm);
  line-height: 20px;
  color: var(--color-text-muted);
}

.cart__select-all {
  display: flex;
  align-items: center;
  gap: 9.4px;
  padding: 0;
  border: 0;
  background: none;
  font-weight: 500;
  /* Макет: «Выбрать все» Inter 16.45/19.91 w500 */
  font-size: var(--text-base);
  line-height: 19.91px;
  color: var(--color-text);
  cursor: pointer;
}

/* Раньше жил внутри заголовка первой группы; отдельно снаружи ей нужен
   свой отступ и выравнивание по правому краю колонки. */
.cart__select-all--standalone {
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 8px;
  padding: 0 16px 0 0;
}

.cart__select-mark {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: transparent;
  font-size: var(--text-sm);
  color: var(--color-text);
}

.cart__select-mark--off {
  background: transparent;
  box-shadow: inset 0 0 0 1.5px var(--color-line);
}

.cart__recommendation {
  display: flex;
  align-items: center;
  gap: 17.7px;
  width: 100%;
  height: 88px;
  padding-inline: 16px;
  border: 0;
  border-radius: 24px;
  background: var(--color-surface);
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.cart__recommendation:hover { background: var(--color-field); }

.cart__recommendation-images { display: flex; gap: 4px; }

.cart__recommendation-image + .cart__recommendation-image { margin-left: -19.2px; }

.cart__recommendation-text { flex: 1; display: flex; flex-direction: column; gap: 3px; }

.cart__recommendation-title {
  font-weight: 600;
  font-size: var(--text-xl);
  line-height: 24px;
  color: var(--color-text);
}

.cart__recommendation-subtitle {
  font-weight: 400;
  font-size: var(--text-sm);
  line-height: 20px;
  color: var(--color-text-muted);
}

.cart__recommendation-chevron { font-size: var(--text-4xl); color: var(--color-text); }

.cart__group-total { flex: none; font-weight: 600; font-size: var(--text-base); color: var(--color-text); }
</style>
