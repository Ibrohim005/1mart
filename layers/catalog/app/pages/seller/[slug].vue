<script setup lang="ts">
/**
 * Витрина продавца. Макет «Все товары продавца» (5082:124919):
 * крошки, карточка продавца 479×92 r24, полка его товаров без заголовка,
 * ряд баннеров, полка «Wow выгода» и промо приложения.
 */
import type { Banner, ProductCard, Seller } from '#shared/types/catalog'
const { t } = useI18n()

const route = useRoute()
const localePath = useLocalePath()
const slug = computed(() => String(route.params.slug))

/**
 * `lazy` не отменяет загрузку на сервере: витрина продавца попадает в HTML
 * как и раньше. Флаг снимает блокировку перехода внутри сайта — страница
 * открывается со скелетоном, а не висит на предыдущей.
 */
/** Сколько карточек показано: четыре ряда по пять, дальше догружаем по кнопке */
const PAGE_SIZE = 20
const shown = ref(PAGE_SIZE)

const { data, status, error, refresh } = await useApiData<{ seller: Seller, products: ProductCard[], total: number }>(
  `seller:${slug.value}`,
  `/sellers/${slug.value}`,
  { query: () => ({ page: 1, perPage: shown.value }), lazy: true },
)

const notFound = () => createError({ statusCode: 404, statusMessage: t('ui.catalog.sellerItem.notFound'), fatal: true })

// 404 — только когда продавца и правда нет. При сбое сети или сервера продавец
// есть, и «не найден» было бы неправдой: показываем ошибку с повтором.
const isMissing = () => (error.value as { statusCode?: number } | null)?.statusCode === 404

// На сервере ответ уже есть: несуществующего продавца сразу отдаём как 404
if (import.meta.server && isMissing()) throw notFound()

// В браузере ответ приходит после перехода — ждём конца запроса
if (import.meta.client) {
  watch(status, (value) => {
    if (value === 'error' && isMissing()) showError(notFound())
  }, { immediate: true })
}

const seller = computed(() => data.value?.seller)
const products = computed(() => data.value?.products ?? [])
const total = computed(() => data.value?.total ?? products.value.length)
const hasMore = computed(() => total.value > products.value.length)

/** Скелетон — только пока данных нет: при догрузке показанные карточки остаются на месте */
const productsStatus = computed(() => {
  if (data.value) return 'success'
  return status.value === 'error' ? 'error' : 'pending'
})

function showMore() {
  shown.value += PAGE_SIZE
  refresh()
}

/*
 * Логотип: ссылка записана, а файла по ней нет — медиасервер отдаёт 404.
 * Общий UiImage тут не подходит: его заглушка — иконка фильтров, в роли
 * логотипа она читается как ошибка. Показываем первую букву названия, как
 * в карточке продавца на странице товара (SellerCard.vue), чтобы продавец
 * без логотипа выглядел одинаково в обоих местах.
 */
const logoBroken = ref(false)
watch(() => seller.value?.logo, () => { logoBroken.value = false })

const logoInitial = computed(() => (seller.value?.title || '').trim().charAt(0).toUpperCase())
const showLogo = computed(() => !!seller.value?.logo && !logoBroken.value)

/*
 * Одного @error мало: картинка успевает упасть до гидратации, события тогда
 * уже не будет и на странице останется битый <img>.
 */
const logo = useTemplateRef<HTMLImageElement>('logo')
onMounted(() => {
  if (logo.value?.complete && logo.value.naturalWidth === 0) logoBroken.value = true
})

const { data: banners, status: bannersStatus } = await useApiData<Banner[]>('seller:banners', '/banners', { lazy: true })
const { data: recommended, status: recommendedStatus } = await useApiData<ProductCard[]>(
  'seller:recommended',
  '/products/shelf',
  { query: { kind: 'wow', limit: 5 }, lazy: true },
)

// В макете в ряду ровно три баннера
const promoBanners = computed(() => (banners.value ?? []).slice(0, 3))

useSeoMeta({
  title: () => (seller.value ? `${seller.value.title} — ${t('ui.catalog.sellerItem.allProducts')}` : undefined),
  description: () => (seller.value ? t('ui.catalog.sellerItem.seoDescription', { title: seller.value.title }) : undefined),
})
</script>

<template>
  <div class="seller-page">
    <div class="seller-page__head">
      <nav class="seller-page__breadcrumbs" :aria-label="$t('common.hlebnyeKroshki')">
        <NuxtLink :to="localePath('/')">{{ t('breadcrumbs.home') }}</NuxtLink> / {{ seller?.title ?? $t('ui.catalog.sellerItem.allProducts') }}
      </nav>

      <!-- Карточка продавца 479×92 — тот же габарит, что и у настоящей -->
      <section v-if="!seller && status !== 'error'" class="seller-card" aria-busy="true" aria-live="polite">
        <span class="visually-hidden">{{ $t('ui.shared.state.loading') }}</span>
        <UiSkeleton width="62px" height="62px" radius="16px" />
        <div class="seller-card__details">
          <UiSkeleton width="220px" height="20px" />
          <UiSkeleton width="150px" height="14px" class="seller-card__rating-skeleton" />
        </div>
      </section>

      <section v-else-if="seller" class="seller-card">
        <img v-if="showLogo" ref="logo" :src="seller.logo" :alt="seller.title" width="62" height="62" class="seller-card__logo" @error="logoBroken = true">
        <span v-else class="seller-card__logo seller-card__logo--empty" aria-hidden="true">{{ logoInitial }}</span>

        <div class="seller-card__details">
          <h1 class="seller-card__name">{{ seller.title }}</h1>
          <p class="seller-card__rating">
            <!-- Без оценок нули ничего не сообщают: остаётся только число товаров -->
            <template v-if="seller.reviewsCount">
              <UiIcon name="star-fill" color="#FF9F0A" :size="16.9" />
              <span class="seller-card__value">{{ seller.rating.toFixed(1) }}</span>
              <span class="seller-card__count">
                {{ $t('ui.pdp.sellerCard.ratingsCount', {
                  count: seller.reviewsCount,
                  word: $t('common.ocenka', seller.reviewsCount),
                }) }}
              </span>
              <span class="seller-card__count" aria-hidden="true">·</span>
            </template>
            <span class="seller-card__count seller-card__total">{{ $t('catalog.productsCount', total, { named: { count: total } }) }}</span>
          </p>
        </div>
      </section>
    </div>

    <section class="seller-page__products">
      <h2 class="visually-hidden">{{ $t('ui.catalog.sellerItem.allProducts') }}</h2>
      <div class="seller-page__inner" style="--columns: 5">
        <UiState
          :status="productsStatus"
          :empty="!products.length"
          :skeletons="5"
          :empty-title="$t('ui.catalog.sellerItem.emptyTitle')"
          :empty-text="$t('ui.catalog.sellerItem.emptyText')"
          empty-illustration="/mock/empty-filters.svg"
          @retry="refresh()"
        >
          <div class="seller-page__grid">
            <UiProductCard v-for="product in products" :key="product.id" :product="product" />
          </div>

          <button v-if="hasMore" type="button" class="seller-page__more" :disabled="status === 'pending'" @click="showMore">
            {{ $t('common.pokazatEsche') }}
          </button>
        </UiState>
      </div>
    </section>

    <HomePromoBanners :banners="promoBanners" :loading="bannersStatus === 'pending'" />
    <HomeShelf :title="$t('home.wow')" :more-link="localePath('/search?kind=wow')" :products="recommended ?? []" :loading="recommendedStatus === 'pending'" />
  </div>
</template>

<style scoped>
.seller-page { background: var(--color-page); }

.seller-page__head {
  width: var(--container-width);
  margin-inline: auto;
}

.seller-page__breadcrumbs {
  padding-block: 24px 20px;
  font-weight: 400;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* Карточка продавца 479×92 r24 — как в макете, без кнопки «все товары»:
   мы уже на этой странице */
.seller-card {
  display: flex;
  gap: 16.9px;
  align-items: center;
  width: 479px;
  height: 92px;
  padding-inline: 15px;
  border-radius: 24px;
  background: var(--color-surface);
}

.seller-card__rating-skeleton { margin-top: 8px; }

.seller-card__logo {
  flex: none;
  width: 62px;
  height: 62px;
  border-radius: 11.28px;
  object-fit: cover;
}

.seller-card__logo--empty {
  background: var(--color-field);
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: var(--text-6xl);
  color: var(--color-text-muted);
  user-select: none;
}

.seller-card__details { display: flex; flex-direction: column; gap: 2.8px; }

.seller-card__name {
  margin: 0;
  color: var(--color-text);
  font: var(--type-card-title);
}

.seller-card__rating {
  display: flex;
  gap: 5.6px;
  align-items: center;
  margin: 0;
  line-height: 20px;
}

.seller-card__value {
  font-weight: 700;
  font-size: var(--text-lg);
  color: var(--color-text);
}

.seller-card__count {
  font-weight: 400;
  font-size: var(--text-lg);
  color: var(--color-gray);
}

/* Полка товаров продавца: в макете заголовка нет, только сетка на белом */
.seller-page__products {
  margin-top: 20px;
  padding-block: 20px 25px;
  background: var(--color-surface);
}

.seller-page__inner {
  width: var(--container-width);
  margin-inline: auto;
}

.seller-page__grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 11.1px;
}

/* Кнопка догрузки — как в каталоге */
.seller-page__more {
  display: block;
  width: 100%;
  margin-top: 20px;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.seller-page__more:hover { background: var(--color-brand-dark); }
.seller-page__more:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.seller-page__more:disabled { opacity: .6; cursor: default; }
</style>
