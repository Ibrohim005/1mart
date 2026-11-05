// Лендинг для продавцов. Секции уже названы с префиксом Landing в имени файла
// (LandingHero.vue, LandingTariffs.vue), поэтому здесь префикс НЕ добавляем —
// иначе имя компонента удвоилось бы до <LandingLandingHero /> и не находилось.
export default defineNuxtConfig({
  components: [
    // Путь относителен srcDir слоя (app/) — './components', не './app/components'.
    { path: './components', pathPrefix: false },
  ],
})
