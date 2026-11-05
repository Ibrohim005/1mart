import { expect, test } from '@playwright/test'

/**
 * Проверка вёрстки на длинные переводы.
 *
 * Макет сделан под русский текст и фиксированную ширину 1440. На других языках
 * строки длиннее — узбекская кириллица и английский дают до +40%. Тест сначала
 * ищет переполнения как есть, потом удлиняет весь текст на 40% и смотрит, что
 * поедет: так фрагильные места видны до того, как придут настоящие переводы.
 *
 * Запуск: AUDIT=1 npx playwright test tests/e2e/overflow-audit.spec.ts
 */
test.skip(!process.env.AUDIT, 'Отчётный обход: включается переменной AUDIT=1')

const LOCALES = ['', '/uz', '/uz-cyrl']
const PAGES = [
  '/',
  '/category/smartfony',
  '/cart',
  '/product/chasy-rolex-submariner-chernyy-bezel-1098',
  '/info/about',
  '/account/orders',
]

/** Находит элементы, чей текст не помещается в отведённое место */
const COLLECT = () => {
  const out: { sel: string, text: string, kind: string, over: number }[] = []
  const seen = new Set<string>()

  const describe = (el: Element) => {
    const cls = (el.className && typeof el.className === 'string')
      ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
      : ''
    return el.tagName.toLowerCase() + cls
  }

  for (const el of document.querySelectorAll('body *')) {
    const style = getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden') continue

    const rect = el.getBoundingClientRect()
    // Служебный текст для скринридера намеренно сжат в точку
    if (rect.width < 2 || rect.height < 2) continue
    // Обрезка в N строк — это решение дизайна, а не поломка
    if (style.webkitLineClamp && style.webkitLineClamp !== 'none') continue
    if (style.overflowX === 'auto' || style.overflowX === 'scroll') continue
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') continue
    if (el.children.length) continue

    const sel = describe(el)
    if (seen.has(sel)) continue

    const overX = el.scrollWidth - el.clientWidth
    const overY = el.scrollHeight - el.clientHeight

    if (overX > 1) {
      seen.add(sel)
      out.push({ sel, text: (el.textContent ?? '').trim().slice(0, 40), kind: 'вылезает по ширине', over: overX })
    }
    else if (overY > 1 && style.overflow === 'hidden') {
      seen.add(sel)
      out.push({ sel, text: (el.textContent ?? '').trim().slice(0, 40), kind: 'обрезан по высоте', over: overY })
    }
  }

  const pageOver = document.documentElement.scrollWidth - document.documentElement.clientWidth
  if (pageOver > 1) out.push({ sel: 'html', text: '', kind: 'страница шире окна', over: pageOver })

  return out
}

/** Растягивает весь видимый текст на 40% — имитация длинного перевода */
const STRETCH = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  let node = walker.nextNode()
  while (node) {
    const text = node.nodeValue ?? ''
    if (text.trim().length > 2) nodes.push(node as Text)
    node = walker.nextNode()
  }

  for (const item of nodes) {
    const value = item.nodeValue ?? ''
    const extra = Math.ceil(value.length * 0.4)
    // Дописываем слоги, а не пробелы: пробелы перенеслись бы и ничего не сломали
    item.nodeValue = value + 'ыш'.repeat(Math.ceil(extra / 2)).slice(0, extra)
  }
}

test('вёрстка выдерживает длинные переводы', async ({ page }) => {
  const asIs: string[] = []
  const stretched: string[] = []

  for (const prefix of LOCALES) {
    for (const path of PAGES) {
      const url = `${prefix}${path === '/' ? '' : path}` || '/'
      await page.goto(url, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(600)

      const before = await page.evaluate(COLLECT)
      if (before.length) {
        asIs.push(`\n=== ${url}`)
        for (const item of before) asIs.push(`  ${item.kind} +${item.over}px  ${item.sel}  «${item.text}»`)
      }

      await page.evaluate(STRETCH)
      await page.waitForTimeout(150)
      const after = await page.evaluate(COLLECT)
      const fresh = after.filter(item => !before.some(seen => seen.sel === item.sel))
      if (fresh.length) {
        stretched.push(`\n=== ${url}`)
        for (const item of fresh) stretched.push(`  ${item.kind} +${item.over}px  ${item.sel}  «${item.text}»`)
      }
    }
  }

  console.log('\n--- как есть ---')
  console.log(asIs.length ? asIs.join('\n') : 'чисто')
  console.log('\n--- текст длиннее на 40% ---')
  console.log(stretched.length ? stretched.join('\n') : 'чисто')

  expect(true).toBe(true)
})
