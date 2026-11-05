/**
 * Корзина нужна только на /cart и /checkout:
 * компоненты подключаются по месту использования, а не грузятся на каждой странице.
 */
export default defineNuxtConfig({
  components: [{ path: './components', prefix: 'Cart', pathPrefix: false }],
})
