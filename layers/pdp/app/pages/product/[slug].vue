<script setup lang="ts">
/**
 * Карточка товара. Раскладка из макета marketplace-web-page (1440×4488):
 * контейнер 1240, левая колонка 740, правая 479, зазор 21.
 */
import type { Banner, Product, ProductCard } from '#shared/types/catalog'
const localePath = useLocalePath()

const { t } = useI18n()
const route = useRoute()
const slug = computed(() => String(route.params.slug))

/**
 * `lazy` не отменяет загрузку на сервере: в HTML товар приходит как и раньше —
 * это нужно поисковику. Флаг снимает блокировку перехода внутри сайта, поэтому
 * страница открывается сразу и показывает скелетон, пока товар едет.
 */
const { data: product, status, error } = await useApiData<Product>(`pdp:${slug.value}`, `/products/${slug.value}`, { lazy: true })

// Метатеги и Product-разметка. Композабл, а не компонент в шаблоне: у пустого
// компонента шаблон состоял из комментария, а его SSR не отдаёт — из-за этого
// все секции страницы съезжали на узел и ломали гидратацию
usePdpSeo(product)

const notFound = () => createError({ statusCode: 404, statusMessage: t('ui.pdp.productItem.notFound'), fatal: true })

/**
 * Бэкенд иногда падает транзитно — SSR-лимит, 502, обрыв сети — и это
 * НЕ значит «товара не существует». Раньше любая ошибка запроса превращалась
 * в жёсткую 404 («такой страницы нет»), и покупатель, поймавший throttling
 * или мгновенный сбой сети, читал это как «товар удалён навсегда», хотя
 * обновление страницы почти всегда помогало. Различаем: `error.statusCode`
 * реально пришёл с бэкенда (см. useApi.ts onResponseError) — 404 остаётся
 * 404, всё остальное показываем как временную ошибку с тем же кодом.
 */
const upstreamStatus = () => (error.value as { statusCode?: number } | null)?.statusCode
const isGenuineNotFound = () => upstreamStatus() === 404
const transientError = () =>
  createError({ statusCode: upstreamStatus() ?? 502, statusMessage: t('ui.pdp.productItem.loadError'), fatal: true })

// На сервере ответ уже есть: пустую страницу поисковику отдавать нельзя,
// но только когда бэкенд ДЕЙСТВИТЕЛЬНО сказал «нет такого товара».
if (import.meta.server && !product.value) {
  throw isGenuineNotFound() ? notFound() : transientError()
}

// В браузере товар приезжает после перехода — реагируем, когда запрос завершился
if (import.meta.client) {
  watch(status, (value) => {
    if (value === 'error') showError(isGenuineNotFound() ? notFound() : transientError())
    else if (value === 'success' && !product.value) showError(notFound())
  }, { immediate: true })
}

/*
 * Полки и баннеры — `server: false`, и это не микрооптимизация.
 *
 * `lazy` не держит переход, но на SSR данные всё равно собираются и едут в
 * `_payload.json`, который браузер тянет при клике по карточке. Полок четыре,
 * причём «похожие» и «с этим покупают» ждут `product.id` — то есть идут
 * ВТОРЫМ кругом, после товара. Замеряно: payload категории 4-8 мс, payload
 * товара 270-360 мс, и переход на карточку занимал ~1.7 с.
 *
 * Всё это живёт ниже первого экрана. Пусть грузится в браузере, уже после
 * того как товар отрисован: у каждой полки есть скелетон, прыжка вёрстки
 * нет. Сам товар остаётся на SSR — он нужен и для первого экрана, и для
 * поисковиков.
 */
const SHELF = { lazy: true, server: false } as const
// На сервере такой запрос ещё idle, в браузере уже pending: скелетон должен быть в обоих, иначе разметка при гидратации расходится.
const isLoading = (status: string) => status === 'pending' || status === 'idle'

const { data: viewed, status: viewedStatus } = await useApiData<ProductCard[]>('pdp:viewed', '/products/shelf', { query: { kind: 'recommended', limit: 6 }, ...SHELF })

/** Открытый товар из полки убираем — рекомендовать его самому себе незачем */
const viewedOthers = computed(() => (viewed.value ?? []).filter(item => item.id !== product.value?.id).slice(0, 5))

const productId = computed(() => product.value?.id)

const { data: similar, status: similarStatus } = await useApiData<ProductCard[]>(
  `pdp:similar:${slug.value}`,
  '/products/shelf',
  { query: () => ({ kind: 'similar', limit: 6, product_id: productId.value }), ...SHELF, watch: [productId] },
)
const similarOthers = computed(() => (similar.value ?? []).filter(item => item.id !== product.value?.id).slice(0, 5))

const { data: boughtWith, status: boughtWithStatus } = await useApiData<ProductCard[]>(
  `pdp:bought_with:${slug.value}`,
  '/products/shelf',
  { query: () => ({ kind: 'bought_with', limit: 6, product_id: productId.value }), ...SHELF, watch: [productId] },
)

const { data: banners, status: bannersStatus } = await useApiData<Banner[]>('pdp:banners', '/banners', SHELF)

// В макете в ряду ровно три баннера
const promoRow = computed(() => {
  const list = banners.value ?? []
  return list.length ? [list[0]!, list[1] ?? list[0]!, list[0]!] : []
})

const { can: canDo } = useAccessState()
const canPay = computed(() => canDo('requests.approve'))
</script>

<template>
  <PdpSkeleton v-if="!product" />

  <div v-else class="pdp">
    <div class="pdp__container">
      <nav class="pdp__breadcrumbs" :aria-label="$t('common.hlebnyeKroshki')">
        <NuxtLink :to="localePath('/')">{{ t('breadcrumbs.home') }}</NuxtLink>
        <span v-for="crumb in product.categoryPath" :key="crumb.id">
          / <NuxtLink :to="localePath(`/category/${crumb.slug}`)">{{ crumb.title }}</NuxtLink>
        </span>
        <span>/ {{ product.title }}</span>
      </nav>

      <div class="pdp__layout">
        <div class="pdp__left">
          <PdpGallery
            :product-id="product.id"
            :images="product.images"
            :title="product.title"
            :has-video="product.hasVideo"
          />

          <!-- У товара может не быть ни одного отзыва — тогда блока нет совсем -->
          <PdpReviews
            v-if="product.reviewsPreview.length"
            :count="product.reviewsCount"
            :photos="product.reviewPhotos"
            :reviews="product.reviewsPreview"
          />

          <PdpAbout :description="product.description" />

          <PdpCharacteristics :attributes="product.attributes" />

          <!-- Условия слева: правая колонка короче экрана, и кнопка покупки всегда под рукой -->
          <div class="pdp__terms">
            <!-- Без гарантии производителя в блоке документы — заголовок по содержимому -->
            <PdpInfoCard :title="product.warranty.some(row => row.icon === 'seal-check') ? $t('ui.pdp.productItem.vozvratGarantiya') : $t('org.pdp.returnsDocs')" :rows="product.warranty" round-icons />
            <PdpInfoCard
              :title="$t('ui.pdp.productItem.oplataDostavka')"
              :rows="product.delivery"
              :link-label="$t('ui.checkout.deliveryCard.kakRabotaetDostavkaProdavca')"
            />
            <!-- Способы оплаты нужны тому, кто платит; сотрудник только заявляет -->
            <PdpPaymentMethods v-if="canPay" class="pdp__terms-wide" :options="product.paymentOptions" />
          </div>
        </div>

        <div class="pdp__right sticky-aside">
          <PdpBuyBox :product="product" />
          <!-- Продавец скрыт от покупателя, пока площадка не включит показ -->
          <PdpSellerCard v-if="product.seller" :seller="product.seller" />
        </div>
      </div>
    </div>

    <HomeShelf v-if="similarOthers.length || isLoading(similarStatus)" :title="$t('pdp.similarProducts')" :products="similarOthers" :loading="isLoading(similarStatus)" />
    <HomeShelf v-if="(boughtWith ?? []).length || isLoading(boughtWithStatus)" :title="$t('pdp.boughtTogether')" :products="boughtWith ?? []" :loading="isLoading(boughtWithStatus)" />
    <HomeShelf :title="$t('home.viewed')" :more-link="localePath('/search?kind=recommended')" :products="viewedOthers" :loading="isLoading(viewedStatus)" />
    <HomePromoBanners :banners="promoRow" :loading="isLoading(bannersStatus)" />
  </div>
</template>

<style scoped>
.pdp { display: flex; flex-direction: column; }

.pdp__container {
  width: var(--container-width);
  margin-inline: auto;
  padding-bottom: var(--section-gap);
}

.pdp__breadcrumbs {
  display: flex;
  gap: 4px;
  padding-block: 24px;
  font-weight: 400;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.pdp__layout {
  display: flex;
  gap: 21px;
  align-items: flex-start;
}

.pdp__left {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 740px;
}

.pdp__terms {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.pdp__terms-wide { grid-column: 1 / -1; }

.pdp__right {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 479px;
}
</style>
