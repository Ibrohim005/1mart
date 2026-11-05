export default defineNuxtConfig({
  css: [
    '@zoo/shared/app/assets/css/tokens.css',
    '@zoo/shared/app/assets/css/main.css',
  ],
  components: [
    // UI-кит слоя доступен глобально с префиксом Ui: <UiButton />, <UiPrice />
    { path: './components/ui', prefix: 'Ui', pathPrefix: false, global: true },
  ],
})
