// 1mart Business — кабинет продавца (Merchant Cabinet) и лендинг для продавцов.
// Отдельное приложение, живёт на business.paylov.uz. Витрина (apps/host) уводит
// сюда по ссылке «Стать продавцом». Делит с витриной только дизайн-систему
// (@zoo/shared): токены, шрифт, UI-кит.

export default defineNuxtConfig({
  compatibilityDate: '2026-09-18',

  // Визуальный язык B2B-части («confident fintech»). Грузится ПОСЛЕ css слоёв
  // (@zoo/shared tokens/main), поэтому его надстройка над токенами выигрывает.
  css: ['@zoo/merchant/app/assets/css/business.css'],

  // От общего к частному: дизайн-система → кабинет → лендинг → моки.
  // api-backend появится позже тем же приёмом, что и на витрине.
  extends: [
    '../../layers/shared',
    '../../layers/merchant',
    '../../layers/seller-landing',
    '../../layers/merchant-mock',
  ],

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
  ],

  // Pinia не сканирует stores/ внутри слоёв автоматически — указываем явно.
  // Только слой кабинета: бизнес-приложение не подключает сторы витрины.
  pinia: {
    storesDirs: ['../../layers/merchant/app/stores/**'],
  },

  // Шрифты заказчика лежат в витрине (public/fonts); здесь берём те же гарнитуры
  // через @nuxt/fonts с provider none — @font-face объявлен в @zoo/shared/main.css.
  fonts: {
    families: [
      { name: 'Vela Sans', provider: 'none' },
      { name: 'Rubik', provider: 'none' },
      { name: 'Inter', provider: 'none' },
    ],
  },

  image: {
    format: ['avif', 'webp'],
    quality: 80,
    densities: [1, 2],
    presets: {
      // Миниатюра товара в таблицах кабинета.
      productThumb: { modifiers: { format: 'avif', width: 72, height: 72, fit: 'cover' } },
      avatar: { modifiers: { format: 'webp', width: 96, height: 96, fit: 'cover' } },
    },
  },

  i18n: {
    defaultLocale: 'ru',
    strategy: 'prefix_except_default',
    baseUrl: process.env.NUXT_PUBLIC_BUSINESS_URL || 'https://business.paylov.uz',
    // Кабинет пока на двух языках региона: русский (по умолчанию) и узбекский.
    // Остальные подключатся тем же списком, когда появятся переводы.
    locales: [
      { code: 'ru', language: 'ru-RU', name: 'Русский', files: ['ru.json'] },
      { code: 'uz', language: 'uz-UZ', name: "O'zbekcha", files: ['uz.json'] },
    ],
    detectBrowserLanguage: false,
  },

  runtimeConfig: {
    public: {
      // Как и на витрине: сейчас mock-роуты внутри Nuxt (/api/...),
      // позже — одна переменная NUXT_PUBLIC_API_BASE.
      apiBase: '/api',
      // Витрина 1mart Market — туда уводит «Перейти на витрину» из кабинета.
      storefrontUrl: process.env.NUXT_PUBLIC_STOREFRONT_URL || 'https://market.paylov.uz/',
      supportPhone: process.env.NUXT_PUBLIC_SUPPORT_PHONE || '+998 71 200 00 00',
      supportEmail: process.env.NUXT_PUBLIC_SUPPORT_EMAIL || 'business@paylov.uz',
    },
  },

  routeRules: {
    // Заголовки безопасности: в собранном приложении Nuxt их не ставит,
    // задаём на все маршруты. Профиль как у витрины, без Яндекс.Карт.
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https://cdn.dummyjson.com",
          "media-src 'self'",
          "font-src 'self' data:",
          "connect-src 'self'",
          "frame-ancestors 'none'",
          "form-action 'self'",
          "base-uri 'self'",
          "object-src 'none'",
        ].join('; '),
      },
    },
    // Кабинет закрыт от индексации через `useSeoMeta({ robots: 'noindex' })`
    // на самих страницах — отдельного SEO-модуля здесь нет.
  },

  future: { compatibilityVersion: 4 },
  experimental: { payloadExtraction: true },
  devtools: { enabled: true },
})
