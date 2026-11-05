export default defineNuxtConfig({
  components: [
    { path: './components/catalog', prefix: 'Catalog', pathPrefix: false, global: true },
    { path: './components/home', prefix: 'Home', pathPrefix: false, global: true },
    { path: './components/info', prefix: 'Info', pathPrefix: false },
  ],
})
