// @ts-check
import withNuxt from './apps/host/.nuxt/eslint.config.mjs'

/**
 * Линтер проекта. Конфига не было вовсе — `npm run lint` падал с
 * «couldn't find an eslint.config.js», поэтому правила не проверялись ни разу.
 */
export default withNuxt({
  ignores: [
    '**/.nuxt/**',
    '**/.output/**',
    '**/dist/**',
    '**/node_modules/**',
    'design/**',
    'test-results/**',
    'playwright-report/**',
  ],
  rules: {
    // Инлайновый SVG подставляется из собственных ассетов — это осознанно
    'vue/no-v-html': 'off',

    /*
     * Компоненты лежат в папках с префиксом и регистрируются как UiButton,
     * CatalogFilterPanel, HomeShelf — то есть имена уже составные.
     * Правило смотрит только на имя файла и ругается на каждый из них.
     */
    'vue/multi-word-component-names': 'off',
  },
})
