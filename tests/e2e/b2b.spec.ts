import { expect, test, type Page } from '@playwright/test'

/**
 * Сценарии B2B-витрины: компания платит с баланса или корпоративной картой,
 * а баланс пополняет переводом по счёту. Плюс каталог и поиск после прохода
 * по этим страницам. Работает и на дев-сервере, и на собранном приложении.
 */

async function asUser(page: Page) {
  await page.context().addCookies([{
    name: 'paylov_auth',
    value: encodeURIComponent(JSON.stringify({ phone: '+998 90 123-45-67', name: 'Test User' })),
    domain: 'localhost',
    path: '/',
  }])
}

async function open(page: Page, url: string) {
  await page.goto(url)
  await page.waitForFunction(
    () => (window as unknown as { useNuxtApp?: () => { isHydrating?: boolean } }).useNuxtApp?.().isHydrating === false,
    undefined,
    { timeout: 30_000 },
  )
}

async function balance(page: Page) {
  const body = await (await page.request.get('/api/balance')).json()
  return body.payload as { available: { amount: number }, reserved: { amount: number } }
}

/** Номер с нужным началом, проходящий проверку Луна */
function luhnPan(prefix: string) {
  const body = prefix.padEnd(15, '0')
  const sum = [...body].reverse().reduce((total, char, index) => {
    const digit = Number(char) * (index % 2 === 0 ? 2 : 1)
    return total + (digit > 9 ? digit - 9 : digit)
  }, 0)
  return `${body}${(10 - sum % 10) % 10}`
}

const row = (page: Page, title: string) =>
  page.locator('.filter__row').filter({ has: page.locator('.filter__label', { hasText: new RegExp(`^${title}$`) }) }).first()

test.describe('B2B: оплата заказа', () => {
  test.beforeEach(async ({ page }) => {
    await asUser(page)
  })

  test('способов оплаты ровно два: баланс и корпоративная карта', async ({ page }) => {
    await open(page, '/checkout')
    const methods = page.locator('.payment__method')
    await expect(methods).toHaveCount(2)
    await expect(methods.first()).toContainText('Баланс компании')
    await expect(methods.first()).toHaveAttribute('aria-checked', 'true')
    await expect(methods.nth(1)).toContainText('Корпоративная карта')
    await expect(page.locator('.payment')).not.toContainText(/рассрочк|наличн/i)
  })

  test('оплата с баланса подтверждается без SMS и резервирует сумму', async ({ page }) => {
    await open(page, '/checkout')
    const before = await balance(page)

    await page.locator('.summary__pay').click()
    await expect(page.locator('.confirm')).toBeVisible()
    await page.locator('.confirm').getByRole('button').click()

    await expect(page.locator('.success__title')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.otp')).toHaveCount(0)

    const after = await balance(page)
    expect(after.reserved.amount).toBeGreaterThan(before.reserved.amount)
    expect(after.available.amount).toBeLessThan(before.available.amount)
    expect(before.available.amount - after.available.amount).toBe(after.reserved.amount - before.reserved.amount)
  })

  test('при нехватке денег видно сумму и ссылку на пополнение', async ({ page }) => {
    // Идентификатор посетителя появляется при первом заходе — без него товар ушёл бы в чужую корзину
    await open(page, '/checkout')

    // Часы за 199 млн сум не помещаются в стартовый баланс на 20 млн
    const found = await (await page.request.get('/api/search?q=rolex&sort=priceDesc&perPage=1')).json()
    const skuId = Number(found.payload.items[0].id) * 10 + 1
    await page.request.post('/api/cart/items', { data: { skuId, quantity: 1 } })
    await open(page, '/checkout')

    await expect(page.locator('.payment__short')).toBeVisible()
    const link = await page.locator('.payment__top-up').getAttribute('href')
    expect(link).toMatch(/\/account\/balance\?amount=\d+&from=checkout/)

    await page.locator('.summary__pay').click()
    await expect(page.locator('.confirm')).toHaveCount(0)
  })

  test('корпоративная карта идёт через код из SMS', async ({ page }) => {
    await open(page, '/checkout')
    await page.locator('.payment__method').nth(1).click()
    await expect(page.locator('.payment__saved').first()).toBeVisible()

    await page.locator('.summary__pay').click()
    await expect(page.locator('.otp')).toBeVisible({ timeout: 15_000 })
  })

  test('личная карта не принимается', async ({ page }) => {
    const response = await page.request.post('/api/user/cards', {
      data: { number: luhnPan('860006'), expires: '12/30' },
    })
    expect(response.status()).toBe(422)
    const body = await response.json()
    expect(body.errors[0].code).toBe('card_not_corporate')
  })
})

test.describe('B2B: баланс компании', () => {
  test('гостя в кабинет не пускает', async ({ page }) => {
    await page.goto('/account/balance')
    // Метку ?auth=1 шапка снимает, открыв диалог, поэтому проверяем сам диалог
    await expect(page.locator('.auth__input').first()).toBeVisible()
    await expect(page).not.toHaveURL(/\/account\/balance/)
  })

  test('счёт показывает реквизиты, а зачисление увеличивает баланс', async ({ page }) => {
    await asUser(page)
    await open(page, '/account/balance')
    const before = await balance(page)

    await page.locator('.balance__input').fill('1000000')
    await page.locator('.balance__form button[type="submit"]').click()

    const invoice = page.locator('.invoice')
    await expect(invoice).toBeVisible()
    await expect(page.locator('.invoice__demo')).toBeVisible()
    await expect(page.locator('.invoice__row')).toHaveCount(6)
    await expect(invoice).toContainText('Назначение платежа')

    await invoice.getByRole('button', { name: 'Имитировать поступление перевода' }).click()
    await expect.poll(async () => (await balance(page)).available.amount)
      .toBe(before.available.amount + 100_000_000)
  })

  test('ссылка с оформления подставляет сумму и ведёт обратно', async ({ page }) => {
    await asUser(page)
    await open(page, '/account/balance?amount=3965000&from=checkout')
    await expect(page.locator('.balance__input')).toHaveValue(/3.?965.?000/)
    await expect(page.locator('.balance__back, a[href$="/checkout"]').first()).toBeVisible()
  })

  test('реквизиты компании проверяются', async ({ page }) => {
    const response = await page.request.patch('/api/user/company', {
      data: { name: 'Test', inn: '123', bank: 'Test', mfo: '1', account: '2' },
    })
    expect(response.status()).toBe(422)
    const codes = (await response.json()).errors.map((error: { code: string }) => error.code)
    expect(codes).toEqual(expect.arrayContaining(['company_inn', 'company_mfo', 'company_account']))
  })
})

test.describe('Каталог и поиск', () => {
  test('«Все» и конкретное значение фильтра не выбираются вместе', async ({ page }) => {
    // По «часам» брендов несколько; по «rolex» один, и группа бренда скрыта
    await open(page, `/search?q=${encodeURIComponent('часы')}`)

    await row(page, 'Все').click()
    await expect(page).not.toHaveURL(/brand=/)

    await row(page, 'Rolex').click()
    await expect(page).toHaveURL(/brand=rolex$/)
    await expect(row(page, 'Rolex')).toHaveAttribute('aria-checked', 'true')
    await expect(row(page, 'Все')).toHaveAttribute('aria-checked', 'false')

    await row(page, 'Все').click()
    await expect(page).not.toHaveURL(/brand=/)
    await expect(row(page, 'Rolex')).toHaveAttribute('aria-checked', 'false')
  })

  test('меню сортировки не закрывается, пока мышь идёт к пункту', async ({ page }) => {
    await open(page, '/category/smartfony')
    const button = page.locator('.sortbar__button')
    const menu = page.locator('.sortbar__menu')

    await button.click()
    await expect(menu).toBeVisible()

    // Зазор между кнопкой и списком: раньше здесь срабатывал mouseleave
    const box = (await button.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height + 3)
    await expect(menu).toBeVisible()

    await menu.getByRole('button', { name: 'Сначала дешёвые' }).click()
    await expect(page).toHaveURL(/sort=priceAsc/)
    await expect(menu).toBeHidden()
  })

  test('меню сортировки закрывается по Esc и кликом мимо', async ({ page }) => {
    await open(page, '/category/smartfony')
    const button = page.locator('.sortbar__button')
    const menu = page.locator('.sortbar__menu')

    await button.click()
    await expect(menu).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()

    await button.click()
    await expect(menu).toBeVisible()
    await page.locator('.category__breadcrumbs').click()
    await expect(menu).toBeHidden()
  })

  test('текст запроса не притворяется категорией', async ({ page }) => {
    await open(page, '/search?q=rolex')
    await expect(page.locator('.sidebar__chip').first()).toHaveText('Все товары')
    await expect(page.locator('.sortbar__title')).toContainText('«rolex»')
  })

  test('подборка называется своим именем', async ({ page }) => {
    await open(page, '/search?kind=wow')
    await expect(page.locator('.sortbar__title')).toContainText('Wow выгода')
    await expect(page).toHaveTitle(/^Wow выгода/)
  })

  test('в пустой выдаче нет фильтров всего каталога', async ({ page }) => {
    await open(page, '/search?q=zzzqqq')
    await expect(page.locator('.state--empty')).toBeVisible()
    await expect(page.locator('.filter__title')).toHaveCount(0)
    await expect(page.locator('.sidebar__submit')).toHaveCount(0)
  })

  test('подсказка цены короткая и не обрезается', async ({ page }) => {
    await open(page, '/search')
    const inputs = page.locator('.filter__input input')
    await expect(inputs.nth(1)).toHaveAttribute('placeholder', /^До \d[\d,.]* (млн|млрд|тыс)/)
    const fits = await inputs.evaluateAll(list => list.every((input) => {
      const el = input as HTMLInputElement
      const ctx = document.createElement('canvas').getContext('2d')!
      const style = getComputedStyle(el)
      ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      return ctx.measureText(el.placeholder).width + 40 < el.clientWidth
    }))
    expect(fits).toBe(true)
  })

  test('кнопки размеров ровной сеткой, лишние свёрнуты, выбранная не прячется', async ({ page }) => {
    await open(page, '/search')
    const group = page.locator('.filter').filter({ has: page.locator('.filter__buttons') }).nth(1)
    const buttons = group.locator('.filter__button')
    await expect(buttons).toHaveCount(8)
    const widths = await buttons.evaluateAll(list => list.map(b => Math.round(b.getBoundingClientRect().width)))
    expect(new Set(widths).size).toBe(1)

    await group.locator('.filter__more').click()
    await expect(buttons).toHaveCount(21)
    await buttons.nth(10).click()
    await expect(page).toHaveURL(/[?&]size=/)
    await group.locator('.filter__more').click()
    await expect(buttons).toHaveCount(9)
    await expect(group.locator('.filter__button--active')).toHaveCount(1)
  })
})

test.describe('B2B: бренд', () => {
  for (const [path, text] of [['/', 'B2B-маркетплейс'], ['/uz', 'B2B marketpleys'], ['/en', 'B2B marketplace']] as const) {
    test(`подвал ${path} говорит про B2B`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('footer')).toContainText(text)
    })
  }

  test('картинка для шаринга: логотип, а не кошки', async ({ page }) => {
    await page.goto('/')
    const image = await page.locator('meta[property="og:image"]').first().getAttribute('content')
    expect(image).toMatch(/\/og-image\.png$/)
    const file = await page.request.get('/og-image.png')
    expect(file.status()).toBe(200)
  })
})

test.describe('Вход и регистрация', () => {
  test('вход сохраняется после перезагрузки', async ({ page }) => {
    await open(page, '/')
    await page.locator('.profile .action').click()
    await page.locator('.auth__input').first().fill('901234567')
    await page.locator('.auth__input').nth(1).fill('secret')
    await page.locator('.auth__submit').click()
    await expect(page.locator('.dialog')).toHaveCount(0)

    await open(page, '/')
    await page.locator('.profile .action').click()
    await expect(page.locator('.profile__menu')).toBeVisible()
  })

  test('регистрация просит номер, имя и пароль и ведёт к коду из SMS', async ({ page }) => {
    await open(page, '/')
    await page.locator('.profile .action').click()
    await page.locator('.auth__register').click()

    const inputs = page.locator('.register__input')
    await expect(inputs).toHaveCount(3)
    await inputs.nth(0).fill('901234567')
    await inputs.nth(1).fill('Test User')
    await inputs.nth(2).fill('secret12')
    await page.locator('.register__submit').click()

    await expect(page.locator('.sms__phone')).toContainText('90')
  })
})

test.describe('Выдача: данные', () => {
  test('подкатегория сужает выдачу, а не обнуляет её', async ({ request }) => {
    const all = await (await request.get('/api/search?categorySlug=elektronika')).json()
    const picked = await (await request.get('/api/search?categorySlug=elektronika&category=smartfony')).json()

    expect(picked.payload.total).toBeGreaterThan(0)
    expect(picked.payload.total).toBeLessThan(all.payload.total)
  })

  test('опечатка в запросе не обнуляет выдачу', async ({ request }) => {
    const search = async (q: string) =>
      (await (await request.get(`/api/search?q=${encodeURIComponent(q)}`)).json()).payload.total as number

    const exact = await search('часы')
    expect(exact).toBeGreaterThan(0)
    expect(await search('чассы')).toBe(exact)
    expect(await search('чсаы')).toBe(exact)
  })
})

test.describe('B2B: защита от повторной оплаты', () => {
  test('двойное нажатие подтверждения создаёт один заказ', async ({ page }) => {
    await asUser(page)
    await open(page, '/checkout')

    let posts = 0
    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') posts += 1
      await new Promise(resolve => setTimeout(resolve, 600))
      await route.continue()
    })

    await page.locator('.summary__pay').click()
    await page.locator('.confirm').getByRole('button').dblclick()

    await expect(page.locator('.success__title')).toBeVisible({ timeout: 15_000 })
    expect(posts).toBe(1)
  })
})

test.describe('Страница продавца', () => {
  /** Переход внутри сайта: запрос идёт из браузера, и его можно подменить */
  async function goInside(page: Page, path: string) {
    await page.evaluate((target) => {
      (window as unknown as { useNuxtApp: () => { $router: { push: (to: string) => void } } }).useNuxtApp().$router.push(target)
    }, path)
  }

  const SELLER = { id: 1, slug: 'technopoint', title: 'TechnoPoint', rating: 4.9, reviewsCount: 1840 }

  test('товары догружаются кнопкой, показанные остаются на месте', async ({ page }) => {
    await open(page, '/seller/technopoint')
    const cards = page.locator('.seller-page__grid .card')
    const more = page.locator('.seller-page__more')

    await expect(cards).toHaveCount(20)
    await expect(page.locator('.seller-card__total')).toHaveText('42 товара')
    const first = await cards.first().locator('.card__title').textContent()

    await more.click()
    await expect(cards).toHaveCount(40)
    await expect(cards.first().locator('.card__title')).toHaveText(first!)

    await more.click()
    await expect(cards).toHaveCount(42)
    await expect(more).toHaveCount(0)
  })

  test('у продавца с немногими товарами кнопки нет', async ({ page }) => {
    await open(page, '/seller/kids-world')
    await expect(page.locator('.seller-page__grid .card')).toHaveCount(6)
    await expect(page.locator('.seller-page__more')).toHaveCount(0)
  })

  test('на /uz счётчик и кнопка переведены', async ({ page }) => {
    await open(page, '/uz/seller/technopoint')
    await expect(page.locator('.seller-card__total')).toHaveText(/42 ta/)
    await expect(page.locator('.seller-page__more')).toHaveText("Yana ko'rsatish")
    await expect(page.locator('.seller-page__breadcrumbs')).toContainText('TechnoPoint')
  })

  test('рейтинг со звездой и одной цифрой после запятой', async ({ page }) => {
    await open(page, '/seller/technopoint')
    await expect(page.locator('.seller-card__rating svg')).toBeVisible()
    await expect(page.locator('.seller-card__value')).toHaveText('4.9')
  })

  test('без оценок нет нулевого рейтинга, число товаров остаётся', async ({ page }) => {
    await open(page, '/')
    await page.route('**/api/sellers/technopoint*', route => route.fulfill({
      json: { payload: { seller: { ...SELLER, rating: 0, reviewsCount: 0 }, products: [], total: 0 }, errors: null },
    }))
    await goInside(page, '/seller/technopoint')

    await expect(page.locator('.seller-card__name')).toHaveText('TechnoPoint')
    await expect(page.locator('.seller-card__value')).toHaveCount(0)
    await expect(page.locator('.seller-card__total')).toBeVisible()
  })

  test('продавец без товаров видит понятное пустое состояние', async ({ page }) => {
    await open(page, '/')
    await page.route('**/api/sellers/technopoint*', route => route.fulfill({
      json: { payload: { seller: SELLER, products: [], total: 0 }, errors: null },
    }))
    await goInside(page, '/seller/technopoint')

    await expect(page.locator('.state--empty .state__title')).toHaveText('У этого продавца пока нет товаров')
    await expect(page.locator('.seller-page__more')).toHaveCount(0)
  })

  test('пока продавец грузится, в крошках не пусто', async ({ page }) => {
    await open(page, '/')
    await page.route('**/api/sellers/technopoint*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1500))
      await route.continue()
    })
    await goInside(page, '/seller/technopoint')

    const crumbs = page.locator('.seller-page__breadcrumbs')
    await expect(crumbs).toContainText('Все товары продавца')
    await expect(crumbs).toContainText('TechnoPoint', { timeout: 15_000 })
  })

  test('сбой сервера не выдаётся за «продавец не найден», повтор работает', async ({ page }) => {
    await open(page, '/')
    let broken = true
    await page.route('**/api/sellers/technopoint*', async (route) => {
      if (broken) await route.fulfill({ status: 500, json: {} })
      else await route.continue()
    })
    await goInside(page, '/seller/technopoint')

    const retry = page.locator('.state__retry')
    await expect(retry).toBeVisible()
    await expect(page).toHaveURL(/\/seller\/technopoint/)
    await expect(page.locator('h1')).toHaveCount(0)

    broken = false
    await retry.click()
    await expect(page.locator('.seller-card__name')).toHaveText('TechnoPoint')
    await expect(page.locator('.seller-page__grid .card')).toHaveCount(20)
  })

  test('несуществующий продавец отдаёт 404', async ({ page }) => {
    expect((await page.goto('/seller/no-such-seller'))?.status()).toBe(404)
  })

  test('при переходе внутри сайта несуществующий продавец тоже не найден', async ({ page }) => {
    await open(page, '/')
    await goInside(page, '/seller/no-such-seller')
    await expect(page.locator('.seller-card')).toHaveCount(0)
    await expect(page.locator('.seller-page__grid')).toHaveCount(0)
    await expect(page.locator('body')).toContainText('Такой страницы нет')
  })
})

test.describe('Меню каталога и профиля', () => {
  const link = (page: Page, title: string) => page.locator('.catbar__link', { hasText: title })
  const panel = (page: Page) => page.locator('.catalog-menu__panel')

  test('наведение на раздел открывает его панель с товарами', async ({ page }) => {
    await open(page, '/')
    await link(page, 'Одежда').hover()

    await expect(panel(page)).toBeVisible()
    await expect(page.locator('.catalog-menu__heading')).toContainText('Одежда')
    await expect(page.locator('.catalog-menu__preview-title')).toContainText('Одежда')

    const products = page.locator('a.catalog-menu__product')
    await expect(products).toHaveCount(3)
    await expect(products.first()).toHaveAttribute('href', /\/product\//)
    await expect(products.first().locator('.catalog-menu__product-price')).toContainText('сум')
    await expect.poll(() => products.first().locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
  })

  test('подкатегория под курсором меняет превью', async ({ page }) => {
    await open(page, '/')
    await link(page, 'Электроника').hover()
    await expect(page.locator('.catalog-menu__preview-title')).toContainText('Электроника')

    await page.locator('.catalog-menu__child', { hasText: 'Планшеты' }).hover()
    await expect(page.locator('.catalog-menu__preview-title')).toContainText('Планшеты')
    await expect(page.locator('a.catalog-menu__product').first()).toContainText('Планшет')
  })

  test('панель не закрывается по пути к ней и закрывается при уходе', async ({ page }) => {
    await open(page, '/')
    await link(page, 'Обувь').hover()
    await expect(panel(page)).toBeVisible()

    await page.locator('.catalog-menu__heading').hover()
    await page.waitForTimeout(400)
    await expect(panel(page)).toBeVisible()

    await page.mouse.move(700, 900)
    await expect(panel(page)).toHaveCount(0)
  })

  test('быстрый проход мыши через строку разделов панель не открывает', async ({ page }) => {
    await open(page, '/')
    await link(page, 'Одежда').hover()
    await page.mouse.move(700, 900)
    await page.waitForTimeout(400)
    await expect(panel(page)).toHaveCount(0)
  })

  test('клик по «Каталог» закрепляет панель, Esc закрывает', async ({ page }) => {
    await open(page, '/')
    await page.locator('.catalog-button').click()
    await expect(panel(page)).toBeVisible()

    await page.mouse.move(700, 900)
    await page.waitForTimeout(400)
    await expect(panel(page)).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(panel(page)).toHaveCount(0)
  })

  test('товар из превью открывается и закрывает панель', async ({ page }) => {
    await open(page, '/')
    await link(page, 'Одежда').hover()
    await page.locator('a.catalog-menu__product').first().click()
    await expect(page).toHaveURL(/\/product\//)
    await expect(panel(page)).toHaveCount(0)
  })

  test('превью переведено на узбекский', async ({ page }) => {
    await open(page, '/uz')
    await page.locator('.catalog-button').click()
    await expect(page.locator('.catalog-menu__preview-title')).toContainText('Ommabop')
    await expect(page.locator('a.catalog-menu__product').first().locator('.catalog-menu__product-price')).toBeVisible()
  })

  test('наведение на профиль показывает баланс, клик не закрывает меню', async ({ page }) => {
    await asUser(page)
    await open(page, '/')
    const profile = page.locator('.profile .action')
    await profile.hover()

    const menu = page.locator('.profile__menu')
    await expect(menu).toBeVisible()
    await expect(page.locator('.profile__balance-sum')).toContainText('сум')
    await expect(page.locator('.profile__balance-top')).toHaveAttribute('href', /\/account\/balance$/)

    await profile.click()
    await page.mouse.move(400, 900)
    await page.waitForTimeout(400)
    await expect(menu).toBeVisible()
  })

  test('меню профиля закрывается, когда мышь ушла', async ({ page }) => {
    await asUser(page)
    await open(page, '/')
    await page.locator('.profile .action').hover()
    await expect(page.locator('.profile__menu')).toBeVisible()

    await page.mouse.move(400, 900)
    await expect(page.locator('.profile__menu')).toHaveCount(0)
  })

  test('гость наведением профиль не открывает, сумма в HTML не попадает', async ({ page, request }) => {
    await open(page, '/')
    await page.locator('.profile .action').hover()
    await page.waitForTimeout(300)
    await expect(page.locator('.profile__menu')).toHaveCount(0)

    const html = await (await request.get('/')).text()
    expect(html).not.toContain('class="profile__balance')
  })
})

test.describe('Главная: баннер и плитки', () => {
  test('карусель и плитки стоят в один ряд одной высоты', async ({ page }) => {
    await open(page, '/')
    const hero = (await page.locator('.hero__viewport').boundingBox())!
    const aside = (await page.locator('.home__hero .aside').boundingBox())!

    expect(Math.round(aside.y)).toBe(Math.round(hero.y))
    expect(Math.round(aside.height)).toBe(Math.round(hero.height))
    expect(aside.x).toBeGreaterThan(hero.x + hero.width)
  })

  test('текст слайдов не выходит за баннер', async ({ page }) => {
    await open(page, '/')
    const overflow = await page.locator('.hero__content').evaluateAll(nodes =>
      nodes.filter(node => node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1).length)
    expect(overflow).toBe(0)
  })

  test('карусель по-прежнему листается', async ({ page }) => {
    await open(page, '/')
    const dot = page.locator('.hero__dot').nth(1)
    await dot.click()
    await expect(dot).toHaveAttribute('aria-selected', 'true')
  })

  test('гость видит плитку для компании, кнопка открывает вход', async ({ page }) => {
    await open(page, '/')
    const tile = page.locator('.tile--funds')
    await expect(tile).toContainText('Покупки для компании')
    await expect(page.locator('.tile__sum')).toHaveCount(0)

    await tile.click()
    await expect(page.locator('.auth__input').first()).toBeVisible()
  })

  test('вошедший видит настоящий баланс и переходит к пополнению', async ({ page }) => {
    await asUser(page)
    await open(page, '/')
    await expect(page.locator('.tile__sum')).toContainText('сум')

    await page.locator('.tile--funds').click()
    await expect(page).toHaveURL(/\/account\/balance$/)
  })

  test('сумма баланса не попадает в HTML страницы', async ({ page }) => {
    await asUser(page)
    const response = await page.goto('/')
    const html = await response!.text()
    expect(html).not.toContain('class="tile__sum')
  })

  test('если баланс недоступен, плитка всё равно ведёт на страницу баланса', async ({ page }) => {
    await asUser(page)
    await page.route('**/api/balance', route => route.fulfill({ status: 500, json: {} }))
    await open(page, '/')

    const tile = page.locator('.tile--funds')
    await expect(tile).toContainText('Покупки для компании')
    await expect(tile).toHaveAttribute('href', /\/account\/balance$/)
  })

  test('плитка продавца ведёт в кабинет', async ({ page }) => {
    await open(page, '/')
    const tile = page.locator('.tile--sell')
    await expect(tile).toContainText('Продавайте на 1mart')
    await expect(tile).toHaveAttribute('target', '_blank')
    await expect(tile.locator('.tile__mark')).toBeVisible()
  })

  test('плитки переведены на узбекский', async ({ page }) => {
    await open(page, '/uz')
    await expect(page.locator('.tile--funds')).toContainText('Kompaniya uchun xaridlar')
  })
})

test.describe('Плитки и иконки: языки и бренд', () => {
  for (const path of ['/', '/uz', '/uz-cyrl', '/en', '/kaa']) {
    test(`текст плиток помещается на ${path}`, async ({ page }) => {
      await open(page, path)
      await expect(page.locator('.tile--funds .tile__action')).toBeVisible()
      // Знак 1mart выходит за край намеренно, поэтому меряем только текст
      const clipped = await page.locator('.tile').evaluateAll(nodes => nodes.filter((tile) => {
        const box = tile.getBoundingClientRect()
        const action = tile.querySelector('.tile__action')!.getBoundingClientRect()
        const above = [...tile.querySelectorAll('.tile__title, .tile__text, .tile__label, .tile__sum, .tile__company')]
        return action.bottom > box.bottom
          || above.some(node => node.getBoundingClientRect().bottom > action.top)
      }).length)
      expect(clipped).toBe(0)
    })
  }

  test('иконка сайта - знак 1mart, а не старый значок', async ({ request }) => {
    const svg = await (await request.get('/favicon.svg')).text()
    expect(svg).toContain('#2CDD41')
    expect(svg).not.toContain('#1B9684')

    const manifest = await (await request.get('/site.webmanifest')).json()
    expect(manifest.theme_color).toBe('#2CDD41')
  })
})

test.describe('Футер', () => {
  test('логотип на всю ширину и обрезан краем', async ({ page }) => {
    await open(page, '/')
    const frame = page.locator('.footer__wordmark-frame')
    await frame.scrollIntoViewIfNeeded()
    const box = (await frame.boundingBox())!
    expect(Math.round(box.width)).toBe(1240)

    // Картинка ленивая: появляется, когда подвал дошёл до экрана
    const image = page.locator('.footer__wordmark-img')
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
    const height = await image.evaluate(img => img.getBoundingClientRect().height)
    expect(height + 16).toBeGreaterThan(box.height)

    // Подвал заканчивается вместе со страницей
    const gap = await page.evaluate(() =>
      document.documentElement.scrollHeight - document.querySelector('footer')!.getBoundingClientRect().bottom - window.scrollY)
    expect(Math.abs(gap)).toBeLessThanOrEqual(1)
  })

  test('карточки ведут к балансу и в кабинет продавца', async ({ page }) => {
    await open(page, '/')
    const cards = page.locator('.footer__card')
    await expect(cards).toHaveCount(2)
    await expect(cards.first()).toHaveAttribute('href', /\/account\/balance$/)
    await expect(cards.nth(1)).toHaveAttribute('target', '_blank')
  })

  for (const [path, buyers] of [['/', 'Покупателям'], ['/uz', 'Xaridorlar'], ['/en', 'buyers']] as const) {
    test(`карточки переведены на ${path}`, async ({ page }) => {
      await open(page, path)
      await expect(page.locator('.footer__card').first()).toContainText(new RegExp(buyers, 'i'))
    })
  }
})

test.describe('Единый текст', () => {
  /** Сверяем с самим токеном: размеры можно менять в tokens.css, не трогая тесты */
  async function expectRole(locator: ReturnType<Page['locator']>, role: string) {
    const [actual, expected] = await locator.first().evaluate((node, name) => {
      const read = (el: Element) => {
        const style = getComputedStyle(el)
        return [style.fontSize, style.fontWeight, style.lineHeight, style.fontFamily].join(' ')
      }
      const probe = document.createElement('span')
      probe.style.font = `var(--type-${name})`
      document.body.append(probe)
      const value = read(probe)
      probe.remove()
      return [read(node), value]
    }, role)
    expect(actual).toBe(expected)
  }

  test('поля и кнопки окна входа берут общие роли', async ({ page }) => {
    await open(page, '/')
    await page.locator('.profile .action').click()

    await expectRole(page.locator('.dialog__title'), 'dialog-title')
    await expectRole(page.locator('.auth__input'), 'input')
    await expectRole(page.locator('.auth__code'), 'input')
    await expectRole(page.locator('.auth__label'), 'label')
    await expectRole(page.locator('.auth__submit'), 'button')
    await expect(page.locator('.auth__submit')).toHaveCSS('color', 'rgb(255, 255, 255)')
  })

  test('поле промокода такое же, как поле входа, а кнопка белая на зелёном', async ({ page }) => {
    await asUser(page)
    await open(page, '/checkout')
    await page.locator('.summary__promo').click()

    await expectRole(page.locator('.promo__field input'), 'input')
    await expect(page.locator('.promo__field input')).toHaveCSS('text-align', 'left')
    await expectRole(page.locator('.promo__apply'), 'button')
    await expect(page.locator('.promo__apply')).toHaveCSS('color', 'rgb(255, 255, 255)')
  })

  test('заголовки страниц и блоков берут общие роли', async ({ page }) => {
    await asUser(page)
    await open(page, '/cart')
    await expectRole(page.locator('.cart__title'), 'page-title')
    await open(page, '/checkout')
    await expectRole(page.locator('.checkout__title'), 'page-title')
    await expectRole(page.locator('.delivery__title'), 'section-title')
    await expectRole(page.locator('.payment__title'), 'section-title')
    await expectRole(page.locator('.summary__pay'), 'button')
  })

  test('на зелёных кнопках нет тёмного текста', async ({ page }) => {
    await asUser(page)
    for (const url of ['/', '/category/smartfony', '/checkout', '/account/orders']) {
      await open(page, url)
      const dark = await page.locator('button, a').evaluateAll(nodes => nodes.filter((node) => {
        const style = getComputedStyle(node)
        return style.backgroundColor === 'rgb(44, 221, 65)' && style.color !== 'rgb(255, 255, 255)'
      }).map(node => node.className))
      expect(dark, url).toEqual([])
    }
  })
})

test.describe('Страницы помощи', () => {
  test('FAQ: поиск, темы и раскрытие ответа, без советов для обычных покупателей', async ({ page }) => {
    await open(page, '/info/faq')
    await expect(page.locator('h1')).toHaveText('Вопросы и ответы')
    await expect(page.locator('main')).not.toContainText('примерить')

    await page.locator('.faq__input').fill('рассрочк')
    await expect(page.locator('.faq__question')).toHaveCount(1)
    await page.locator('.faq__input').fill('zzzz')
    await expect(page.locator('.faq__empty')).toBeVisible()
    await page.locator('.faq__input').fill('')

    await page.locator('.faq__topic', { hasText: 'Возврат' }).click()
    const question = page.locator('.faq__question').first()
    await question.click()
    await expect(question).toHaveAttribute('aria-expanded', 'true')
  })

  test('доставка и возврат: свои страницы и ссылки на них', async ({ page }) => {
    await open(page, '/info/delivery#pickup')
    await expect(page.locator('#pickup')).toBeInViewport()
    await expect(page.locator('.deliv__step')).toHaveCount(4)

    await open(page, '/info/returns')
    await expect(page.locator('.ret__step')).toHaveCount(3)
    await expect(page.locator('.info-nav__link--active')).toHaveText('Возврат товара')
    await expect(page.locator('footer a[href$="/info/returns"]')).toHaveCount(1)
  })

  for (const path of ['/uz/info/faq', '/uz-cyrl/info/faq', '/en/info/faq', '/kaa/info/delivery']) {
    test(`${path}: переведено без сырых ключей`, async ({ page }) => {
      await open(page, path)
      expect(await page.locator('main').innerText()).not.toMatch(/\bui\.catalog\./)
    })
  }

  test('настройки покупателя без даты рождения и пола', async ({ page }) => {
    await asUser(page)
    await open(page, '/account/settings')
    await expect(page.locator('input[type=date]')).toHaveCount(0)
    await expect(page.locator('input[name=gender]')).toHaveCount(0)
  })
})

test.describe('Ответ продавца на отзыв', () => {
  test('виден покупателю на странице товара', async ({ page }) => {
    await open(page, '/product/chasy-rolex-submariner-chernyy-bezel-1098')
    await expect(page.locator('.reviews__reply').first()).toContainText('Ответ продавца')
  })
})

test.describe('Оформление: документы, комментарий, бесплатная доставка', () => {
  test.beforeEach(async ({ page }) => {
    await asUser(page)
  })

  for (const [kind, title] of [['specification', 'Спецификация'], ['invoice', 'Счёт на оплату']] as const) {
    test(`${title} скачивается в PDF`, async ({ page }) => {
      await open(page, '/checkout')
      const [file] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('.documents__item', { hasText: title }).click(),
      ])
      expect(file.suggestedFilename()).toBe(`1mart-${kind}.pdf`)
      const stream = await file.createReadStream()
      const chunks: Buffer[] = []
      for await (const chunk of stream) chunks.push(chunk as Buffer)
      const pdf = Buffer.concat(chunks)
      expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
      expect(pdf.length).toBeGreaterThan(5000)
    })
  }

  test('комментарий уходит в заказ и виден в кабинете', async ({ page }) => {
    await open(page, '/checkout')
    await page.locator('#order-comment').fill('Доставить после 14:00')
    await expect(page.locator('.comment__counter')).toContainText('21 / 500')

    await page.locator('.summary__pay').click()
    await page.locator('.confirm').getByRole('button').click()
    await expect(page.locator('.success__title')).toBeVisible({ timeout: 15_000 })

    await page.locator('.success a[href*="/account/orders/"]').first().click()
    // Комментарий лежит в блоке «Подробнее»
    await page.locator('.detail__action[aria-expanded]').click()
    await expect(page.locator('.detail__row-note', { hasText: 'Доставить после 14:00' })).toBeVisible()
  })

  test('бесплатная доставка показана, платная нет', async ({ page }) => {
    await open(page, '/checkout')
    await expect(page.locator('.delivery__free')).toHaveCount(0)

    // Самовывоз бесплатный: показывается и в карточке, и в итогах
    await page.locator('.delivery__tab').nth(1).click()
    await expect(page.locator('.delivery__free')).toContainText('Бесплатная доставка')
    await expect(page.locator('.summary__value', { hasText: 'Бесплатно' })).toBeVisible()
  })
})
