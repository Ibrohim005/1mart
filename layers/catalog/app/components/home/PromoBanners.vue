<script setup lang="ts">
/**
 * Пара промо-баннеров между полками — как у Uzum: два баннера в ряд
 * на всю ширину контейнера. Набор свой (площадка shop_platform), не тот,
 * что в большой карусели.
 */
import type { Banner } from '#shared/types/catalog'

const props = defineProps<{
  banners: Banner[]
  /** Баннеры ещё едут — вместо них показываем скелетон */
  loading?: boolean
}>()
const localePath = useLocalePath()

/** Ровно пара: третий баннер в ряд из двух повис бы один на строке */
const pair = computed(() => props.banners.slice(0, 2))

function amount(value: { amount: number, currency: 'UZS' }) {
  return groupDigits(toSum(value))
}
</script>

<template>
  <section v-if="loading" class="promos" aria-busy="true" aria-live="polite">
    <span class="visually-hidden">{{ $t('ui.shared.state.loading') }}</span>
    <span v-for="n in 2" :key="n" class="promo">
      <UiSkeleton width="100%" height="100%" radius="20px" />
    </span>
  </section>

  <section v-else-if="pair.length" class="promos">
    <article
      v-for="(banner, index) in pair"
      :key="`${banner.id}-${index}`"
      class="promo"
      :class="`promo--${banner.tone}`"
    >
      <!-- Баннер целиком картинка и целиком ссылка; текст для поиска — в alt
           и в скрытом описании, потому что в картинку он впечатан -->
      <NuxtLink v-if="banner.imageSmall" :to="localePath(banner.link)" class="promo__link">
        <UiImage
          :src="banner.imageSmall"
          :alt="banner.title"
          width="612"
          height="248"
          loading="lazy"
          class="promo__image"
        />
        <span class="visually-hidden">{{ banner.description }}</span>
      </NuxtLink>

      <NuxtLink v-else :to="localePath(banner.link)" class="promo__link promo__link--coded">
        <h2 class="promo__title">{{ banner.title }}</h2>

        <p class="promo__old-line">
          <s class="promo__old-price">{{ amount(banner.oldPrice) }}</s>
          <span class="promo__discount">{{ banner.discountLabel }}</span>
        </p>

        <p class="promo__price">
          {{ amount(banner.price) }}<span class="promo__currency">{{ $t('common.currency') }}</span>
        </p>

        <span class="promo__until">{{ banner.until }}</span>
        <UiImage v-if="banner.image" :src="banner.image" alt="" width="220" height="220" loading="lazy" class="promo__photo" />
      </NuxtLink>
    </article>
  </section>
</template>

<style scoped>
.promo__link {
  display: block;
  width: 100%;
  height: 100%;
  line-height: 0;
}

.promo__link--coded { position: relative; line-height: normal; text-decoration: none; }

/* Фото товара справа; скелетон отключён, иначе на тёмном фоне виден светлый квадрат */
.promo .promo__photo {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 220px;
  height: 220px;
  background: none;
  animation: none;
  object-fit: contain;
}

.promo__image {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}

.promos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  width: var(--container-width);
  margin: 20px auto;
}

.promo {
  position: relative;
  /* Пропорции макетов баннеров заказчика: 853×345 */
  height: 248px;
  border-radius: 20px;
  overflow: hidden;
  background: var(--color-topbar);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.promo:hover { box-shadow: 0 10px 28px rgb(39 49 64 / 14%); }

.promo--orange {
  background: linear-gradient(223deg, #FFD3B0 0%, #FA8231 55%, #D9601A 100%);
}

.promo--violet {
  background: var(--promo-dark-bg);
}

.promo__title {
  position: absolute;
  top: 17px;
  left: 20px;
  width: 330px;
  margin: 0;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-8xl);
  line-height: 29.7px;
  color: var(--color-surface);
}

.promo__old-line {
  position: absolute;
  top: 121px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 5.9px;
  margin: 0;
}

.promo__old-price {
  font-family: var(--font-ui);
  font-weight: 500;
  font-size: var(--text-2xl);
  line-height: 19.2px;
  color: rgb(255 255 255 / 60%);
}

.promo__discount {
  display: inline-flex;
  align-items: center;
  height: 33.7px;
  padding-inline: 8px;
  border-radius: 8.2px;
  background: var(--color-surface);
  font-family: var(--font-ui);
  font-weight: 800;
  font-size: var(--text-2xl);
  line-height: 19.5px;
  color: #000000;
}

.promo__price {
  position: absolute;
  top: 155.8px;
  left: 20px;
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 0;
  font-family: var(--font-ui);
  font-weight: 800;
  font-size: var(--text-display);
  line-height: 37.9px;
  color: var(--color-surface);
}

.promo__currency { font-size: var(--text-5xl); line-height: 24.8px; }

.promo__until {
  /* Срок под ценой: справа его закрывало фото товара */
  position: absolute;
  top: 204px;
  left: 20px;
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding-inline: 12px;
  border-radius: 999px;
  background: rgb(255 255 255 / 20%);
  font-family: var(--font-ui);
  font-weight: 500;
  font-size: var(--text-sm);
  line-height: 20px;
  color: var(--color-surface);
}
</style>
