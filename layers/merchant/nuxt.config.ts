// Кабинет продавца. UI-кит кабинета доступен глобально с префиксом M:
// <MCard />, <MTable />, <MStatTile /> — по образцу Ui-кита из @zoo/shared.
export default defineNuxtConfig({
  components: [
    // Путь относителен srcDir слоя (app/), поэтому './components', а не
    // './app/components' — иначе каталог не находится и M-кит не регистрируется.
    { path: './components', prefix: 'M', pathPrefix: false, global: true },
  ],
})
