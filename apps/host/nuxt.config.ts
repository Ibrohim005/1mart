// https://nuxt.com/docs/api/configuration/nuxt-config
import { createRequire } from 'node:module'

/*
 * @nuxt/eslint is a root devDependency. A production install (NODE_ENV=production,
 * as on Vercel) skips devDependencies, and an unresolvable module makes the
 * postinstall `nuxt prepare` fail the whole `npm install`. The module only
 * generates the lint config, so load it only when it is installed.
 */
const hasNuxtEslint = (() => {
  try {
    createRequire(import.meta.url).resolve('@nuxt/eslint')
    return true
  }
  catch {
    return false
  }
})()

export default defineNuxtConfig({
  compatibilityDate: '2026-09-18',

  // Слои подключаются от общего к частному: более поздний слой
  // может переопределить компонент или страницу более раннего.
  extends: [
    '../../layers/shared',
    '../../layers/app-shell',
    '../../layers/catalog',
    '../../layers/pdp',
    '../../layers/cart',
    '../../layers/checkout',
    '../../layers/account',
    // Адаптер к настоящему бэкенду. Подключается только когда задан адрес:
    // без переменной сайт работает ровно как раньше, на моках. Стоит ПЕРЕД
    // api-mock — Nitro берёт обработчик из первого слоя, где тот определён,
    // поэтому непереведённые роуты продолжает обслуживать мок, и переводить
    // их можно по одному, а не всё разом.
    ...(process.env.NUXT_UPSTREAM_BASE ? ['../../layers/api-backend'] : []),
    '../../layers/api-mock',
  ],

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    // Линтер: модуль генерирует конфиг под структуру проекта
    ...(hasNuxtEslint ? ['@nuxt/eslint'] : []),
    // Бандл: sitemap + robots + schema.org + og-image + canonical/meta
    '@nuxtjs/seo',
  ],

  // Pinia не сканирует stores/ внутри слоёв автоматически — указываем явно.
  // ВАЖНО: перечисляем только слои витрины, НЕ `layers/*`. Общий glob цеплял и
  // `layers/merchant` (слой кабинета), чьи stub-сторы useAuthStore/useCartStore
  // перекрывали настоящие — витрина падала на typecheck. Кабинет сюда не входит.
  pinia: {
    storesDirs: [
      '../../layers/app-shell/app/stores/**',
      '../../layers/cart/app/stores/**',
      '../../layers/catalog/app/stores/**',
      '../../layers/checkout/app/stores/**',
      '../../layers/account/app/stores/**',
      '../../layers/pdp/app/stores/**',
    ],
  },

  /* ---------------------------------------------------------------
   * SEO
   * ------------------------------------------------------------- */
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://market.paylov.uz',
    name: '1mart',
    defaultLocale: 'ru',
  },

  sitemap: {
    // Товары и категории отдаются динамически из /api/__sitemap__/urls,
    // чтобы карта сайта всегда соответствовала каталогу.
    sources: ['/api/__sitemap__/urls'],
    autoI18n: true,
    // Личные и служебные страницы в карту сайта не попадают.
    // Непереведённые языки — тоже: там русский текст под чужим адресом.
    exclude: ['/search', '/cart', '/checkout/**', '/account/**', '/en/**', '/kaa/**'],
    xslColumns: [
      { label: 'URL', width: '60%' },
      { label: 'Последнее изменение', select: 'sitemap:lastmod', width: '40%' },
    ],
  },

  robots: {
    /*
     * Языки без перевода закрыты от индексации: страницы /en и /kaa пока
     * показывают русский текст, и поисковик счёл бы их дублями. Убрать из
     * списка, как только словарь языка будет заполнен.
     */
    disallow: ['/cart', '/checkout', '/account', '/search?', '/en', '/kaa'],
  },

  schemaOrg: {
    identity: {
      type: 'OnlineStore',
      name: '1mart',
      url: 'https://market.paylov.uz',
    },
  },

  /* ---------------------------------------------------------------
   * Изображения: современные форматы + фиксированные пресеты,
   * чтобы не плодить бесконечные варианты и не ломать CLS.
   * ------------------------------------------------------------- */
  image: {
    // Фото товаров демо-каталога (dummyjson) — оптимизируются через IPX как локальные
    domains: ['cdn.dummyjson.com'],
    format: ['avif', 'webp'],
    quality: 80,
    densities: [1, 2],
    screens: { xs: 360, sm: 480, md: 768, lg: 1024, xl: 1280, xxl: 1536 },
    presets: {
      productCard: { modifiers: { format: 'avif', width: 300, height: 300, fit: 'cover' } },
      productGallery: { modifiers: { format: 'avif', width: 700, height: 700, fit: 'contain' } },
      productThumb: { modifiers: { format: 'avif', width: 72, height: 72, fit: 'cover' } },
      banner: { modifiers: { format: 'avif', width: 1280, height: 400, fit: 'cover' } },
      categoryIcon: { modifiers: { format: 'webp', width: 96, height: 96, fit: 'contain' } },
    },
  },

  // Самохостинг шрифтов: без запроса к Google, с preload и fallback-метриками
  // (убирает сдвиг макета при подгрузке шрифта — это прямой вклад в CLS).
  // Весь интерфейс набран одним Inter — по решению заказчика.
  // Самохостинг с fallback-метриками, чтобы подгрузка не двигала макет (CLS).
  fonts: {
    // Шрифты заказчика лежат в public/fonts и подключены через @font-face
    // в main.css; модулю запрещаем подтягивать их же из Google.
    families: [
      { name: 'Vela Sans', provider: 'none' },
      { name: 'Rubik', provider: 'none' },
      { name: 'Inter', provider: 'none' },
    ],
  },


  i18n: {
    defaultLocale: 'ru',
    strategy: 'prefix_except_default',
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://market.paylov.uz',
    /*
     * Пять языков региона. `uz-cyrl` — тот же узбекский кириллицей: на нём
     * читает старшее поколение и часть Каракалпакстана, поэтому это отдельный
     * язык интерфейса, а не вариант написания.
     * TODO: тексты en и kaa пока повторяют русские — ждут перевода.
     */
    locales: [
      { code: 'ru', language: 'ru-RU', name: 'Русский', files: ['ru.json', 'shell/ru.json', 'pay/ru.json'] },
      { code: 'uz', language: 'uz-UZ', name: "O'zbekcha", files: ['uz.json', 'shell/uz.json', 'pay/uz.json'] },
      { code: 'uz-cyrl', language: 'uz-Cyrl-UZ', name: 'Ўзбекча', files: ['uz-cyrl.json', 'shell/uz-cyrl.json', 'pay/uz-cyrl.json'] },
      { code: 'en', language: 'en-US', name: 'English', files: ['en.json', 'shell/en.json', 'pay/en.json'] },
      { code: 'kaa', language: 'kaa-UZ', name: 'Qaraqalpaqsha', files: ['kaa.json', 'shell/kaa.json', 'pay/kaa.json'] },
    ],
    // Переводы грузятся лениво по умолчанию;
    // hreflang-альтернативы и canonical проставляются автоматически
    /*
     * Автоопределение языка выключено намеренно. Оно уводило бы браузер
     * с английской локалью на /en, где пока лежит русский текст, — это хуже,
     * чем просто показать русскую версию. Выбор языка запоминается в cookie
     * при первом же переключении.
     * TODO: включить обратно, когда en и kaa будут переведены.
     */
    detectBrowserLanguage: false,
  },

  /* ---------------------------------------------------------------
   * Кэш SSR. Карточка товара и категории кэшируются на edge,
   * цена и остаток догружаются отдельным лёгким запросом на клиенте
   * (приём, подсмотренный у Uzum — см. UZUM-ANALYSIS.md).
   * ------------------------------------------------------------- */
  routeRules: {
    /*
     * Заголовки безопасности. В dev их подставляет сам Nuxt, в собранном
     * приложении — нет, поэтому задаём явно на все маршруты.
     *
     * CSP: 'unsafe-inline' для стилей нужен Vue (scoped-стили и инлайновые
     * атрибуты style), для скриптов — гидратационный payload Nuxt. Когда
     * появится бэкенд, их стоит заменить на nonce.
     * Шрифты и картинки — только свои: @nuxt/fonts скачивает гарнитуры
     * в сборку, внешних CDN в рантайме нет.
     */
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        // Геолокация разрешена только своему origin — её просит карта адреса
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': [
          "default-src 'self'",
          // Яндекс.Карты грузятся своим скриптом — иначе карта не отрисуется
          "script-src 'self' 'unsafe-inline' https://api-maps.yandex.ru https://yastatic.net",
          "style-src 'self' 'unsafe-inline'",
          // Тайлы карты: Яндекс, пока не задан ключ — OpenStreetMap
          "img-src 'self' data: blob: https://cdn.dummyjson.com https://tile.openstreetmap.org https://*.maps.yandex.net https://yastatic.net https://api-maps.yandex.ru",
          "media-src 'self'",
          "font-src 'self' data:",
          "connect-src 'self' https://api-maps.yandex.ru https://*.maps.yandex.net",
          "frame-ancestors 'none'",
          "form-action 'self'",
          "base-uri 'self'",
          "object-src 'none'",
        ].join('; '),
      },
    },

    '/': { isr: 300 },
    // Категорию и поиск не кэшируем целиком: результат зависит
    // от сортировки и фильтров в query-параметрах.
    '/category/**': { isr: false },
    '/uz/category/**': { isr: false },
    '/search': { isr: false, robots: false },
    '/product/**': { isr: 600 },
    '/uz/product/**': { isr: 600 },
    // Личные страницы закрыты от индексации, но рендерятся на сервере —
    // так первый экран появляется сразу, без «прыжка» после загрузки JS.
    '/cart': { robots: false },
    '/checkout/**': { robots: false },
    '/account/**': { robots: false },
  },

  runtimeConfig: {
    public: {
      // Пока указывает на встроенные mock-роуты (/api/...).
      // Когда появится бэкенд — меняется одна переменная NUXT_PUBLIC_API_BASE.
      apiBase: '/api',
      /*
       * Куда ведёт «Стать продавцом». Своего лендинга у витрины больше нет
       * (статический seller-landing/ от Zoo удалён) — ведём в кабинет продавца.
       */
      sellerLandingUrl: process.env.NUXT_PUBLIC_SELLER_LANDING_URL
        || process.env.NUXT_PUBLIC_SELLER_CABINET_URL
        || 'https://business.paylov.uz/',
      /** Кабинет продавца 1mart */
      sellerCabinetUrl: process.env.NUXT_PUBLIC_SELLER_CABINET_URL || 'https://business.paylov.uz/',
      /** Витрина: туда уводит «Бесплатные объявления» из кабинета */
      storefrontUrl: process.env.NUXT_PUBLIC_STOREFRONT_URL || 'https://market.paylov.uz/',
      /*
       * Ссылки на мобильное приложение. Держим в настройках, а не в разметке:
       * адрес в сторе меняется без участия фронта, а iOS-версии пока нет.
       * TODO: подставить ссылку App Store, когда приложение появится.
       */
      googlePlayUrl: process.env.NUXT_PUBLIC_GOOGLE_PLAY_URL
        || 'https://play.google.com/store/apps/details?id=uz.paylov.app',
      appStoreUrl: process.env.NUXT_PUBLIC_APP_STORE_URL || '',
      /*
       * Ключ Яндекс.Карт. Пока он не задан, карта выбора адреса работает
       * на OpenStreetMap — иначе форма адреса осталась бы без карты вовсе.
       * Ключ выдают в кабинете разработчика Яндекса, он привязывается
       * к домену и в репозиторий не кладётся.
       */
      yandexMapsKey: process.env.NUXT_PUBLIC_YANDEX_MAPS_KEY || '',
    },
  },

  future: { compatibilityVersion: 4 },
  experimental: { payloadExtraction: true },
  devtools: { enabled: true },
})
