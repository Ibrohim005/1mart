import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Обход сайта: собирает все внутренние ссылки, ходит по ним и пишет отчёт —
 * какие адреса отвечают ошибкой, где нет заголовка, где вместо содержимого
 * заглушка и где в консоли ошибки. Обычным прогоном не запускается — только
 * по флагу:
 *   AUDIT=1 npx playwright test tests/e2e/audit-crawl.spec.ts --project=desktop-1440
 *
 * Объём можно урезать: AUDIT_PAGES=20. Не запускать одновременно со вторым
 * прогоном Playwright — они делят один dev-сервер.
 */
const SEEDS = [
  '/', '/cart', '/checkout', '/search?q=rolex', '/category/vse',
  '/product/chasy-rolex-submariner-chernyy-bezel-1098',
  '/account/orders', '/account/reviews', '/account/promo', '/account/settings',
  '/account/bonuses', '/account/favorites', '/account/ads', '/account/auctions',
  '/account/seller', '/account/transactions', '/account',
]

const MAX_PAGES = Number(process.env.AUDIT_PAGES ?? 90)

async function asUser(page: Page) {
  await page.context().addCookies([{
    name: 'paylov_auth',
    value: encodeURIComponent(JSON.stringify({ phone: '+998 90 123-45-67', name: 'Шохрух Бахтиёров' })),
    domain: 'localhost',
    path: '/',
  }])
}

type Row = {
  url: string
  status: number
  h1: string
  headings: number
  interactive: number
  text: number
  empty: boolean
  errors: string[]
}

test('обход сайта: что отвечает и чего не хватает', async ({ page, baseURL }) => {
  test.skip(!process.env.AUDIT, 'обход включается флагом AUDIT=1')
  test.setTimeout(15 * 60 * 1000)
  await asUser(page)

  const origin = new URL(baseURL ?? 'http://localhost:3000').origin
  const queue = [...SEEDS]
  const seen = new Set<string>()
  const rows: Row[] = []
  const linkSources = new Map<string, string>()

  while (queue.length && rows.length < MAX_PAGES) {
    const path = queue.shift()!
    if (seen.has(path)) continue
    seen.add(path)

    const errors: string[] = []
    const onConsole = (message: { type: () => string, text: () => string }) => {
      if (message.type() === 'error') errors.push(message.text().slice(0, 140))
    }
    page.on('console', onConsole)

    process.stdout.write(`  [${rows.length + 1}] ${path}\n`)
    let status = 0
    const started = Date.now()
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await page.goto(origin + path, { waitUntil: 'domcontentloaded', timeout: 30000 })
        status = response?.status() ?? 0
        await page.waitForTimeout(300)
        break
      }
      catch (error) {
        // Быстрый обход изредка обрывает переход сам — пробуем второй раз
        if (attempt) errors.push(String(error).slice(0, 140))
      }
    }
    const spent = Date.now() - started
    if (spent > 1500) console.log(`  медленно: ${spent} мс — ${path}`)

    /**
     * Снятие данных со страницы иногда зависает наглухо: если у страницы
     * занят основной поток, page.evaluate не возвращается вовсе и весь обход
     * падает по таймауту через четверть часа. Ограничиваем ожидание и
     * записываем такую страницу в отчёт, вместо того чтобы валить прогон.
     */
    const EMPTY = { h1: '', headings: 0, interactive: 0, text: 0, empty: false, links: [] as string[] }
    const probe = page.evaluate(() => {
      const main = document.querySelector('main') ?? document.body
      const text = (main.textContent ?? '').replace(/\s+/g, ' ').trim()
      return {
        h1: document.querySelector('h1')?.textContent?.trim() ?? '',
        headings: document.querySelectorAll('h1,h2,h3').length,
        interactive: document.querySelectorAll('a[href],button,input,select,textarea').length,
        text: text.length,
        empty: !!document.querySelector('.state--empty, .empty-state, .empty'),
        links: [...document.querySelectorAll('a[href]')]
          .map(a => (a as HTMLAnchorElement).getAttribute('href') ?? '')
          .filter(href => href.startsWith('/') && !href.startsWith('//')),
      }
    })

    let timer: ReturnType<typeof setTimeout> | undefined
    const info = await Promise.race([
      probe.catch(() => EMPTY),
      new Promise<typeof EMPTY>((resolve) => {
        timer = setTimeout(() => {
          errors.push('страница не ответила на опрос за 20 с — основной поток занят')
          resolve(EMPTY)
        }, 20000)
      }),
    ])
    // Таймер обязательно гасим: иначе он срабатывает уже после того, как
    // страница записана в отчёт, и дописывает ей несуществующую ошибку
    clearTimeout(timer)

    page.off('console', onConsole)
    rows.push({ url: path, status, h1: info.h1, headings: info.headings, interactive: info.interactive, text: info.text, empty: info.empty, errors })

    for (const href of info.links) {
      const clean = href.split('#')[0]!
      if (!seen.has(clean) && !queue.includes(clean)) {
        queue.push(clean)
        linkSources.set(clean, path)
      }
    }
  }

  const bad = rows.filter(r => r.status >= 400 || r.status === 0)
  const noHeading = rows.filter(r => r.status < 400 && !r.h1)
  const thin = rows.filter(r => r.status < 400 && r.text < 900)
  const withErrors = rows.filter(r => r.errors.length)

  const report = [
    `Страниц пройдено: ${rows.length} (в очереди осталось ${queue.length})`,
    '',
    `ОТВЕЧАЮТ ОШИБКОЙ: ${bad.length}`,
    ...bad.map(r => `  ${r.status} ${r.url}   ← ссылка со страницы ${linkSources.get(r.url) ?? 'seed'}`),
    '',
    `БЕЗ ЗАГОЛОВКА h1: ${noHeading.length}`,
    ...noHeading.map(r => `  ${r.url}`),
    '',
    `ПУСТЫЕ ИЛИ ПОЧТИ ПУСТЫЕ (меньше 900 знаков текста): ${thin.length}`,
    ...thin.map(r => `  ${r.url}  знаков=${r.text} заголовков=${r.headings} элементов=${r.interactive}${r.empty ? ' [заглушка]' : ''}`),
    '',
    `ОШИБКИ В КОНСОЛИ: ${withErrors.length}`,
    ...withErrors.flatMap(r => [`  ${r.url}`, ...r.errors.map(e => `      ${e}`)]),
    '',
    'ВСЕ СТРАНИЦЫ:',
    ...rows.map(r => `  ${String(r.status).padEnd(4)} ${r.url.padEnd(52)} h1=«${r.h1.slice(0, 32)}» знаков=${r.text}`),
  ].join('\n')

  console.log(report)
  expect(rows.length).toBeGreaterThan(10)
})
