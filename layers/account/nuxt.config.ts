/**
 * Кабинет нужен только на /account/**:
 * компоненты подключаются по месту использования, а не грузятся на каждой странице.
 */
export default defineNuxtConfig({
  components: [{ path: './components', prefix: 'Account', pathPrefix: false }],
})
