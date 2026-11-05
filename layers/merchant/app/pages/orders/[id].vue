<script setup lang="ts">
import type { OrderDetail, OrderStatusCode } from '#shared/types/merchant'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const { money } = useMoney()
const localePath = useLocalePath()
const sm = useStatusMeta()
const api = useApi()
const toast = useToast()
const route = useRoute()
const id = route.params.id as string

const { data, status, error, refresh } = await useApiData<OrderDetail>(`m:order:${id}`, `/merchant/orders/${id}`)

// Доступные переходы статуса от текущего. Ветвимся по машинному коду.
interface OrderAction { labelKey: string, to: OrderStatusCode, variant: 'primary' | 'secondary' | 'ghost' }
const actions = computed<OrderAction[]>(() => {
  switch (data.value?.statusCode) {
    case 'new': return [{ labelKey: 'm.order.confirm', to: 'confirmed', variant: 'primary' }]
    case 'confirmed': return [{ labelKey: 'm.order.pack', to: 'packing', variant: 'primary' }]
    case 'packing': return [{ labelKey: 'm.order.ship', to: 'shipped', variant: 'primary' }]
    default: return []
  }
})

/** Отменить можно до передачи в доставку. Отказ - с причиной: её увидит покупатель. */
const canCancel = computed(() => ['new', 'confirmed', 'packing'].includes(data.value?.statusCode ?? ''))

/** После передачи в доставку статус двигает служба доставки, а не продавец */
const awaitsDelivery = computed(() => ['shipped', 'delivered'].includes(data.value?.statusCode ?? ''))

const cancelOpen = ref(false)
const cancelReason = ref('noStock')
const cancelComment = ref('')
const cancelError = ref('')
const cancelOptions = computed(() => (['noStock', 'wrongPrice', 'cannotShip', 'buyerRequest', 'other'] as const)
  .map(code => ({ value: code, label: t(`m.order.reason.${code}`) })))

function openCancel() {
  cancelReason.value = 'noStock'
  cancelComment.value = ''
  cancelError.value = ''
  cancelOpen.value = true
}

async function submitCancel() {
  if (cancelReason.value === 'other' && cancelComment.value.trim().length < 3) {
    cancelError.value = t('m.order.reasonRequired')
    return
  }
  await changeStatus('cancelled', { reason: cancelReason.value, comment: cancelComment.value.trim() })
  cancelOpen.value = false
}

const updating = ref(false)
async function changeStatus(to: OrderStatusCode, extra: Record<string, string> = {}) {
  updating.value = true
  try {
    await api.patch(`/merchant/orders/${id}`, { statusCode: to, ...extra })
    await refresh()
    toast.show(t('m.common.saved'))
  }
  catch {
    toast.show(t('m.common.loadError'), 'error')
  }
  finally {
    updating.value = false
  }
}

const itemColumns = [
  { key: 'title', label: t('m.order.items') },
  { key: 'qty', label: '', align: 'right' as const },
  { key: 'total', label: t('m.common.total'), align: 'right' as const },
]

useSeoMeta({
  title: () => `${data.value ? t('m.order.detailTitle', { number: data.value.number }) : t('m.nav.orders')} — 1mart Business`,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div>
    <div v-if="status === 'pending' && !data" class="odet__loading">
      <UiSkeleton height="56px" radius="14px" />
      <UiSkeleton height="360px" radius="18px" />
    </div>

    <template v-else-if="data">
      <MPageHeader :title="$t('m.order.detailTitle', { number: data.number })">
        <NuxtLink :to="localePath('/orders')">
          <UiButton variant="ghost">{{ $t('m.order.backToList') }}</UiButton>
        </NuxtLink>
      </MPageHeader>

      <div class="odet">
        <div class="odet__main">
          <MCard flush>
            <div class="odet__status-bar">
              <MStatus :tone="sm.order(data.statusCode).tone">{{ $t(sm.order(data.statusCode).key) }}</MStatus>
              <div v-if="actions.length || canCancel" class="odet__actions">
                <UiButton
                  v-for="a in actions"
                  :key="a.to"
                  :variant="a.variant"
                  :disabled="updating"
                  @click="changeStatus(a.to)"
                >{{ $t(a.labelKey) }}</UiButton>
                <UiButton v-if="canCancel" variant="ghost" :disabled="updating" @click="openCancel">{{ $t('m.order.cancel') }}</UiButton>
              </div>
              <p v-else-if="awaitsDelivery" class="odet__note">{{ $t('m.order.awaitsDelivery') }}</p>
            </div>

            <MTable :columns="itemColumns" :rows="data.items" row-key="productId">
              <template #cell-title="{ row }">
                <div class="odet__item">
                  <span class="odet__thumb"><UiIcon name="box-fill" :size="20" /></span>
                  <span class="odet__item-text">
                    <span class="odet__item-name">{{ row.title }}</span>
                    <span class="odet__item-sku">{{ row.sku }}</span>
                  </span>
                </div>
              </template>
              <template #cell-qty="{ row }">{{ $t('m.order.qty', { count: row.qty, price: money(row.price) }) }}</template>
              <template #cell-total="{ row }">{{ money(row.total) }}</template>
            </MTable>

            <div class="odet__totals">
              <div class="odet__total-row"><span>{{ $t('m.order.subtotal') }}</span><span>{{ money(data.subtotal) }}</span></div>
              <div class="odet__total-row">
                <span>{{ $t('m.order.delivery') }}</span>
                <span>{{ data.delivery.amount === 0 ? $t('m.order.free') : money(data.delivery) }}</span>
              </div>
              <div class="odet__total-row odet__total-row--muted">
                <span>{{ $t('m.order.commission') }}</span><span>− {{ money(data.commission) }}</span>
              </div>
              <div class="odet__total-row odet__total-row--strong">
                <span>{{ $t('m.order.payout') }}</span><span>{{ money(data.payout) }}</span>
              </div>
            </div>
          </MCard>
        </div>

        <div class="odet__side">
          <MCard :title="$t('m.order.customer')">
            <ul class="odet__kv">
              <li><span>{{ data.customer.name }}</span></li>
              <li v-if="data.customer.company && data.customer.company !== data.customer.name" class="odet__muted">{{ data.customer.company }}</li>
              <li><a :href="`tel:${data.customer.phone}`" class="odet__link">{{ data.customer.phone }}</a></li>
            </ul>
          </MCard>

          <MCard :title="$t('m.order.deliveryAddress')">
            <p class="odet__delivery-type">
              <UiIcon :name="data.deliveryType === 'courier' ? 'truck' : 'location'" :size="18" />
              {{ data.deliveryType === 'courier' ? $t('m.order.deliveryCourier') : $t('m.order.deliveryPickup') }}
            </p>
            <p class="odet__address">{{ data.deliveryAddress }}</p>
          </MCard>

          <MCard v-if="data.comment" :title="$t('m.order.comment')">
            <p class="odet__comment">{{ data.comment }}</p>
          </MCard>

          <MCard :title="$t('m.order.timeline')">
            <ol class="odet__timeline">
              <li v-for="(ev, i) in data.timeline" :key="i" class="odet__tl-row">
                <span class="odet__tl-dot" />
                <span class="odet__tl-text">
                  <span>{{ $t(`m.orderStatus.${ev.code}`) }}</span>
                  <span class="odet__muted">{{ formatDate(new Date(ev.at)) }}</span>
                </span>
              </li>
            </ol>
          </MCard>
        </div>
      </div>
    </template>

    <MNotFound
      v-else-if="(error as { statusCode?: number } | null)?.statusCode === 404"
      to="/orders"
      :back-label="$t('m.order.backToList')"
    />
    <MLoadError v-else-if="status === 'error'" @retry="refresh()" />

    <MConfirm
      v-model="cancelOpen"
      :title="$t('m.order.cancelTitle')"
      :text="$t('m.order.cancelText')"
      :confirm-label="$t('m.order.cancelSubmit')"
      :busy="updating"
      @confirm="submitCancel"
    >
      <MSelect v-model="cancelReason" :label="$t('m.order.reasonLabel')" :options="cancelOptions" />
      <MTextarea v-model="cancelComment" :label="$t('m.order.reasonComment')" :rows="3" :error="cancelError" />
    </MConfirm>
  </div>
</template>

<style scoped>
.odet__note { margin: 0; font-size: var(--text-sm); line-height: 20px; color: var(--m-slate); }

.odet__loading { display: flex; flex-direction: column; gap: 16px; }
.odet { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
.odet__status-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 16px 18px; border-bottom: 1px solid var(--color-line);
}
.odet__actions { display: flex; gap: 10px; }

.odet__item { display: flex; align-items: center; gap: 12px; }
.odet__thumb {
  display: grid; width: 40px; height: 40px; flex: none;
  border-radius: 10px; background: var(--color-page); color: var(--color-text-muted); place-items: center;
}
.odet__item-text { display: flex; flex-direction: column; }
.odet__item-name { font-weight: 500; color: var(--color-text); }
.odet__item-sku { font-size: var(--text-xs); color: var(--color-text-muted); }

.odet__totals { display: flex; flex-direction: column; gap: 10px; padding: 18px; border-top: 1px solid var(--color-line); }
.odet__total-row { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--color-text); }
.odet__total-row--muted { color: var(--color-text-muted); }
.odet__total-row--strong { padding-top: 10px; border-top: 1px solid var(--color-line); font-family: var(--font-display); font-weight: 700; font-size: var(--text-xl); }

.odet__side { display: flex; flex-direction: column; gap: 16px; }
.odet__kv { display: flex; flex-direction: column; gap: 6px; margin: 0; padding: 0; list-style: none; font-size: var(--text-sm); }
.odet__muted { color: var(--color-text-muted); }
.odet__link { color: var(--m-brand-strong); text-decoration: none; }
.odet__link:hover { text-decoration: underline; }
.odet__delivery-type { display: flex; align-items: center; gap: 8px; margin: 0 0 8px; font-weight: 500; font-size: var(--text-sm); }
.odet__address { margin: 0; font-size: var(--text-sm); color: var(--color-text-muted); }
.odet__comment { margin: 0; font-size: var(--text-sm); color: var(--color-text); }

.odet__timeline { display: flex; flex-direction: column; gap: 0; margin: 0; padding: 0; list-style: none; }
.odet__tl-row { display: flex; gap: 12px; padding-bottom: 16px; }
.odet__tl-row:last-child { padding-bottom: 0; }
.odet__tl-dot { width: 10px; height: 10px; margin-top: 4px; flex: none; border-radius: 50%; background: var(--color-brand); }
.odet__tl-text { display: flex; flex-direction: column; gap: 2px; font-size: var(--text-sm); }
</style>
