import { defineConfig, devices } from '@playwright/test'

/**
 * E2E-тесты гоняются против запущенного дев-сервера на 3000.
 * Основной прогон — в установленном в системе Chrome; Firefox и WebKit
 * гоняют только блок «Аудит: …», чтобы ловить движковые отличия.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    // PW_BASE_URL позволяет гонять набор по собранному приложению:
    // долгие обходы сервер разработки не выдерживает
    baseURL: process.env.PW_BASE_URL || 'http://localhost:3000',
    viewport: { width: 1440, height: 1000 },
    actionTimeout: 15_000,
  },

  /*
   * Локально переиспользуем уже запущенный дев-сервер. В CI поднимаем
   * собранное приложение: раньше конвейер просто не имел сервера, и все
   * тесты падали по таймауту, а заодно проверять продакшен-сборку полезнее.
   */
  webServer: {
    command: process.env.CI ? 'npm run build && npm run preview' : 'npm run dev',
    url: process.env.PW_BASE_URL || 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    /*
     * Локально — установленный в системе Chrome, в CI — встроенный Chromium:
     * в образе Playwright отдельного Chrome нет.
     */
    {
      name: 'desktop-1440',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.CI ? {} : { channel: 'chrome' }),
        viewport: { width: 1440, height: 1000 },
      },
    },

    /*
     * Firefox и WebKit гоняют сокращённый набор — «Аудит: …». Полный прогон
     * в трёх движках занимал бы втрое больше, а движковые отличия ловятся
     * именно этими сценариями: фокус, прокрутка фона, заголовки, геометрия.
     * Так нашлось, что Safari не фокусирует кнопку по клику.
     */
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 1000 } }, grep: /Аудит:/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 1000 } }, grep: /Аудит:/ },
  ],
})
