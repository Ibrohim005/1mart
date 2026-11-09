<script setup lang="ts">
// Создание товара. Вся форма — в переиспользуемом MProductForm (та же форма
// работает и на редактировании, см. products/[id].vue).
definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({ title: () => `${t('m.productForm.titleNew')} — spotshop Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MPageHeader :title="$t('m.productForm.titleNew')">
      <NuxtLink :to="localePath('/products')">
        <UiButton variant="ghost">{{ $t('m.productForm.backToList') }}</UiButton>
      </NuxtLink>
    </MPageHeader>

    <MProductForm />
  </div>
</template>
