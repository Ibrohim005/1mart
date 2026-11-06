<script setup lang="ts">
/**
 * Оформление заказа 1mart (ТЗ UC-FL-10).
 *
 * Только B2B. Шаги: адрес и способ доставки → итоги (товары + доставка + комиссия) →
 * оплата с баланса компании (подтверждение на странице) или корпоративной картой
 * (SMS-код) → резерв средств и передача заказа продавцу → экран с номером заказа,
 * id транзакции и чеком. После подтверждения деньги уходят на расчётный счёт продавца.
 *
 * Альтернативы: А1 — товара нет в наличии (предлагаем убрать),
 * А3 — не хватает денег (пополнить баланс, другая карта или другой способ).
 * А2 (отказ продавца) происходит позже и видна в «Моих заказах».
 *
 * Оформление закрыто от гостя: адрес, телефон и реквизиты — данные компании.
 */
import type { BalanceOverview, DeliveryProvider, DeliveryType, PaymentCardInfo, PaymentMethod } from '#shared/types/order'
import type { CourierOption, PickupOption } from '../../components/DeliveryCard.vue'
import type { StockIssueView } from '../../components/StockModal.vue'
import type { PlacementResult } from '../../components/Success.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const { providerName } = use1mart()
const cart = useCartStore()
const localePath = useLocalePath()
const api = useApi()
const toast = useToast()

await cart.loadDetail()

type Modal = 'address' | 'address-details' | 'promo' | 'add-promo' | 'confirm' | 'otp' | 'funds' | 'stock'
  | 'add-card' | 'error'
const openModal = ref<Modal | null>(null)

/* ---------- Адрес и получатель ---------- */

type Option = { id: string, title: string, subtitle: string }

const { data: addressList } = await useApiData<Option[]>('checkout:addresses', '/user/addresses')
const { data: profile } = await useApiData<{ name: string, phone: string }>('checkout:profile', '/user/profile')

const addresses = ref<Option[]>([...(addressList.value ?? [])])

// Стартовый адрес — выбранный в шапке; список может быть пустым у нового покупателя
const { selectedId: headerAddressId, select: selectDeliveryAddress } = useDeliveryAddress()
const selectedAddressId = ref<Option['id'] | null>(
  addresses.value.find(item => item.id === headerAddressId.value)?.id ?? addresses.value[0]?.id ?? null,
)

watch(selectedAddressId, (id) => {
  const address = addresses.value.find(item => item.id === id)
  if (address) selectDeliveryAddress(address)
})
const selectedAddress = computed(
  () => addresses.value.find(item => item.id === selectedAddressId.value) ?? addresses.value[0] ?? null,
)

async function saveAddress(details: {
  flat: string
  entrance: string
  floor: string
  intercom: string
  comment: string
  lat: number
  lng: number
}) {
  const note = [
    details.entrance && t('ui.checkout.checkout.addressPartEntrance', { value: details.entrance }),
    details.floor && t('ui.checkout.checkout.addressPartFloor', { value: details.floor }),
    details.flat && t('ui.checkout.checkout.addressPartFlat', { value: details.flat }),
  ].filter(Boolean).join(', ')

  try {
    const saved = await api.post<{ id: string, title: string, subtitle: string }>('/user/addresses', details)
    addresses.value = [
      ...addresses.value,
      {
        id: saved.id,
        title: saved.title || t('ui.checkout.checkout.addressMapPoint', { lat: details.lat.toFixed(5), lng: details.lng.toFixed(5) }),
        subtitle: note || saved.subtitle || t('ui.checkout.checkout.addressNoDetails'),
      },
    ]
    selectedAddressId.value = saved.id
    openModal.value = null
  }
  catch {
    toast.show(t('ui.checkout.checkout.addressSaveError'), 'error')
  }
}

/* ---------- Промокоды ---------- */

type Promo = { id: string, code: string, description: string, percent: number, freeDelivery?: boolean, until: string }
const { data: promoList } = await useApiData<Promo[]>('checkout:promos', '/checkout/promocodes', { lazy: true })
const promos = computed(() => promoList.value ?? [])
const appliedPromo = ref<Promo | null>(null)

function applyPromo(code: string) {
  appliedPromo.value = promos.value.find(item => item.code === code) ?? null
  openModal.value = null
}

/* ---------- Доставка и оплата ---------- */

const deliveryType = ref<DeliveryType>('courier')
const provider = ref<DeliveryProvider | null>('express24')
const pickupPointId = ref<string | null>('pp1')

const { data: cardList, refresh: refreshCards } = await useApiData<PaymentCardInfo[]>('checkout:cards', '/user/cards')
const cards = computed(() => cardList.value ?? [])

// Карта по умолчанию — первая привязанная
const cardId = ref<string | null>(cards.value[0]?.id ?? null)

const { data: balance, refresh: refreshBalance } = await useApiData<BalanceOverview>('checkout:balance', '/balance')
const available = computed(() => balance.value?.available.amount ?? 0)

const paymentMethod = ref<PaymentMethod>('balance')
const comment = ref('')

// С пополнения возвращаются на эту же страницу: сумма могла измениться
onMounted(refreshBalance)

/** Одно тело на расчёт, запрос кода и заказ — сумма под кодом совпадёт с суммой заказа */
const checkoutBody = () => ({
  paymentMethod: paymentMethod.value,
  cardId: paymentMethod.value === 'card' ? cardId.value : null,
  deliveryType: deliveryType.value,
  provider: deliveryType.value === 'courier' ? provider.value : null,
  pickupPointId: deliveryType.value === 'pickupPoint' ? pickupPointId.value : null,
  addressId: selectedAddressId.value,
  promoCode: appliedPromo.value?.code ?? null,
  comment: comment.value.trim() || null,
})

type Quote = {
  goods: number
  promoAmount: number
  delivery: number
  commission: number
  payable: number
  deliveryType: DeliveryType
  provider: DeliveryProvider | null
  couriers: CourierOption[]
  pickupPoints: PickupOption[]
  stockIssues: StockIssueView[]
  deliveryBlocked: Array<{ sellerId: string, sellerTitle: string, reason: string }>
}

const { data: quote, status: quoteStatus, refresh: refreshQuote } = await useApiData<Quote>('checkout:quote', '/checkout/quote', {
  method: 'POST',
  body: checkoutBody,
  watch: [appliedPromo, selectedAddressId, deliveryType, provider, pickupPointId],
})

const payable = computed(() => quote.value?.payable ?? cart.detail?.total.amount ?? 0)
const stockIssues = computed(() => quote.value?.stockIssues ?? [])

/** Доставка бесплатна, только если сервер её уже посчитал и ничто не мешает доставить */
const isDeliveryFree = computed(() => Boolean(quote.value) && quote.value!.delivery === 0 && !quote.value!.deliveryBlocked?.length)

const deliveryLabel = computed(() => (deliveryType.value === 'courier'
  ? providerName(provider.value)
  : t('pay.delivery.pickup')))

const thumbnails = computed(() => (cart.detail?.items ?? [])
  .filter(item => item.selected)
  .map(item => item.product.image)
  .slice(0, 6))

/* ---------- А1: нет в наличии ---------- */

const removing = ref(false)

async function removeStock(skuIds: Array<number | string>) {
  removing.value = true
  try {
    for (const skuId of skuIds) await cart.removeItem(skuId)
    await refreshQuote()
    if (!stockIssues.value.length) openModal.value = null
    if (!cart.detail?.items.some(item => item.selected)) await navigateTo(localePath('/cart'))
  }
  finally {
    removing.value = false
  }
}

/* ---------- А3: не хватает денег ---------- */

/** Сколько требовалось — показываем в окне «Недостаточно средств» */
const fundsRequired = ref(0)

/** Пополнение с уже подставленной суммой нехватки, сумма в сумах */
const topUpLink = computed(() => {
  const missing = Math.ceil(Math.max((fundsRequired.value || payable.value) - available.value, 0) / 100)
  return localePath(`/account/balance?amount=${missing}&from=checkout`)
})

function switchMethod(next: PaymentMethod) {
  paymentMethod.value = next
  openModal.value = null
}

function chooseOtherCard() {
  const other = cards.value.find(card => card.id !== cardId.value)
  if (other) cardId.value = other.id
  openModal.value = null
}

function onCardSaved(card: PaymentCardInfo) {
  refreshCards()
  cardId.value = card.id
  openModal.value = null
  toast.show(t('pay.addCard.done'))
}

/* ---------- Оплата: баланс — подтверждение, карта — SMS-код ---------- */

const paying = ref(false)
const otp = reactive({
  id: '',
  phone: '',
  expiresAt: 0,
  attemptsLeft: 3,
  lockedUntil: 0,
  testCode: '',
  error: '',
})
const placement = ref<PlacementResult | null>(null)

type CheckoutOutcome =
  | { status: 'sent', otpId: string, expiresIn: number, attemptsLeft: number, phone: string, testCode: string }
  | { status: 'locked', lockedUntil: string }
  | { status: 'outOfStock', items: StockIssueView[] }
  | { status: 'insufficientFunds', required: number }
  | { status: 'insufficientBalance', required: number, available: number }
  | { status: 'cardRequired' }
  | { status: 'empty' }

/** Общий разбор исходов, после которых заказ не создаётся */
async function handleProblem(outcome: Exclude<CheckoutOutcome, { status: 'sent' }>) {
  if (outcome.status === 'locked') {
    otp.lockedUntil = new Date(outcome.lockedUntil).getTime()
    openModal.value = 'otp'
  }
  else if (outcome.status === 'outOfStock') {
    await refreshQuote()
    openModal.value = 'stock'
  }
  else if (outcome.status === 'insufficientFunds' || outcome.status === 'insufficientBalance') {
    fundsRequired.value = outcome.required
    await refreshBalance()
    openModal.value = 'funds'
  }
  else if (outcome.status === 'cardRequired') {
    openModal.value = 'add-card'
  }
  else {
    await navigateTo(localePath('/cart'))
  }
}

function pay() {
  if (paying.value) return
  // Курьеру некуда ехать: сначала адрес, потом уже оплата
  if (deliveryType.value === 'courier' && !selectedAddress.value) {
    openModal.value = 'address'
    return
  }
  if (stockIssues.value.length) {
    openModal.value = 'stock'
    return
  }
  if (paymentMethod.value === 'balance') {
    if (available.value < payable.value) {
      fundsRequired.value = payable.value
      openModal.value = 'funds'
      return
    }
    openModal.value = 'confirm'
    return
  }
  if (!cardId.value) {
    openModal.value = 'add-card'
    return
  }
  requestOtp()
}

async function payFromBalance() {
  paying.value = true
  try {
    await placeOrder()
  }
  catch {
    openModal.value = 'error'
  }
  finally {
    paying.value = false
  }
}

async function requestOtp() {
  paying.value = true
  otp.error = ''
  try {
    const outcome = await api.post<CheckoutOutcome>('/checkout/otp', checkoutBody())
    if (outcome.status !== 'sent') return handleProblem(outcome)

    otp.id = outcome.otpId
    otp.phone = outcome.phone
    otp.expiresAt = Date.now() + outcome.expiresIn * 1000
    otp.attemptsLeft = outcome.attemptsLeft
    otp.lockedUntil = 0
    otp.testCode = outcome.testCode
    // Демо: SMS-шлюза нет — код дублируется в консоль
    console.info(`[1mart demo] SMS code: ${outcome.testCode}`)
    openModal.value = 'otp'
  }
  catch {
    openModal.value = 'error'
  }
  finally {
    paying.value = false
  }
}

type VerifyOutcome =
  | { status: 'ok', token: string }
  | { status: 'wrong', attemptsLeft: number }
  | { status: 'expired' }
  | { status: 'locked', lockedUntil: string }

async function verifyOtp(code: string) {
  paying.value = true
  otp.error = ''
  try {
    const result = await api.post<VerifyOutcome>('/checkout/otp/verify', { otpId: otp.id, code })
    if (result.status === 'wrong') {
      otp.attemptsLeft = result.attemptsLeft
      otp.error = t('pay.otp.wrong', { n: result.attemptsLeft })
      return
    }
    if (result.status === 'expired') {
      otp.expiresAt = Date.now()
      otp.error = t('pay.otp.expired')
      return
    }
    if (result.status === 'locked') {
      otp.lockedUntil = new Date(result.lockedUntil).getTime()
      return
    }
    await placeOrder(result.token)
  }
  catch {
    otp.error = t('pay.otp.failed')
  }
  finally {
    paying.value = false
  }
}

async function placeOrder(otpToken?: string) {
  const outcome = await api.post<PlacementResult & { status: 'placed' } | Exclude<CheckoutOutcome, { status: 'sent' }>>(
    '/orders',
    { ...checkoutBody(), otpToken },
  )
  if (outcome.status !== 'placed') return handleProblem(outcome)

  placement.value = outcome
  openModal.value = null
  await Promise.all([cart.loadSummary(), cart.loadDetail(), refreshBalance()])
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

useSeoMeta({ title: () => t('pay.checkout.seoTitle'), robots: 'noindex, nofollow' })
</script>

<template>
  <div class="checkout">
    <div class="checkout__container">
      <nav class="checkout__breadcrumbs" :aria-label="$t('common.hlebnyeKroshki')">
        <NuxtLink :to="localePath('/')">{{ t('breadcrumbs.home') }}</NuxtLink> /
        <NuxtLink :to="localePath('/cart')">{{ $t('breadcrumbs.cart') }}</NuxtLink> / {{ $t('breadcrumbs.checkout') }}
      </nav>

      <!-- У экрана успеха заголовок свой -->
      <h1 v-if="!placement" class="checkout__title">{{ $t('breadcrumbs.checkout') }}</h1>

      <CheckoutSuccess v-if="placement" :result="placement" />

      <div v-else-if="!cart.detail?.items.some(item => item.selected)" class="checkout__empty">
        <p>{{ $t('pay.checkout.empty') }}</p>
        <NuxtLink :to="localePath('/cart')" class="checkout__empty-link">{{ $t('breadcrumbs.cart') }}</NuxtLink>
      </div>

      <div v-else class="checkout__layout">
        <div class="checkout__left">
          <!-- А1 видно до оплаты: позиция подсвечена и её можно убрать -->
          <div v-if="stockIssues.length" class="checkout__stock" role="alert">
            <p class="checkout__stock-title">{{ $t('pay.stock.title') }}</p>
            <ul class="checkout__stock-list">
              <li v-for="item in stockIssues" :key="item.skuId" class="checkout__stock-item">
                <UiImage :src="item.image" :alt="item.title" width="48" height="48" class="checkout__stock-image" />
                <span class="checkout__stock-name">{{ item.title }}</span>
                <span class="checkout__stock-note">{{ $t('pay.stock.itemNote', { n: item.requested }) }}</span>
                <button type="button" class="checkout__stock-remove" :disabled="removing" @click="removeStock([item.skuId])">
                  {{ $t('pay.stock.remove') }}
                </button>
              </li>
            </ul>
          </div>

          <CheckoutDeliveryCard
            v-model:delivery-type="deliveryType"
            v-model:provider="provider"
            v-model:pickup-point-id="pickupPointId"
            :address="selectedAddress?.title ?? $t('ui.checkout.checkout.addressEmpty')"
            :address-note="selectedAddress?.subtitle ?? ''"
            :recipient-name="profile?.name ?? ''"
            :recipient-phone="profile?.phone ?? ''"
            :couriers="quote?.couriers ?? []"
            :pickup-points="quote?.pickupPoints ?? []"
            :free="isDeliveryFree"
            @change="openModal = 'address'"
          />

          <CheckoutOrderDocuments />

          <CheckoutPaymentCard
            v-model:method="paymentMethod"
            v-model:card-id="cardId"
            :cards="cards"
            :available="available"
            :payable="payable"
            :top-up-link="topUpLink"
            @add-card="openModal = 'add-card'"
          />

          <CheckoutOrderComment v-model="comment" />
        </div>

        <CheckoutOrderSummary
          v-if="cart.detail"
          class="sticky-aside"
          :cart="cart.detail"
          :thumbnails="thumbnails"
          :promos="promos"
          :promo="appliedPromo"
          :promo-amount="quote?.promoAmount ?? 0"
          :delivery="quote?.delivery ?? 0"
          :delivery-label="deliveryLabel"
          :commission="quote?.commission ?? 0"
          :delivery-blocked="quote?.deliveryBlocked ?? []"
          :payable="payable"
          :busy="paying"
          :quoting="quoteStatus === 'pending'"
          :stock-blocked="stockIssues.length > 0"
          @promo="openModal = 'promo'"
          @pay="pay"
        />
      </div>
    </div>

    <AppChoiceModal
      :model-value="openModal === 'address'"
      :title="$t('common.vyberiteAdresDostavki')"
      :options="addresses"
      :value="selectedAddressId ?? undefined"
      :action-label="$t('common.addAddress')"
      @select="selectedAddressId = $event"
      @update:model-value="openModal = $event ? 'address' : null"
      @add="openModal = 'address-details'"
    />

    <LazyAppAddressDetailsModal
      :model-value="openModal === 'address-details'"
      @update:model-value="openModal = null"
      @submit="saveAddress"
    />

    <LazyAppPromoModal
      :model-value="openModal === 'promo'"
      :promos="promos"
      @update:model-value="openModal = $event ? 'promo' : null"
      @apply="applyPromo"
    />

    <AppAddPromoModal
      :model-value="openModal === 'add-promo'"
      @update:model-value="openModal = null"
      @apply="openModal = null"
    />

    <CheckoutConfirmPayModal
      :model-value="openModal === 'confirm'"
      :amount="payable"
      :available="available"
      :busy="paying"
      @update:model-value="openModal = $event ? 'confirm' : null"
      @confirm="payFromBalance"
    />

    <CheckoutOtpModal
      :model-value="openModal === 'otp'"
      :phone="otp.phone"
      :expires-at="otp.expiresAt"
      :attempts-left="otp.attemptsLeft"
      :locked-until="otp.lockedUntil"
      :test-code="otp.testCode"
      :error="otp.error"
      :busy="paying"
      @update:model-value="openModal = $event ? 'otp' : null"
      @verify="verifyOtp"
      @resend="requestOtp"
    />

    <CheckoutFundsModal
      :model-value="openModal === 'funds'"
      :method="paymentMethod"
      :required="fundsRequired"
      :available="available"
      :top-up-link="topUpLink"
      :has-other-card="cards.length > 1"
      @update:model-value="openModal = $event ? 'funds' : null"
      @other-card="chooseOtherCard"
      @use-card="switchMethod('card')"
      @use-balance="switchMethod('balance')"
      @add-card="openModal = 'add-card'"
    />

    <CheckoutStockModal
      :model-value="openModal === 'stock'"
      :items="stockIssues"
      :busy="removing"
      @update:model-value="openModal = $event ? 'stock' : null"
      @remove="removeStock([$event])"
      @remove-all="removeStock(stockIssues.map(item => item.skuId))"
    />

    <CheckoutAddCardModal
      :model-value="openModal === 'add-card'"
      @update:model-value="openModal = $event ? 'add-card' : null"
      @saved="onCardSaved"
    />

    <LazyAppStatusModal
      :model-value="openModal === 'error'"
      kind="error"
      :title="$t('pay.error.title')"
      :text="$t('pay.error.text')"
      :primary-label="$t('common.retry')"
      :secondary-label="$t('pay.common.close')"
      @update:model-value="openModal = null"
      @primary="pay()"
      @secondary="openModal = null"
    />

  </div>
</template>

<style scoped>
.checkout { display: flex; flex-direction: column; }

.checkout__container {
  width: 1240px;
  margin-inline: auto;
  padding-bottom: var(--section-gap);
}

.checkout__breadcrumbs {
  padding-top: 24px;
  padding-bottom: 16px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.checkout__title {
  margin: 0 0 24px;
  font: var(--type-page-title);
  color: var(--color-text);
}

.checkout__layout { display: flex; gap: 30px; align-items: flex-start; }

.checkout__left { display: flex; flex-direction: column; gap: 16px; width: 708px; }

.checkout__stock {
  padding: 18px 20px;
  border: 1.5px solid #F5C2C0;
  border-radius: 24px;
  background: #FFF5F5;
}

.checkout__stock-title { margin: 0 0 10px; font-weight: 700; font-size: var(--text-2xl); color: #C02A26; }
.checkout__stock-list { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none; }
.checkout__stock-item { display: flex; align-items: center; gap: 12px; }
.checkout__stock-image { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; }
.checkout__stock-name { flex: 1; font-weight: 600; font-size: var(--text-lg); color: var(--color-text); }
.checkout__stock-note { font-size: var(--text-base); color: #C02A26; }

.checkout__stock-remove {
  padding: 8px 12px;
  border: 1px solid rgb(192 42 38 / 35%);
  border-radius: 10px;
  background: var(--color-surface);
  color: #C02A26;
  cursor: pointer;
  font: var(--type-button-sm);
}

.checkout__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 0;
  font-size: var(--text-2xl);
  color: var(--color-text-muted);
}

.checkout__empty-link {
  padding: 14px 28px;
  border-radius: 14px;
  background: var(--color-brand);
  font-weight: 600;
  color: var(--color-on-brand);
}
</style>
