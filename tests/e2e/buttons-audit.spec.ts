import { expect, test } from '@playwright/test'
import { writeFileSync } from 'node:fs'

/**
 * Аудит кнопок: обходит страницы и НАЖИМАЕТ каждый интерактивный элемент,
 * сравнивая состояние до и после. Если после нажатия ничего не изменилось —
 * ни адрес, ни разметка, ни открытые окна, ни запросы к серверу — кнопка мёртвая.
 *
 * Статическая проверка (есть ли обработчик в разметке) для Vue не работает:
 * обработчики навешиваются на гидратации и в DOM не видны. Поэтому кликаем.
 *
 * Отчёт: BUTTONS-AUDIT.md.
 * Запуск: AUDIT=1 npx playwright test tests/e2e/buttons-audit.spec.ts
 */
test.skip(!process.env.AUDIT, 'Отчётный обход: включается переменной AUDIT=1')
test.setTimeout(60 * 60_000)

/*
 * Обход гоняйте по собранному приложению, а не по серверу разработки:
 *
 *   npm run build
 *   (cd apps/host && PORT=3100 node .output/server/index.mjs &)
 *   AUDIT=1 PW_BASE_URL=http://localhost:3100 npx playwright test tests/e2e/buttons-audit.spec.ts
 *
 * Сервер разработки пересобирает страницы на лету и на сотнях переходов
 * исчерпывает память — обход падал на полпути, а его результаты были мусором.
 */

/** Все категории каталога, а не пара выбранных */
const CATEGORIES = [
  'vse', 'selskoz-zhivotnye', 'loshadi', 'koshki', 'lekarstvo', 'popugai',
  'vyazka', 'domashnyaya-ptica', 'barany', 'sobaki', 'veterinarnye-uslugi',
  'korma', 'aksessuary',
]

/** Все текстовые страницы */
const INFO = [
  'about', 'blog', 'chat', 'complaint', 'contact', 'cookie', 'delivery',
  'documents', 'faq', 'help', 'partners', 'privacy', 'rules', 'services', 'terms',
]

const PAGES = [
  '/',
  ...CATEGORIES.map(slug => `/category/${slug}`),
  '/search?q=rolex',
  '/search?q=ооооопечатка',
  '/cart', '/checkout',
  '/seller/vodiy-qoy-bozori',
  '/account', '/account/orders', '/account/transactions', '/account/favorites',
  '/account/reviews', '/account/promo', '/account/settings', '/account/bonuses',
  '/account/seller', '/account/auctions', '/account/ads',
  ...INFO.map(slug => `/info/${slug}`),
  '/sellers/',
  '/такой-страницы-нет',
]

/**
 * Не нажимаем: необратимое или уводящее из аудита.
 * Эти элементы проверены сценарными тестами отдельно.
 */
const SKIP = [
  /выйти|logout/i,
  // Открывает системный выбор файла: на странице после этого ничего не меняется
  /загрузить фото/i,
  /оплатит|оформить заказ|внести/i,
  /удалить|очистить/i,
  /отправить|оставить заявку/i,
]

interface Row {
  page: string
  selector: string
  label: string
  kind: string
  verdict: string
  detail: string
}

test('аудит кнопок: какие работают, какие мёртвые', async ({ page, context }) => {
  await context.addCookies([{
    name: 'paylov_auth',
    value: encodeURIComponent(JSON.stringify({ phone: '+998 90 123-45-67', name: 'Шохрух Бахтиёров' })),
    domain: 'localhost',
    path: '/',
  }])

  /*
   * Адреса товара, заказа и лендинга не вписываем руками: слаги меняются
   * вместе с данными, а обход должен покрывать то, что есть сейчас.
   */
  const products = await page.request.get('/api/search?perPage=4')
    .then(r => r.json())
    .then(d => (d.payload.items as { slug: string }[]).map(item => `/product/${item.slug}`))

  const pages = [...PAGES, ...products, '/account/orders/1']

  const rows: Row[] = []
  /*
   * Один и тот же диалог открывается с десятка страниц: выбор категории — на всех
   * категориях. Содержимое у них одинаковое, поэтому обходим каждое окно
   * один раз: без этого обход не укладывался и в сорок минут.
   */
  const seenDialogs = new Set<string>()
  let requests = 0
  page.on('request', () => { requests += 1 })

  /** Дёшево описываем состояние страницы: что изменилось после нажатия */
  const snapshot = () => page.evaluate(() => {
    const body = document.body
    let hash = 0
    const html = body.innerHTML
    for (let i = 0; i < html.length; i += 7) hash = (hash * 31 + html.charCodeAt(i)) | 0

    /*
     * Значения полей в разметку не попадают: кнопка «300 000 сум» подставляла
     * сумму в поле, а обход считал её мёртвой. Снимаем их отдельно.
     */
    const fields = [...document.querySelectorAll('input, textarea, select')]
      .map(field => (field as HTMLInputElement).value)
      .join('|')

    return {
      url: location.pathname + location.search,
      hash,
      fields,
      length: html.length,
      dialogs: document.querySelectorAll('[role="dialog"], .overlay').length,
      scroll: Math.round(window.scrollY),
    }
  })

  for (const url of pages) {
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(900)

    /*
     * Помечаем каждый элемент своим номером в порядке обхода DOM и потом
     * кликаем по этой метке. Обращаться по классу нельзя: у активной вкладки
     * классов два, и `button.tabs__item` попадает и в неё тоже — первая версия
     * обхода из-за этого нажимала не на тот элемент и объявляла живые кнопки
     * мёртвыми. Метки ставятся заново после каждой перезагрузки: порядок
     * обхода DOM у одной и той же страницы стабильный.
     */
    const tag = () => page.evaluate(() => {
      const all = [...document.querySelectorAll('button, a, [role="button"], input[type="submit"]')]
      all.forEach((el, index) => el.setAttribute('data-audit-id', String(index)))
      return all.length
    })

    await tag()

    const targets = await page.evaluate(() => {
      const out: { selector: string, id: string, label: string, kind: string, href: string | null }[] = []
      const seen = new Set<string>()

      const describe = (el: Element) => {
        const cls = (typeof el.className === 'string' && el.className.trim())
          ? '.' + el.className.trim().split(/\s+/).join('.')
          : ''
        return el.tagName.toLowerCase() + cls
      }

      for (const el of document.querySelectorAll('[data-audit-id]')) {
        const rect = el.getBoundingClientRect()
        const style = getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden') continue
        if (!rect.width || !rect.height) continue

        const selector = describe(el)
        const label = ((el.textContent ?? '').replace(/\s+/g, ' ').trim()
          || el.getAttribute('aria-label') || el.getAttribute('title') || '—').slice(0, 45)
        const key = selector + '|' + label
        if (seen.has(key)) continue
        seen.add(key)

        out.push({
          selector,
          id: el.getAttribute('data-audit-id')!,
          label,
          kind: el.tagName === 'A' ? 'ссылка' : 'кнопка',
          href: el.getAttribute('href'),
        })
      }

      return out
    })

    for (const target of targets) {
      const skipped = SKIP.some(rule => rule.test(target.label))

      // Ссылка с настоящим адресом проверяется самим адресом, нажимать не нужно
      if (target.kind === 'ссылка') {
        const href = target.href
        let verdict = 'работает'
        let detail = href ?? ''
        if (href === null) { verdict = 'МЁРТВАЯ'; detail = 'нет href' }
        else if (href === '' || href === '#') { verdict = 'МЁРТВАЯ'; detail = 'href = «' + href + '»' }
        rows.push({ page: url, ...target, verdict, detail })
        continue
      }

      if (skipped) {
        rows.push({ page: url, ...target, verdict: 'не нажимали', detail: 'необратимое действие, проверено сценарным тестом' })
        continue
      }

      const before = await snapshot()
      const requestsBefore = requests

      const locator = page.locator(`[data-audit-id="${target.id}"]`)
      try {
        await locator.click({ timeout: 6000, trial: false })
      }
      catch (error) {
        rows.push({ page: url, ...target, verdict: 'не нажалась', detail: String(error).split('\n')[0]!.slice(0, 80) })
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        await page.waitForTimeout(600)
        await tag()
        continue
      }

      /*
       * Ждём отклик, а не фиксированные полсекунды: «Добавить в корзину»
       * отправляет запрос и перерисовывается после ответа — на 450 мс
       * обход успевал снять состояние до перерисовки и звал кнопку мёртвой.
       */
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(250)
      const after = await snapshot()

      const changed = before.url !== after.url
        || before.hash !== after.hash
        || before.fields !== after.fields
        || before.dialogs !== after.dialogs
        || Math.abs(before.scroll - after.scroll) > 4
        || requests > requestsBefore

      /*
       * Нажатие на уже активную вкладку, выбранный вариант или текущую точку
       * галереи и не должно ничего менять — это не поломка.
       */
      const alreadyActive = /--active|--selected|--current/.test(target.selector)

      rows.push({
        page: url,
        ...target,
        verdict: changed ? 'работает' : (alreadyActive ? 'уже активна' : 'МЁРТВАЯ'),
        detail: changed
          ? [before.url !== after.url ? 'переход' : '', before.dialogs !== after.dialogs ? 'окно' : '',
              requests > requestsBefore ? 'запрос' : '', before.hash !== after.hash ? 'разметка' : '',
              Math.abs(before.scroll - after.scroll) > 4 ? 'прокрутка' : ''].filter(Boolean).join(', ')
          : 'после нажатия не изменилось ничего',
      })

      /*
       * Кнопка открыла диалог — значит внутри есть ещё кнопки, и они нигде
       * больше не встретятся: в разметке страницы диалога нет, пока он закрыт.
       * Обходим его содержимое здесь же.
       */
      if (after.dialogs > before.dialogs) {
        const signature = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"], .overlay')
          if (!dialog) return ''
          const title = (dialog.querySelector('h1, h2, h3')?.textContent ?? '').replace(/\s+/g, ' ').trim()
          return `${title}|${dialog.querySelectorAll('button, a').length}`
        })

        if (seenDialogs.has(signature)) {
          await page.keyboard.press('Escape').catch(() => {})
          await page.waitForTimeout(150)
          continue
        }
        seenDialogs.add(signature)

        /*
         * Метки внутри диалога ставятся заново каждый раз, когда он открыт:
         * после перезагрузки страницы прежние атрибуты исчезают вместе со
         * старым DOM. Без повторной разметки все кнопки диалога, кроме первой,
         * «не нажимались» — и это была ошибка обхода, а не приложения.
         */
        const tagModal = () => page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"], .overlay')
          if (!dialog) return []

          const out: { selector: string, id: string, label: string, kind: string }[] = []
          const seen = new Set<string>()
          const all = [...dialog.querySelectorAll('button, a, [role="button"], input[type="submit"]')]

          all.forEach((el, index) => {
            el.setAttribute('data-audit-modal-id', String(index))
            const rect = el.getBoundingClientRect()
            if (!rect.width || !rect.height) return

            const cls = (typeof el.className === 'string' && el.className.trim())
              ? '.' + el.className.trim().split(/\s+/).join('.')
              : ''
            const selector = el.tagName.toLowerCase() + cls
            const label = ((el.textContent ?? '').replace(/\s+/g, ' ').trim()
              || el.getAttribute('aria-label') || '—').slice(0, 45)
            const key = selector + '|' + label
            if (seen.has(key)) return
            seen.add(key)

            out.push({ selector, id: String(index), label, kind: el.tagName === 'A' ? 'ссылка' : 'кнопка' })
          })

          return out
        })

        const inner = await tagModal()

        // Диалоги с длинными списками (категории, адреса) обходим выборочно:
        // строки в них однотипные, а обход должен укладываться в разумное время
        for (const item of inner.slice(0, 14)) {
          if (SKIP.some(rule => rule.test(item.label))) {
            rows.push({
              page: `${url} → диалог «${target.label}»`,
              selector: item.selector,
              label: item.label,
              kind: item.kind,
              verdict: 'не нажимали',
              detail: 'необратимое действие, проверено сценарным тестом',
            })
            continue
          }

          const dialogBefore = await snapshot()
          const requestsAt = requests
          let verdict: string
          let detail: string

          // Нажатие на уже выбранную строку и не должно ничего менять
          const alreadyChosen = /--active|--selected|--current/.test(item.selector)

          try {
            /*
             * Времени даём с запасом: в окне адреса кнопки стоят поверх карты,
             * она догружает тайлы и двигается — на коротком ожидании нажатие
             * не проходило, и живые кнопки попадали в «не нажались».
             */
            await page.locator(`[data-audit-modal-id="${item.id}"]`).click({ timeout: 6000 })
            await page.waitForLoadState('networkidle', { timeout: 2500 }).catch(() => {})
            await page.waitForTimeout(250)
            const dialogAfter = await snapshot()
            const moved = dialogBefore.url !== dialogAfter.url
              || dialogBefore.hash !== dialogAfter.hash
              || dialogBefore.fields !== dialogAfter.fields
              || dialogBefore.dialogs !== dialogAfter.dialogs
              || requests > requestsAt

            if (moved) { verdict = 'работает'; detail = 'внутри диалога' }
            else if (alreadyChosen) { verdict = 'уже активна'; detail = 'внутри диалога: уже выбрана' }
            else { verdict = 'МЁРТВАЯ'; detail = 'внутри диалога: нажатие ничего не изменило' }
          }
          catch (error) {
            verdict = 'не нажалась'
            detail = String(error).split('\n')[0]!.slice(0, 80)
          }

          rows.push({
            page: `${url} → диалог «${target.label}»`,
            selector: item.selector,
            label: item.label,
            kind: item.kind,
            verdict,
            detail,
          })

          /*
           * Возвращаем диалог в исходное состояние. Раньше здесь была полная
           * перезагрузка страницы на каждую кнопку — обход не укладывался
           * и в час. Esc закрывает окно за миллисекунды, и открыть его заново
           * достаточно одним нажатием на ту же кнопку.
           */
          await page.keyboard.press('Escape').catch(() => {})
          await page.waitForTimeout(150)

          const open = await page.evaluate(() => document.querySelectorAll('[role="dialog"], .overlay').length)
          if (!open) {
            try {
              await page.locator(`[data-audit-id="${target.id}"]`).click({ timeout: 2000 })
              await page.waitForTimeout(350)
            }
            catch {
              // Кнопка исчезла вместе с состоянием страницы — дальше смысла нет
              await page.goto(url, { waitUntil: 'domcontentloaded' })
              await page.waitForTimeout(500)
              await tag()
              break
            }
          }

          await tagModal()
        }
      }

      // Возвращаем страницу в исходное состояние
      if (after.url !== before.url || after.dialogs !== before.dialogs || after.hash !== before.hash) {
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        await page.waitForTimeout(600)
        await tag()
      }
    }
  }

  const dead = rows.filter(r => r.verdict === 'МЁРТВАЯ')
  const active = rows.filter(r => r.verdict === 'уже активна')
  const stuck = rows.filter(r => r.verdict === 'не нажалась')
  const skipped = rows.filter(r => r.verdict === 'не нажимали')

  const md: string[] = []
  md.push('# Аудит кнопок и ссылок', '')
  md.push(`Обойдено страниц: ${pages.length}. Проверено элементов: ${rows.length}.`, '')
  md.push(`- работают: **${rows.length - dead.length - stuck.length - skipped.length - active.length}**`)
  md.push(`- мёртвые: **${dead.length}**`)
  md.push(`- не нажались: **${stuck.length}**`)
  md.push(`- не нажимали намеренно: ${skipped.length}`)
  md.push(`- уже активные (нажатие и не должно ничего менять): ${active.length}`, '')
  md.push('Кнопка считается живой, если после нажатия изменился адрес, разметка,')
  md.push('число открытых окон, прокрутка — или ушёл запрос к серверу.', '')

  const table = (title: string, list: Row[]) => {
    if (!list.length) return
    md.push(`## ${title} — ${list.length}`, '')
    md.push('| Страница | Элемент | Подпись | Что не так |')
    md.push('|---|---|---|---|')
    for (const r of list) {
      md.push(`| \`${r.page}\` | \`${r.selector}\` | ${r.label.replace(/\|/g, '\\|')} | ${r.detail} |`)
    }
    md.push('')
  }

  table('Мёртвые', dead)
  table('Не нажались', stuck)
  table('Не нажимали намеренно', skipped)

  writeFileSync('BUTTONS-AUDIT.md', md.join('\n') + '\n')
  console.log(md.slice(0, 60).join('\n'))
  console.log(`\nОтчёт целиком — BUTTONS-AUDIT.md (${rows.length} элементов, мёртвых ${dead.length})`)

  expect(rows.length).toBeGreaterThan(0)
})
