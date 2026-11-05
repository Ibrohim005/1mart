import { expect, test, type Page } from '@playwright/test'
import { appendFileSync, writeFileSync } from 'node:fs'

/**
 * Аудит интерактива: по одному представителю каждого класса на странице.
 * Мёртвый класс мёртв везде, поэтому полный перебор одинаковых карточек
 * не нужен — он только растягивает прогон.
 */
const PAGES = [
  '/', '/category/smartfony', '/search?q=rolex', '/cart', '/checkout',
  '/product/chasy-rolex-submariner-chernyy-bezel-1098',
  '/account/orders', '/account/orders/1', '/account/favorites', '/account/reviews',
  '/account/promo', '/account/settings', '/account/bonuses', '/account/seller',
  '/account/auctions', '/account/ads', '/info/about',
]

const REPORT = 'tests/audit-report.txt'

/*
 * Аудит долгий (перезагрузка страницы на каждый класс) и нагружает dev-сервер,
 * поэтому в обычный прогон не входит. Запуск: AUDIT=1 npx playwright test audit
 */
test.skip(!process.env.AUDIT, 'аудит запускается отдельно: AUDIT=1')

async function ready(page: Page, url: string) {
  await page.goto(url)
  await page.waitForFunction(() => !!(document.querySelector('#__nuxt') as Element & { __vue_app__?: unknown })?.__vue_app__, undefined, { timeout: 30_000 })
  await page.waitForFunction(() => (window as unknown as { useNuxtApp?: () => { isHydrating?: boolean } }).useNuxtApp?.().isHydrating === false, undefined, { timeout: 30_000 })
}

test.beforeAll(() => writeFileSync(REPORT, 'Элементы без реакции на клик\n\n', 'utf8'))

for (const path of PAGES) {
  test(`аудит ${path}`, async ({ page }) => {
    test.setTimeout(180_000)
    await ready(page, path)

    // По одному селектору на каждый класс
    const selectors: string[] = await page.evaluate(() => {
      const seen = new Set<string>()
      const out: string[] = []
      for (const node of document.querySelectorAll('button, a[href]')) {
        if (!(node as HTMLElement).offsetParent) continue
        if ((node as HTMLButtonElement).disabled) continue
        const cls = (node.getAttribute('class') ?? '').trim().split(/\s+/)[0]
        if (!cls || seen.has(cls)) continue
        seen.add(cls)
        out.push(cls)
      }
      return out
    })

    const dead: string[] = []

    for (const cls of selectors) {
      await ready(page, path)
      // CSS.escape доступен только в браузере, в тестовом процессе его нет
      const target = page.locator(`[class~="${cls}"]`).first()
      if (await target.count() === 0) continue

      let requests = 0
      const onReq = () => { requests += 1 }
      page.on('request', onReq)

      const before = await page.evaluate(() => ({ url: location.href, dom: document.body.innerHTML.length }))
      await target.click({ timeout: 3000, noWaitAfter: true }).catch(() => {})
      await page.waitForTimeout(400)
      const after = await page.evaluate(() => ({ url: location.href, dom: document.body.innerHTML.length })).catch(() => before)
      page.off('request', onReq)

      const changed = before.url !== after.url || Math.abs(before.dom - after.dom) > 30 || requests > 0
      if (!changed) dead.push(`${path.padEnd(58)} .${cls}`)
    }

    if (dead.length) appendFileSync(REPORT, `${dead.join('\n')}\n`, 'utf8')

    // Страница считается чистой, если все её классы дали реакцию
    expect(dead, `без реакции на ${path}:\n${dead.join('\n')}`).toEqual([])
  })
}
