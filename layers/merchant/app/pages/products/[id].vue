<script setup lang="ts">
// Редактирование товара. Та же форма, что и при создании (MProductForm):
// предзаполняется из товара и сохраняется через PUT.
import type { ProductDetail } from '#shared/types/merchant'

definePageMeta({ layout: 'merchant', middleware: 'merchant-auth' })

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const id = route.params.id as string

const { data: product, status, error, refresh } = await useApiData<ProductDetail>(`m:product:${id}`, `/merchant/products/${id}`)

useSeoMeta({ title: () => `${t('m.productForm.titleEdit')} — 1mart Business`, robots: 'noindex, nofollow' })
</script>

<template>
  <div>
    <MNotFound
      v-if="(error as { statusCode?: number } | null)?.statusCode === 404"
      to="/products"
      :back-label="$t('m.productForm.backToList')"
    />
    <MLoadError v-else-if="status === 'error'" @retry="refresh()" />
    <template v-else>
    <MPageHeader :title="$t('m.productForm.titleEdit')">
      <NuxtLink :to="localePath('/products')">
        <UiButton variant="ghost">{{ $t('m.productForm.backToList') }}</UiButton>
      </NuxtLink>
    </MPageHeader>

    <div v-if="status === 'pending' && !product" class="pedit-loading">
      <UiSkeleton height="420px" radius="18px" />
      <UiSkeleton height="180px" radius="18px" />
    </div>
    <MProductForm v-else-if="product" :initial="product" :product-id="id" />
    </template>
  </div>
</template>

<style scoped>
.pedit-loading { display: flex; flex-direction: column; gap: 20px; }
</style>
