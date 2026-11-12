<script setup lang="ts">
/** «Мои заказы». Макет: Мои заказы (1440×3415) — меню 404, контент 820, полки внизу. */
import type { Paged } from '#shared/types/catalog'
import type { OrderCard, OrderDetail } from '#shared/types/order'
import type { Transaction } from '../../../components/TransactionCard.vue'

const { t } = useI18n()

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const api = useApi()

const PER_PAGE = 10

/**
 * Вкладка живёт в URL — ссылку можно переслать.
 *
 * При переключении убираем `placed`: экран подтверждения показывается один раз
 * после оплаты и не должен превращаться в режим страницы. Раньше он перекрывал
 * список целиком, и вкладки, оставаясь кликабельными, ничего не меняли —
 * подсветка и адрес переключались, а на экране было по-прежнему подтверждение.
 */
const tab = computed({
  get: () => String(route.query.tab ?? 'active'),
  set: (value) => {
    const { placed: _placed, ...rest } = route.query
    router.replace({ query: { ...rest, tab: value === 'active' ? undefined : value } })
  },
})
const tabs = [
  { value: 'active', label: 'ui.account.orders.aktivnye' },
  { value: 'all', label: 'catalog.all' },
  { value: 'history', label: 'ui.account.orders.istoriyaTranzakciy' },
]

const isHistory = computed(() => tab.value === 'history')
const page = ref(1)

/**
 * `lazy` не блокирует переход в кабинет: список открывается со скелетонами,
 * они же показываются при переключении вкладок, пока едет новый список.
 * На вкладке транзакций заказы не запрашиваем вовсе — раньше запрос уходил
 * всегда, а результат там не используется.
 */
const { data: ordersPage, refresh, status, error } = await useAsyncData<Paged<OrderCard> | null>(
  'account:orders',
  () => (isHistory.value
    ? Promise.resolve(null)
    : api.get<Paged<OrderCard>>('/orders', { tab: tab.value, page: page.value, perPage: PER_PAGE })),
  { lazy: true },
)

/** Догруженные страницы копятся, а не заменяют друг друга */
const items = ref<OrderCard[]>([])
watch(ordersPage, (value) => {
  if (!value) return
  items.value = page.value === 1 ? value.items : [...items.value, ...value.items]
}, { immediate: true })

watch(tab, () => {
  page.value = 1
  // На вкладке транзакций заказы не нужны — запрос вернёт null и не уйдёт в сеть
  refresh()
})

const hasMore = computed(() => items.value.length < (ordersPage.value?.total ?? 0))
const loadingMore = ref(false)

async function loadMore() {
  loadingMore.value = true
  page.value += 1
  await refresh()
  loadingMore.value = false
}

// Третья вкладка в макете — история транзакций
const { data: transactions, status: transactionsStatus } = await useApiData<Transaction[]>('account:transactions', '/transactions', { lazy: true })

/**
 * Сразу после оплаты страница показывает подтверждение над списком.
 * Номер в адресе, чтобы экран открывался по ссылке и переживал перезагрузку.
 * Заказ грузим отдельным запросом: раньше он искался в уже загруженном списке
 * и не находился, если не попал в выдачу.
 *
 * Id держим строкой, а не числом: у мока номер заказа числовой, у бэкенда
 * это UUID, и `Number(uuid)` даёт NaN — с числовым id заказ не находился бы
 * никогда, и экран подтверждения не показывался бы сразу после оплаты.
 */
const placedId = computed(() => String(route.query.placed ?? ''))
const { data: placed, refresh: refreshPlaced } = await useAsyncData<OrderDetail | null>(
  'account:placed',
  () => (placedId.value ? api.get<OrderDetail>(`/orders/${placedId.value}`).catch(() => null) : Promise.resolve(null)),
  { watch: [placedId], lazy: true },
)

const failed = computed(() => status.value === 'error' || Boolean(error.value))

/**
 * Отслеживание (ТЗ UC-56): пока в списке есть заказы в работе, список
 * тихо обновляется — «Ожидает подтверждения» сам сменится на «Подтверждён»,
 * «Передан в доставку» и «Доставлен». Догруженные страницы не трогаем.
 */
let poll: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  poll = setInterval(() => {
    if (document.hidden || isHistory.value || page.value !== 1) return
    if (items.value.some(order => LIVE_STATUSES.includes(order.status))) refresh()
    if (placed.value && LIVE_STATUSES.includes(placed.value.status)) refreshPlaced()
  }, 5000)
})
onBeforeUnmount(() => {
  if (poll) clearInterval(poll)
})

useSeoMeta({ title: () => t('ui.account.orders.seoTitle'), robots: 'noindex, nofollow' })
</script>

<template>
  <AccountLayout :title="$t('breadcrumbs.orders')">
    <AccountTabs v-model="tab" :tabs="tabs" class="orders__tabs" />

    <AccountOrderPlaced v-if="placed" :order="placed" class="orders__placed" />

    <div v-if="isHistory" class="orders__list">
      <div v-if="transactionsStatus === 'pending'" class="orders__tx">
        <span class="visually-hidden">{{ $t('ui.shared.state.loading') }}</span>
        <div v-for="n in 5" :key="n" class="orders__tx-skeleton">
          <UiSkeleton width="40px" height="40px" radius="50%" />
          <span class="orders__tx-skeleton-text">
            <UiSkeleton width="160px" height="16px" />
            <UiSkeleton width="220px" height="13px" />
          </span>
          <UiSkeleton width="120px" height="18px" />
        </div>
      </div>

      <ul v-else-if="transactions?.length" class="orders__tx">
        <li v-for="item in transactions" :key="item.id">
          <AccountTransactionCard :transaction="item" />
        </li>
      </ul>

      <AccountEmptyState
        v-else
        :title="$t('common.zdesPokaPusto')"
        illustration="/mock/empty-favorites.png"
      />
    </div>

    <div v-else class="orders__list" :aria-busy="status === 'pending'">
      <!-- Скелетоны при смене вкладки; при догрузке «Показать ещё»
           список остаётся на месте -->
      <template v-if="status === 'pending' && page === 1">
        <span class="visually-hidden">{{ $t('ui.shared.state.loading') }}</span>
        <AccountOrderCardSkeleton v-for="n in 3" :key="n" />
      </template>

      <!-- Сбой связи — это не «заказов нет»: раньше на его месте показывалось
           пустое состояние, и покупатель решал, что заказы пропали -->
      <AccountEmptyState
        v-else-if="failed"
        :title="$t('ui.account.orders.loadError')"
        :text="$t('ui.account.orders.loadErrorText')"
        illustration="/mock/empty-favorites.png"
      >
        <button type="button" class="orders__retry" @click="refresh()">{{ $t('common.retry') }}</button>
      </AccountEmptyState>

      <template v-else>
        <AccountOrderCard v-for="order in items" :key="order.id" :order="order" />

        <button
          v-if="hasMore"
          type="button"
          class="orders__more"
          :disabled="loadingMore"
          @click="loadMore"
        >{{ $t('ui.account.orders.showMore') }}</button>

        <AccountEmptyState
          v-if="!items.length"
          :title="$t('common.zdesPokaPusto')"
          :text="$t('ui.account.orders.vashiZakazyPoyavyatsyaEtom')"
          illustration="/mock/empty-favorites.png"
        />
      </template>
    </div>
  </AccountLayout>
</template>

<style scoped>
.orders__tabs { margin-bottom: 30px; }
.orders__placed { margin-bottom: 40px; }
.orders__list { display: flex; flex-direction: column; gap: 10px; }

.orders__more,
.orders__retry {
  align-self: center;
  margin-top: 10px;
  padding: 14px 32px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.orders__more:disabled { opacity: .6; cursor: default; }
.orders__more:not(:disabled):hover,
.orders__retry:hover { background: #097A24; }

/* История транзакций — одна белая карточка-список, строки через тонкую линию */
.orders__tx {
  margin: 0;
  padding: 2px 20px;
  border-radius: 20px;
  background: var(--color-surface);
  list-style: none;
}

.orders__tx > li + li,
.orders__tx-skeleton + .orders__tx-skeleton { border-top: 1px solid var(--color-line); }

.orders__tx-skeleton { display: flex; align-items: center; gap: 14px; padding-block: 15px; }
.orders__tx-skeleton-text { display: flex; flex: 1; flex-direction: column; gap: 6px; }
</style>
