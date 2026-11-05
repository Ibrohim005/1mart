/**
 * Карточка товара нужна только на /product/** — без global Nuxt выносит её в отдельный чанк:
 * компоненты подключаются по месту использования, а не грузятся на каждой странице.
 */
export default defineNuxtConfig({
  components: [{ path: './components', prefix: 'Pdp', pathPrefix: false }],
})
