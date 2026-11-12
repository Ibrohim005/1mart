<script setup lang="ts">
/**
 * Детали заказа (ТЗ UC-FL-10, UC-56 отслеживание, UC-58 возврат).
 *
 * Заголовок, дорожка и плашки идут от машинного `order.status` и
 * `paymentStatus`; какие кнопки доступны — решает сервер (`order.actions`):
 * «Отменить» — пока продавец не подтвердил, «Оформить возврат» и
 * «Оставить отзыв» — после доставки, «Чек» — когда есть платёж.
 * Пока заказ в работе, страница опрашивает сервер и статус обновляется сам.
 */
import type { OrderDetail } from '#shared/types/order'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { money } = useMoney()
const localePath = useLocalePath()
const { t } = useI18n()
const api = useApi()
const toast = useToast()
const { paymentStatusLabel, providerName } = use1mart()

const id = computed(() => String(route.params.id))

const { data: order, error, refresh } = await useAsyncData<OrderDetail>(
  () => `account:order:${id.value}`,
  () => api.get<OrderDetail>(`/orders/${id.value}`),
  { lazy: true, watch: [id] },
)

const notFound = computed(() => (error.value as { statusCode?: number } | null)?.statusCode === 404)
const failed = computed(() => Boolean(error.value) && !notFound.value)

if (import.meta.server && notFound.value) {
  throw createError({ statusCode: 404, statusMessage: t('ui.account.ordersItem.zakazNayden'), fatal: true })
}

const { steps, currentStep, title, text, canceled } = useOrderProgress(() => order.value ?? undefined)

/* Отслеживание: пока заказ в работе, статус подтягивается каждые 4 секунды */
let poll: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  poll = setInterval(() => {
    if (order.value && LIVE_STATUSES.includes(order.value.status) && !document.hidden) refresh()
  }, 4000)
})
onBeforeUnmount(() => {
  if (poll) clearInterval(poll)
})

// Смена статуса, пока страница открыта, — коротко сообщаем
watch(() => order.value?.status, (next, prev) => {
  if (!prev || !next || next === prev) return
  if (next === 'rejectedBySeller') toast.show(t('pay.orders.rejectedToast'), 'error')
  else toast.show(t('pay.orders.statusChanged', { status: order.value?.statusLabel ?? '' }))
})

const expanded = ref(false)
const total = computed(() => (order.value ? money(order.value.total) : ''))
const can = (action: string) => Boolean(order.value?.actions.includes(action as never))

const confirmCancel = ref(false)
const showReturn = ref(false)
const showReview = ref(false)
const showReceipt = ref(false)
const busy = ref(false)

async function cancelOrder() {
  busy.value = true
  try {
    await api.post(`/orders/${id.value}/cancel`, { reason: t('pay.orders.cancelReason') })
    confirmCancel.value = false
    await refresh()
    toast.show(t('pay.orders.cancelDone'))
  }
  catch {
    toast.show(t('account.action.actionError'), 'error')
  }
  finally {
    busy.value = false
  }
}

async function submitReturn(payload: { reason: string, photos: number }) {
  busy.value = true
  try {
    await api.post(`/orders/${id.value}/return`, payload)
    showReturn.value = false
    await refresh()
    toast.show(t('pay.return.done'))
  }
  catch {
    toast.show(t('account.action.actionError'), 'error')
  }
  finally {
    busy.value = false
  }
}

async function submitReview() {
  try {
    await api.post(`/orders/${id.value}/review`)
    showReview.value = false
    await refresh()
    toast.show(t('pay.orders.reviewDone'))
  }
  catch {
    toast.show(t('account.action.actionError'), 'error')
  }
}

async function repeatOrder() {
  busy.value = true
  try {
    await api.post(`/orders/${id.value}/repeat`)
    toast.show(t('account.action.repeatDone'))
    await router.push(localePath('/cart'))
  }
  catch {
    toast.show(t('account.action.actionError'), 'error')
  }
  finally {
    busy.value = false
  }
}

useSeoMeta({ title: () => t('ui.account.ordersItem.seoTitle'), robots: 'noindex, nofollow' })
</script>

<template>
  <AccountLayout :title="$t('breadcrumbs.orders')">
    <div v-if="failed" class="detail">
      <AccountEmptyState
        :title="$t('ui.account.orders.loadError')"
        :text="$t('ui.account.orders.loadErrorText')"
        illustration="/mock/empty-favorites.png"
      >
        <button type="button" class="detail__retry" @click="refresh()">{{ $t('common.retry') }}</button>
      </AccountEmptyState>
    </div>

    <div v-else-if="!order" class="detail detail--loading" aria-busy="true" aria-live="polite">
      <span class="visually-hidden">{{ $t('ui.shared.state.loading') }}</span>
      <UiSkeleton width="320px" height="28px" class="detail__skeleton-center" />
      <UiSkeleton width="420px" height="18px" class="detail__skeleton-center" />
      <UiSkeleton width="100%" height="96px" radius="18px" />
      <AccountOrderCardSkeleton />
      <UiSkeleton width="100%" height="220px" radius="18px" />
    </div>

    <div v-else class="detail">
      <!-- Статус заказа: заголовок, подпись и дорожка идут от order.status -->
      <section class="detail__status">
        <h2 class="detail__status-title">{{ title }}</h2>
        <p class="detail__status-text">{{ text }}</p>

        <ol v-if="!canceled" class="detail__steps" :aria-label="$t('ui.account.placed.stepsLabel')">
          <li
            v-for="(step, index) in steps"
            :key="step.key"
            class="detail__step"
            :class="{ 'detail__step--done': step.done }"
            :aria-current="index === currentStep ? 'step' : undefined"
          >
            <span class="detail__step-mark">
              <UiIcon :name="step.icon" :color="step.done ? '#FFFFFF' : '#A7AFBC'" :size="26" />
            </span>
            <span class="detail__step-label">{{ step.label }}</span>
            <span v-if="step.at" class="detail__step-date">{{ step.at }}</span>
            <span class="visually-hidden">{{ $t('ui.account.orders.stepOf', { current: index + 1, total: steps.length }) }}</span>
          </li>
        </ol>

        <!-- А2: отказ продавца — деньги вернулись, говорим куда -->
        <p v-if="order.status === 'rejectedBySeller' || order.paymentStatus === 'refunded'" class="detail__refund" role="status">
          {{ $t('pay.orders.refunded', { method: order.paymentLabel }) }}
        </p>
      </section>

      <AccountOrderCard :order="order" hide-action class="detail__card" />

      <!--
        Один ряд действий вместо двух. Раньше здесь стояли две несвязанные
        группы: широкие «Помощь» и «Свернуть» — и под ними мелкие пилюли
        «Отменить»/«Повторить». Зелёным при этом горело «Свернуть», хотя это
        не то действие, которого мы ждём от покупателя.

        Зелёная кнопка ровно одна и только когда есть что предложить:
        у доставленного заказа — оценить покупку. Какие действия доступны,
        решает бэкенд (order.actions), а не вёрстка.
      -->
      <div class="detail__actions">
        <button v-if="can('review')" type="button" class="detail__action detail__action--primary" @click="showReview = true">
          {{ $t('pay.orders.review') }}
        </button>

        <button v-if="can('return')" type="button" class="detail__action" :disabled="busy" @click="showReturn = true">
          {{ $t('pay.orders.return') }}
        </button>

        <button v-if="can('receipt')" type="button" class="detail__action" @click="showReceipt = true">
          {{ $t('pay.success.receipt') }}
        </button>

        <button type="button" class="detail__action" :aria-expanded="expanded" @click="expanded = !expanded">
          {{ expanded ? $t('common.collapse') : $t('common.more') }}
        </button>

        <button v-if="can('repeat')" type="button" class="detail__action" :disabled="busy" @click="repeatOrder">
          {{ $t('account.action.repeat') }}
        </button>

        <NuxtLink :to="localePath('/info/help')" class="detail__action">{{ $t('ui.account.ordersItem.pomosch') }}</NuxtLink>

        <!-- Отмена уводится вправо и звучит тише остальных: это крайняя мера -->
        <button v-if="can('cancel')" type="button" class="detail__action detail__action--danger" :disabled="busy" @click="confirmCancel = true">
          {{ $t('pay.orders.cancel') }}
        </button>
      </div>

      <!-- Раскрытые подробности -->
      <template v-if="expanded">
        <section class="detail__block">
          <header class="detail__block-head">
            <h3 class="detail__block-title">{{ $t('ui.account.ordersItem.itemsCount', { count: order.items.length, word: $t('common.tovar', order.items.length) }) }}</h3>
            <span class="detail__date">{{ order.date }}</span>
          </header>

          <article v-for="item in order.items" :key="item.id" class="detail__item">
            <UiImage :src="item.image" :alt="item.title" width="94" height="106" class="detail__image" />

            <div class="detail__item-text">
              <p class="detail__item-price">{{ money(item.price) }}</p>
              <p class="detail__item-title">{{ item.title }}</p>
              <p v-if="item.seller" class="detail__item-seller">{{ item.seller }}</p>
              <p v-if="item.requestedBy" class="detail__item-seller detail__item-requester">
                <UiIcon name="user" :size="16" color="currentColor" />
                {{ $t('org.orders.requestedBy', { name: item.requestedBy }) }}
              </p>
            </div>

            <div class="detail__item-side">
              <span class="detail__qty">{{ $t('ui.account.ordersItem.qty', { count: item.quantity }) }}</span>
            </div>
          </article>

          <footer class="detail__total">
            <span>{{ $t('ui.account.ordersItem.obschayaStoimost') }}</span>
            <strong class="detail__total-value">{{ total }}</strong>
          </footer>
        </section>

        <section class="detail__block">
          <h3 class="detail__block-title">{{ $t('ui.account.ordersItem.detaliDostavki') }}</h3>

          <div class="detail__row">
            <UiIcon name="truck" :size="26" />
            <span class="detail__row-text">
              <!-- У самовывоза подпись «Курьером по адресу» была враньём -->
              <span class="detail__row-title">{{ $t(order.deliveryType === 'pickupPoint' ? 'ui.account.ordersItem.samovyvoz' : 'ui.account.ordersItem.kureromAdresu') }}</span>
              <span class="detail__row-note">{{ order.address }}</span>
            </span>
          </div>

          <div v-if="order.tracking" class="detail__row">
            <UiIcon name="location" :size="26" />
            <span class="detail__row-text">
              <span class="detail__row-title">{{ $t('pay.orders.tracking') }}: {{ order.tracking.number }}</span>
              <span class="detail__row-note">{{ providerName(order.tracking.provider) }}</span>
            </span>
          </div>

          <div v-if="order.expectedAt" class="detail__row">
            <UiIcon name="calendar" :size="26" />
            <span class="detail__row-text">
              <span class="detail__row-title">{{ $t('ui.account.orders.expectedAt') }}</span>
              <span class="detail__row-note">{{ order.expectedAt }}</span>
            </span>
          </div>

          <div class="detail__row">
            <UiIcon name="money" :size="26" />
            <span class="detail__row-text">
              <span class="detail__row-title">{{ $t('ui.account.orders.deliveryPrice') }}</span>
              <span class="detail__row-note">{{ money(order.deliveryPrice) }}</span>
            </span>
          </div>

          <div class="detail__row">
            <UiIcon name="user" :size="26" />
            <span class="detail__row-text">
              <span class="detail__row-title">{{ $t('common.poluchatel') }}</span>
              <span class="detail__row-note">{{ order.recipient }}, {{ order.recipientPhone }}</span>
            </span>
          </div>

          <div v-if="order.comment" class="detail__row">
            <UiIcon name="pen" :size="26" />
            <span class="detail__row-text">
              <span class="detail__row-title">{{ $t('ui.account.orders.comment') }}</span>
              <span class="detail__row-note">{{ order.comment }}</span>
            </span>
          </div>
        </section>

        <section class="detail__block">
          <h3 class="detail__block-title">{{ $t('common.sposobOplaty') }}</h3>
          <!-- B2B: кто в компании оформил (одобрил) заказ -->
          <div v-if="order.placedBy" class="detail__row">
            <UiIcon name="user" :size="26" />
            <span class="detail__row-text">
              <span class="detail__row-title">{{ order.placedBy }}</span>
              <span class="detail__row-note">{{ $t('org.orders.placedHint') }}</span>
            </span>
          </div>
          <div class="detail__row">
            <UiIcon :name="order.paymentLabel?.includes('•') ? 'card' : 'wallet-3-fill'" :size="26" />
            <span class="detail__row-text">
              <span class="detail__row-title">{{ order.paymentLabel }}</span>
              <span v-if="order.paymentStatus" class="detail__row-note">{{ paymentStatusLabel(order.paymentStatus) }}</span>
            </span>
          </div>
          <div v-if="order.receipt" class="detail__row">
            <UiIcon name="ticket" :size="26" />
            <span class="detail__row-text">
              <span class="detail__row-title">{{ $t('pay.receipt.transaction') }}</span>
              <span class="detail__row-note">{{ order.receipt.transactionId }}</span>
            </span>
          </div>
          <div v-if="order.commission" class="detail__row">
            <UiIcon name="percentage-circle" :size="26" />
            <span class="detail__row-text">
              <span class="detail__row-title">{{ $t('pay.summary.commission') }}</span>
              <span class="detail__row-note">{{ money(order.commission) }}</span>
            </span>
          </div>
          <div v-if="order.returnReason" class="detail__row">
            <UiIcon name="rotate-left" :size="26" />
            <span class="detail__row-text">
              <span class="detail__row-title">{{ $t('pay.return.reason') }}</span>
              <span class="detail__row-note">{{ order.returnReason }}</span>
            </span>
          </div>
        </section>

        <section v-if="order.courier" class="detail__block">
          <h3 class="detail__block-title">{{ $t('ui.account.ordersItem.kurerIliProdavec') }}</h3>
          <div class="detail__row detail__row--flat">
            <span class="detail__avatar" aria-hidden="true" />
            <span class="detail__row-text">
              <span class="detail__row-title">{{ order.courier.name }}</span>
              <span class="detail__row-note">{{ order.courier.phone }}</span>
            </span>
          </div>
        </section>
      </template>
    </div>

    <UiModal
      v-model="confirmCancel"
      :title="$t('account.action.cancelConfirm', { number: order?.number ?? '' })"
      body-padding="24px"
    >
      <p class="detail__confirm-text">{{ $t('pay.orders.cancelConfirmText') }}</p>
      <div class="detail__confirm-actions">
        <button type="button" class="detail__action" :disabled="busy" @click="confirmCancel = false">
          {{ $t('common.close') }}
        </button>
        <button type="button" class="detail__action detail__action--danger" :disabled="busy" @click="cancelOrder">
          {{ $t('pay.orders.cancel') }}
        </button>
      </div>
    </UiModal>

    <AccountReturnModal v-model="showReturn" :busy="busy" @submit="submitReturn" />
    <LazyAppReviewModal v-model="showReview" @submit="submitReview" />
    <CheckoutReceiptModal v-model="showReceipt" :receipt="order?.receipt" />
  </AccountLayout>
</template>

<style scoped>
.detail { display: flex; flex-direction: column; gap: 16px; }

.detail--loading {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 32px;
}

.detail__skeleton-center { margin-inline: auto; }

.detail__status { padding: 32px 20px 8px; text-align: center; }

.detail__status-title {
  margin: 0;
  font: var(--type-page-title);
  color: var(--color-text);
}

.detail__status-text {
  max-width: 420px;
  margin: 10px auto 0;
  font-size: var(--text-xl);
  line-height: 26px;
  color: var(--color-text);
}

.detail__steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.detail__step { display: flex; align-items: center; }

.detail__step-mark {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: 18px;
  background: #EDF0F4;
}

/* Пройденный шаг — зелёный с подсветкой, как в макете */
.detail__step--done .detail__step-mark {
  background: var(--color-brand);
  box-shadow: 0 0 22px rgb(11 143 42 / 45%);
}

.detail__step-line {
  width: 26px;
  height: 2px;
  background: #DDE2EA;
}

.detail__card { margin-top: 8px; }

/*
  Все действия — одного роста, радиуса и веса: раньше на экране жили две
  разные группы кнопок, и глазу было не за что зацепиться.
*/
.detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.detail__action {
  display: grid;
  place-items: center;
  padding-inline: 26px;
  border: 0;
  background: #EFF1F4;
  color: var(--color-text);
  white-space: nowrap;
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.detail__action:not(:disabled):hover { background: #E5E8ED; }
.detail__action:disabled { opacity: .55; cursor: default; }

/* Зелёная ровно одна — то действие, которого мы ждём */
.detail__action--primary {
  background: var(--color-brand);
  color: var(--color-on-brand);
}

.detail__action--primary:not(:disabled):hover { background: #097A24; }

/* Отмена уходит вправо и звучит тише: рамка вместо заливки */
.detail__action--danger {
  margin-left: auto;
  border: 1px solid rgb(229 50 45 / 35%);
  background: transparent;
  color: #C02A26;
}

.detail__action--danger:not(:disabled):hover { background: rgb(229 50 45 / 8%); }

.detail__block {
  padding: 22px;
  border-radius: var(--card-radius);
  background: var(--color-surface);
}

.detail__block-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.detail__block-title {
  margin: 0 0 14px;
  font: var(--type-section-title);
  color: var(--color-text);
}

.detail__date { font-size: var(--text-base); color: var(--color-text-muted); }

.detail__item {
  display: flex;
  gap: 16px;
  padding-block: 12px;
}

.detail__image { border-radius: 12px; object-fit: cover; }

.detail__item-text { flex: 1; }

.detail__item-price {
  margin: 0;
  font-weight: 700;
  font-size: var(--text-3xl);
  color: var(--color-text);
}

.detail__item-title {
  margin: 6px 0 0;
  font-size: var(--text-xl);
  line-height: 24px;
  color: var(--color-text);
}

.detail__item-seller {
  margin: 6px 0 0;
  font-size: var(--text-md);
  color: var(--color-text-muted);
}

.detail__item-side { text-align: right; }

.detail__qty {
  display: inline-block;
  padding: 4px 12px;
  border: 1px solid #DDE2EA;
  border-radius: 10px;
  font-weight: 600;
  font-size: var(--text-md);
}

.detail__total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 16px;
  border-top: 1px solid #EBEFF2;
  font-size: var(--text-xl);
}

.detail__total-value {
  font-weight: 700;
  font-size: var(--text-5xl);
  color: var(--color-brand-text);
}

.detail__row {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding-block: 14px;
  border-bottom: 1px solid #EBEFF2;
}

.detail__row:last-child { border-bottom: 0; }
.detail__row--flat { border-bottom: 0; align-items: center; }

.detail__row-text { display: flex; flex-direction: column; gap: 4px; }

.detail__row-title {
  font-weight: 600;
  font-size: var(--text-xl);
  color: var(--color-text);
}

.detail__row-note { font-size: var(--text-base); color: var(--color-text-muted); }

.detail__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-avatar);
}
</style>

<style scoped>
/* Шаги с подписями и датами: раньше названия были только для скринридера */
.detail__step {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.detail__step-label {
  font-weight: 500;
  font-size: var(--text-sm);
  line-height: 16px;
  text-align: center;
  color: #27383F;
}

.detail__step-date { font-size: var(--text-xs); color: var(--color-text-muted); text-align: center; }

.detail__refund,
.detail__hold {
  max-width: 520px;
  margin: 18px auto 0;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: var(--text-lg);
  line-height: 22px;
}

.detail__refund { background: #EEF0FF; color: #3B3FB6; }
.detail__hold { background: #FFF4E5; color: #8A4B00; }

.detail__confirm-text { margin: 0 0 20px; font-size: var(--text-xl); color: var(--color-text-muted); }
.detail__confirm-actions { display: flex; gap: 10px; justify-content: flex-end; }
.detail__confirm-actions .detail__action { margin-left: 0; height: 48px; }

.detail__retry {
  margin-top: 20px;
  padding: 14px 32px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.detail__item-requester { display: flex; align-items: center; gap: 6px; }
</style>
