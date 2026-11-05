<script setup lang="ts">
/**
 * Скелетон карточки товара. Повторяет раскладку страницы из макета
 * (контейнер 1240, левая колонка 740, правая 479, зазор 21) и геометрию
 * галереи — превью 176.5×227.9 и главное фото 539.1×696.2 r28.3.
 * Размеры совпадают с настоящими, поэтому при подстановке товара
 * страница не перестраивается.
 */
</script>

<template>
  <div class="pdp-skeleton" aria-busy="true" aria-live="polite">
    <span class="visually-hidden">{{ $t('ui.shared.state.loading') }}</span>

    <div class="pdp-skeleton__breadcrumbs">
      <UiSkeleton width="260px" height="14px" />
    </div>

    <div class="pdp-skeleton__layout">
      <div class="pdp-skeleton__left">
        <div class="pdp-skeleton__gallery">
          <div class="pdp-skeleton__thumbs">
            <UiSkeleton v-for="n in 3" :key="n" width="176.5px" height="227.9px" radius="9.3px" />
          </div>
          <UiSkeleton width="539.1px" height="696.2px" radius="28.3px" />
        </div>

        <!-- Отзывы, описание и характеристики — три карточки одной ширины -->
        <UiSkeleton v-for="n in 3" :key="n" width="100%" :height="`${[220, 180, 260][n - 1]}px`" radius="22.4px" />
      </div>

      <div class="pdp-skeleton__right">
        <!-- Цена, название, опции и кнопки — один блок 479×614.6 по макету -->
        <UiSkeleton width="100%" height="614.6px" radius="22.4px" />
        <UiSkeleton width="100%" height="118px" radius="22.4px" />
        <UiSkeleton v-for="n in 2" :key="n" width="100%" height="150px" radius="22.4px" />
        <UiSkeleton width="100%" height="92px" radius="24px" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pdp-skeleton {
  width: var(--container-width);
  margin-inline: auto;
  padding-bottom: var(--section-gap);
}

.pdp-skeleton__breadcrumbs { padding-block: 24px; }

.pdp-skeleton__layout {
  display: flex;
  gap: 21px;
  align-items: flex-start;
}

.pdp-skeleton__left {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 740px;
}

.pdp-skeleton__gallery { display: flex; gap: 17.4px; }

.pdp-skeleton__thumbs {
  display: flex;
  flex-direction: column;
  gap: 7.5px;
  width: 176.5px;
}

.pdp-skeleton__right {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 479px;
}
</style>
