<script setup lang="ts">
/** Карточка продавца. Макет: seller-card 479×173, r24. */
import type { Seller } from '#shared/types/catalog'

const props = defineProps<{ seller: Seller }>()
const localePath = useLocalePath()

// Товары продавца ищем поиском по его названию
const sellerLink = computed(() => localePath(`/seller/${props.seller.slug}`))

/*
 * Ссылка на логотип у продавца записана, а файла по ней нет — медиасервер
 * отдаёт 404. Пустой `v-if` тут не спасает: адрес не пустой, картинка
 * рисуется, ломается и показывает вместо себя название продавца голым
 * текстом поверх макета. Падение засчитываем и переключаемся на ту же
 * заглушку, что и у продавца вовсе без логотипа.
 */
const logoBroken = ref(false)
watch(() => props.seller.logo, () => { logoBroken.value = false })

/**
 * Заглушка — первая буква названия, а не пустой серый квадрат.
 *
 * Пустая плашка читается как «тут что-то не загрузилось» и выглядит поломкой
 * ровно в том месте, где покупатель решает, доверяет ли он продавцу. Буква
 * сразу читается как намеренная: так же показывают аккаунт без аватара и
 * маркетплейсы, и почтовые клиенты.
 */
const logoInitial = computed(() => (props.seller.title || '').trim().charAt(0).toUpperCase())

/**
 * Одного `@error` мало. Картинка успевает загрузиться (и упасть) до того, как
 * Vue оживит разметку, — события тогда уже не будет, и `logoBroken` навсегда
 * останется false: на странице висел битый `<img>` вместо заглушки. Тот же
 * приём, по той же причине, что и в `UiImage`.
 */
const logo = useTemplateRef<HTMLImageElement>('logo')
onMounted(() => {
  // complete при нулевой ширине = загрузка уже провалилась
  if (logo.value?.complete && logo.value.naturalWidth === 0) logoBroken.value = true
})
</script>

<template>
  <section class="seller">
    <div class="seller__profile">
      <img
        v-if="seller.logo && !logoBroken"
        ref="logo"
        :src="seller.logo"
        alt=""
        width="62"
        height="62"
        class="seller__logo"
        @error="logoBroken = true"
      />
      <span v-else class="seller__logo seller__logo--empty" aria-hidden="true">{{ logoInitial }}</span>

      <div class="seller__details">
        <p class="seller__name">{{ seller.title }}</p>
        <p class="seller__rating">
          <UiIcon name="star-fill" color="#FF9F0A" :size="17" />
          <span class="seller__rating-value">{{ seller.rating.toFixed(1) }}</span>
          <span class="seller__rating-count">{{ $t('ui.pdp.sellerCard.ratingsCount', { count: seller.reviewsCount, word: $t('common.ocenka', seller.reviewsCount) }) }}</span>
        </p>
      </div>
    </div>

    <NuxtLink :to="sellerLink" class="seller__more">{{ $t('ui.pdp.sellerCard.drugieProdukty') }}</NuxtLink>
  </section>
</template>

<style scoped>
.seller {
  padding: 15px;
  border-radius: 24px;
  background: var(--color-surface);
}

.seller__profile { display: flex; gap: 16.9px; }

.seller__logo { width: 62px; height: 62px; border-radius: 11.3px; object-fit: cover; }
.seller__logo--empty {
  background: #EBEFF2;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 26px;
  color: var(--color-text-muted, #90949C);
  user-select: none;
}

.seller__name {
  margin: 7.6px 0 0;
  font-weight: 700;
  font-size: var(--text-2xl);
  line-height: 23.9px;
  color: #111111;
}

.seller__rating {
  display: flex;
  align-items: center;
  gap: 5.5px;
  margin: 2.8px 0 0;
  font-size: var(--text-lg);
  line-height: 20.5px;
}

.seller__rating-value { font-weight: 700; color: #111111; }
.seller__rating-count { font-weight: 400; color: #90949C; }

.seller__more {
  display: grid;
  place-items: center;
  width: 100%;
  text-decoration: none;
  margin-top: 22.6px;
  border: 0;
  background: #F2F4F7;
  color: #111111;
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}
</style>
