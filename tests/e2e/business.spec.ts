import { expect, test, type Page } from '@playwright/test'

/**
 * Кабинет продавца (apps/business). Это отдельное приложение, поэтому набор
 * запускается только с адресом: BUSINESS_URL=http://localhost:3000 npx playwright test business
 * Мок хранит данные в памяти сервера, тесты выбирают записи через API.
 */
const BASE = process.env.BUSINESS_URL
test.skip(!BASE, 'нужен BUSINESS_URL с запущенным кабинетом')

const url = (path: string) => `${BASE}${path}`

async function open(page: Page, path: string) {
  const response = await page.goto(url(path), { waitUntil: 'domcontentloaded', timeout: 120_000 })
  await page.waitForFunction(
    () => (window as unknown as { useNuxtApp?: () => { isHydrating?: boolean } }).useNuxtApp?.().isHydrating === false,
    undefined,
    { timeout: 60_000 },
  )
  return response
}

async function login(page: Page) {
  await open(page, '/login')
  await page.locator('input[type=tel]').fill('901234567')
  await page.locator('input[type=password]').fill('secret')
  await page.locator('button[type=submit]').click()
  await page.waitForURL(/dashboard/, { timeout: 60_000 })
}

/** Внутренний переход: запрос идёт из браузера и его можно подменить */
async function goInside(page: Page, path: string) {
  await page.evaluate((target) => {
    (window as unknown as { useNuxtApp: () => { $router: { push: (to: string) => void } } }).useNuxtApp().$router.push(target)
  }, path)
}

test.setTimeout(120_000)

test.describe('Вход', () => {
  test('ошибки на языке страницы, демо-подсказки нет в сборке', async ({ page }) => {
    await open(page, '/uz/login')
    await page.locator('input[type=tel]').fill('12')
    await page.locator('input[type=password]').fill('1')
    await page.locator('button[type=submit]').click()
    await expect(page.locator('form')).toContainText("To'g'ri telefon raqamini kiriting")
    await expect(page.locator('form')).not.toContainText('Введите')
  })

  test('внешняя ссылка next не оставляет на форме входа', async ({ page }) => {
    await open(page, '/login?next=https://evil.example/phish')
    await page.locator('input[type=tel]').fill('901234567')
    await page.locator('input[type=password]').fill('secret')
    await page.locator('button[type=submit]').click()
    await page.waitForURL(/\/dashboard/, { timeout: 60_000 })
  })

  test('истёкший сеанс ведёт на вход и обратно', async ({ page }) => {
    await login(page)
    await page.route('**/api/merchant/orders**', route => route.fulfill({ status: 401, json: {} }))
    await goInside(page, '/orders')
    await page.waitForURL(/\/login\?.*expired=1/, { timeout: 30_000 })
    await expect(page.locator('.login__expired')).toBeVisible()
    expect(page.url()).toContain('next=')
  })
})

test.describe('Состояния экранов', () => {
  test.beforeEach(async ({ page }) => { await login(page) })

  test('сбой сервера не выглядит как пустой список', async ({ page }) => {
    let broken = true
    await page.route('**/api/merchant/orders**', async (route) => {
      if (broken) await route.fulfill({ status: 500, json: {} })
      else await route.continue()
    })
    await goInside(page, '/orders')
    await expect(page.locator('.merror')).toBeVisible()
    await expect(page.locator('main')).not.toContainText('Заказов пока нет')

    broken = false
    await page.locator('.merror button').click()
    await expect(page.locator('tbody tr').first()).toBeVisible()
  })

  for (const path of ['/orders/nope', '/support/nope', '/products/nope']) {
    test(`${path}: понятный экран вместо пустоты`, async ({ page }) => {
      await open(page, path)
      await expect(page.locator('.mnotfound')).toBeVisible()
    })
  }

  test('несуществующий адрес показывает страницу ошибки кабинета', async ({ page }) => {
    await open(page, '/no-such-page')
    await expect(page.locator('.berror__title')).toHaveText('Страница не найдена')
  })
})

test.describe('Списки', () => {
  test.beforeEach(async ({ page }) => { await login(page) })

  test('поиск: один запрос и переживает перезагрузку', async ({ page }) => {
    await open(page, '/orders')
    let calls = 0
    page.on('request', (request) => { if (/api\/merchant\/orders\?/.test(request.url())) calls++ })
    await page.locator('main input').first().pressSequentially('OOO', { delay: 40 })
    await expect(page).toHaveURL(/q=OOO/)
    await page.waitForTimeout(500)
    expect(calls).toBeLessThanOrEqual(1)

    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('main input').first()).toHaveValue('OOO')
  })

  test('категории: только те, где можно продавать', async ({ page }) => {
    await open(page, '/categories')
    const rates = await page.locator('tbody tr td:last-child').allInnerTexts()
    expect(rates.length).toBeGreaterThan(0)
    expect(rates).not.toContain('0%')
  })
})

test.describe('Заказ', () => {
  test.beforeEach(async ({ page }) => { await login(page) })

  test('отмена требует подтверждения и причины', async ({ page }) => {
    const list = await (await page.request.get(url('/api/merchant/orders?status=new&perPage=1'))).json()
    await open(page, `/orders/${list.payload.items[0].id}`)

    await page.locator('.odet__actions button', { hasText: 'Отменить заказ' }).click()
    const dialog = page.locator('[role=dialog]')
    await expect(dialog).toContainText('Отменить заказ?')
    await expect(page.locator('.odet__status-bar')).toContainText('Ждёт подтверждения')

    await dialog.locator('select').selectOption('other')
    await dialog.getByRole('button', { name: 'Отменить заказ' }).click()
    await expect(dialog).toContainText('Опишите причину')

    await dialog.getByRole('button', { name: 'Отмена' }).click()
    await expect(page.locator('.odet__status-bar')).toContainText('Ждёт подтверждения')
  })

  test('отгруженный заказ продавец сам не завершает', async ({ page }) => {
    const list = await (await page.request.get(url('/api/merchant/orders?status=shipped&perPage=1'))).json()
    await open(page, `/orders/${list.payload.items[0].id}`)
    await expect(page.locator('.odet__actions')).toHaveCount(0)
    await expect(page.locator('.odet__note')).toBeVisible()
  })
})

test.describe('Товар', () => {
  test.beforeEach(async ({ page }) => { await login(page) })

  test('готовый товар сохраняется, самому опубликовать нельзя', async ({ page }) => {
    await open(page, '/products/p-1')
    const status = page.locator('.pform__status select')
    await expect(status).toBeVisible()
    const options = await status.locator('option').allInnerTexts()
    expect(options).toEqual(['Активен', 'В архиве'])

    await page.locator('.pform__actions button').first().click()
    await page.waitForURL(/\/products(\?|$)/, { timeout: 30_000 })
  })

  test('фото загружается файлом', async ({ page }) => {
    await open(page, '/products/new')
    await page.locator('input[type=file]').setInputFiles({
      name: 'a.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/AAwAD/wH+Q1m9hAAAAABJRU5ErkJggg==', 'base64'),
    })
    await expect(page.locator('.media__tile')).toHaveCount(1)
  })

  test('удаление через окно кабинета, можно передумать', async ({ page }) => {
    await open(page, '/products')
    const before = await page.locator('tbody tr').count()
    await page.locator('tbody tr').first().locator('button').last().click()
    const dialog = page.locator('[role=dialog]')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Отмена' }).click()
    await expect(page.locator('tbody tr')).toHaveCount(before)
  })
})

test.describe('Деньги и компания', () => {
  test.beforeEach(async ({ page }) => { await login(page) })

  test('вывод: счёт из реквизитов, сумма с пробелами и без копеек', async ({ page }) => {
    await open(page, '/finance/balance')
    await page.locator('main button', { hasText: 'Вывести' }).first().click()
    const dialog = page.locator('[role=dialog]')
    await expect(dialog).toContainText('Ipoteka Bank')

    await dialog.locator('input').first().fill('1000.5')
    await dialog.locator('button[type=submit]').click()
    await expect(dialog).toContainText('целую сумму')

    await dialog.locator('input').first().fill('1 000')
    await dialog.locator('button[type=submit]').click()
    await page.waitForURL(/finance\/payouts/, { timeout: 30_000 })
  })

  test('профиль: проверка полей и новое название в шапке', async ({ page }) => {
    await open(page, '/company')
    const name = page.locator('.company__form input').first()
    const original = await name.inputValue()
    const save = page.locator('main button', { hasText: 'Сохранить' }).first()

    await name.fill('')
    await save.click()
    await expect(page.locator('main')).toContainText('Укажите название магазина')

    await name.fill('Новое имя')
    await save.click()
    await expect(page.locator('.mtopbar__shop-name')).toHaveText('Новое имя')

    await name.fill(original)
    await save.click()
    await expect(page.locator('.mtopbar__shop-name')).toHaveText(original)
  })

  test('логотип магазина загружается, сохраняется и удаляется', async ({ page }) => {
    await open(page, '/company')
    await expect(page.locator('.cprofile__avatar--image')).toHaveCount(0)
    await page.locator('.cprofile__file').setInputFiles({
      name: 'logo.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/AAwAD/wH+Q1m9hAAAAABJRU5ErkJggg==', 'base64'),
    })
    await expect(page.locator('.cprofile__avatar--image')).toBeVisible()

    await page.locator('main button', { hasText: 'Сохранить' }).first().click()
    await expect(page.locator('[class*=toast]').first()).toContainText('Сохранено')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('.cprofile__avatar--image')).toBeVisible()

    await page.locator('.cprofile__remove').click()
    await expect(page.locator('.cprofile__avatar--image')).toHaveCount(0)
    await page.locator('main button', { hasText: 'Сохранить' }).first().click()
    await expect(page.locator('[class*=toast]').first()).toContainText('Сохранено')

    // Файл не картинкой отклоняется
    await page.locator('.cprofile__file').setInputFiles({ name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('x') })
    await expect(page.locator('.cprofile__avatar--image')).toHaveCount(0)
  })

  test('дашборд показывает, что требует внимания', async ({ page }) => {
    await open(page, '/dashboard')
    await expect(page.locator('.dash__attention')).toBeVisible()
    await page.locator('.dash__attention-item').first().click()
    await expect(page).toHaveURL(/orders\?status=new|products\?status=moderation/)
  })

  test('точка у колокольчика гаснет, когда всё прочитано', async ({ page }) => {
    await page.request.post(url('/api/merchant/notifications/read'), { data: {} })
    await open(page, '/dashboard')
    await page.waitForTimeout(1000)
    await expect(page.locator('.mtopbar__dot')).toHaveCount(0)
  })
})

test.describe('Отзывы', () => {
  test.beforeEach(async ({ page }) => { await login(page) })

  test('в меню есть раздел, на отзыв можно ответить и изменить ответ', async ({ page }) => {
    await open(page, '/dashboard')
    await page.locator('.msidebar a[href$="/reviews"]').click()
    await page.waitForURL(/\/reviews/)

    await page.locator('.mtabs__tab', { hasText: 'Ждут ответа' }).click()
    await expect(page).toHaveURL(/status=unanswered/)
    const item = page.locator('.rev__item').first()
    const product = await item.locator('.rev__product').innerText()

    await item.locator('.rev__answer').click()
    await item.locator('button[type=submit]').click()
    await expect(item).toContainText('Напишите ответ')

    await item.locator('textarea').fill('Спасибо, заменим товар.')
    await item.locator('button[type=submit]').click()
    await expect(page.locator('[class*=toast]').first()).toContainText('Ответ сохранён')

    await page.locator('.mtabs__tab', { hasText: 'С ответом' }).click()
    const answered = page.locator('.rev__item').filter({ hasText: 'Спасибо, заменим товар.' }).first()
    await expect(answered).toContainText(product)
    await answered.locator('.rev__link').click()
    await expect(page.locator('.rev__form textarea')).toHaveValue('Спасибо, заменим товар.')
  })

  test('фильтр по оценке и переживает перезагрузку', async ({ page }) => {
    await open(page, '/reviews')
    await page.locator('.rev__rating-select select').selectOption('1')
    await expect(page).toHaveURL(/rating=1/)
    await expect(page.locator('.rev__item').first().locator('.rev__stars')).toHaveAttribute('aria-label', 'Оценка 1 из 5')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(page.locator('.rev__rating-select select')).toHaveValue('1')
  })

  test('дашборд ведёт к отзывам без ответа', async ({ page }) => {
    await open(page, '/dashboard')
    await page.locator('.dash__attention-item', { hasText: 'Отзывы без ответа' }).click()
    await expect(page).toHaveURL(/reviews\?status=unanswered/)
  })
})

test.describe('Бренд раздела продавца', () => {
  // Решение заказчика: у раздела продавца иконка вкладки чёрная, у витрины — зелёная
  test('иконка вкладки чёрная, зелёный интерфейса — #0B8F2A', async ({ page, request }) => {
    const svg = await (await request.get('/favicon.svg')).text()
    expect(svg).toContain('#111111')
    expect(svg).not.toContain('#0AE728')

    await open(page, '/login')
    const brand = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--m-brand').trim())
    expect(brand.toUpperCase()).toBe('#0B8F2A')
  })
})
