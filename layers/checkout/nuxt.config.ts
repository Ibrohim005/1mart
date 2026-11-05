/**
 * Оформление нужно только на /checkout:
 * компоненты подключаются по месту использования, а не грузятся на каждой странице.
 */
export default defineNuxtConfig({
  components: [{ path: './components', prefix: 'Checkout', pathPrefix: false }],
})
