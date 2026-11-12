/**
 * Демо-данные кабинета продавца. Генерируются один раз при загрузке модуля
 * и живут в памяти работающего сервера (как `orders-state` у витрины), чтобы
 * список и карточка одного заказа были согласованы между запросами.
 *
 * Детерминированный ГПСЧ (mulberry32) с фиксированным зерном: при каждом
 * запуске набор одинаков — удобно для вёрстки, скриншотов и тестов.
 *
 * Все суммы — тийины (через хелперы из `./money`). Бэкенд заменит этот модуль
 * настоящими выборками; формат ответов уже совпадает.
 */
import type {
  ReviewRow,
  BalanceState,
  CategoryAttributeSchema,
  CommissionRow,
  CompanyProfile,
  DocumentRow,
  Employee,
  MerchantCategory,
  NotificationItem,
  OrderDetail,
  OrderItemRow,
  OrderListItem,
  OrderStatusCode,
  PaymentMethodCode,
  PayoutRow,
  ProductDetail,
  ProductListItem,
  ProductStatus,
  TicketDetail,
  TransactionRow,
} from '#shared/types/merchant'
import type { Money } from '#shared/types/catalog'
import { minus, percentOf, sum, tiyin } from './money'

/* ------------------------------------------------------------------ ГПСЧ */

function mulberry32(seed: number) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(20260918)
const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)]!
const int = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min

/** ISO-дата N дней назад от текущего момента. */
function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

/* ------------------------------------------------------------ Компания */

export const company: CompanyProfile = {
  id: 'co-1',
  shopName: 'TechnoPro',
  legalName: 'OOO «TechnoPro Distribution»',
  legalForm: 'llc',
  status: 'active',
  requisites: {
    inn: '305128847',
    oked: '46520',
    vatCode: '305128847',
    bankAccount: '2020 8000 1234 5678 9012',
    mfo: '00974',
    bankName: 'Ipoteka Bank, Toshkent filiali',
  },
  director: 'Azizov Sardor Baxtiyorovich',
  phone: '+998 90 123 45 67',
  email: 'office@technopro.uz',
  legalAddress: "Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko'chasi, 12",
  logo: null,
  joinedAt: daysAgo(214),
  commissionRate: 8,
}

/* ------------------------------------------------------------ Категории */

// Дерево категорий: корень → раздел → листовая категория. Товары живут только
// в листьях (cat-1…6); у листа — своя ставка комиссии и схема характеристик
// (см. CATEGORY_SCHEMAS ниже). Профессиональное добавление товара ведёт
// продавца по этому дереву, как в Uzum/WB/Ozon.
export const categories: MerchantCategory[] = [
  { id: 'elec', name: 'Электроника', parentId: null, productCount: 0, commissionRate: 0 },
  { id: 'elec-comp', name: 'Компьютеры и сеть', parentId: 'elec', productCount: 0, commissionRate: 0 },
  { id: 'elec-gadg', name: 'Гаджеты и периферия', parentId: 'elec', productCount: 0, commissionRate: 0 },

  { id: 'cat-1', name: 'Ноутбуки и компьютеры', parentId: 'elec-comp', productCount: 0, commissionRate: 6 },
  { id: 'cat-4', name: 'Сетевое оборудование', parentId: 'elec-comp', productCount: 0, commissionRate: 7 },
  { id: 'cat-6', name: 'Комплектующие', parentId: 'elec-comp', productCount: 0, commissionRate: 6 },

  { id: 'cat-2', name: 'Смартфоны и гаджеты', parentId: 'elec-gadg', productCount: 0, commissionRate: 8 },
  { id: 'cat-3', name: 'Периферия и аксессуары', parentId: 'elec-gadg', productCount: 0, commissionRate: 10 },
  { id: 'cat-5', name: 'Офисная техника', parentId: 'elec-gadg', productCount: 0, commissionRate: 9 },
]

/* ------------------------------------------------------------ Товары */

const PRODUCT_NAMES: Record<string, string[]> = {
  'cat-1': ['Ноутбук Lenovo IdeaPad 3', 'Ноутбук ASUS VivoBook 15', 'Моноблок HP 24', 'Ноутбук Acer Aspire 5', 'ПК в сборе Office Pro'],
  'cat-2': ['Смартфон Samsung Galaxy A55', 'Смартфон Redmi Note 13', 'Планшет Samsung Tab A9', 'Смарт-часы Amazfit Bip 5', 'Наушники JBL Tune 520'],
  'cat-3': ['Клавиатура Logitech K380', 'Мышь Logitech M185', 'Коврик игровой XL', 'Веб-камера Logitech C270', 'Подставка для ноутбука'],
  'cat-4': ['Роутер TP-Link Archer C6', 'Коммутатор TP-Link 8-port', 'Wi-Fi адаптер USB', 'Powerline-адаптер', 'Сетевой кабель 20м'],
  'cat-5': ['МФУ Canon PIXMA', 'Принтер HP LaserJet', 'Шредер офисный', 'Ламинатор A4', 'ИБП APC 650VA'],
  'cat-6': ['SSD Samsung 1TB', 'Оперативная память 16GB', 'Видеокарта RTX 4060', 'Блок питания 650W', 'Процессор Intel Core i5'],
}
const STATUSES: ProductStatus[] = ['active', 'active', 'active', 'active', 'draft', 'moderation', 'archived']

export const products: ProductListItem[] = []
const productDetails = new Map<string, ProductDetail>()

let pIdx = 0
for (const cat of categories) {
  const names = PRODUCT_NAMES[cat.id]
  if (!names) continue // не-листовые узлы (корень/раздел) товаров не содержат
  const count = int(7, 9)
  for (let i = 0; i < count; i++) {
    pIdx++
    const id = `p-${pIdx}`
    const base = pick(names)
    const title = `${base} ${pick(['', '(2024)', 'Pro', 'Plus', 'Lite', '16GB', '256GB'])}`.trim()
    const priceSum = int(2, 180) * 100000
    const hasDiscount = rnd() > 0.65
    const status = STATUSES[pIdx % STATUSES.length]!
    const stock = status === 'archived' ? 0 : int(0, 120)
    const item: ProductListItem = {
      id,
      title,
      sku: `TP-${1000 + pIdx}`,
      image: null,
      categoryId: cat.id,
      categoryName: cat.name,
      price: sum(priceSum),
      oldPrice: hasDiscount ? sum(Math.round(priceSum * 1.18)) : null,
      stock,
      status,
      rating: Math.round((3.8 + rnd() * 1.2) * 10) / 10,
      sold: int(0, 540),
    }
    products.push(item)
    cat.productCount++
    productDetails.set(id, {
      ...item,
      description:
        'Оригинальная продукция с официальной гарантией. Поставка со склада в Ташкенте, '
        + 'отгрузка от 1 единицы для юридических лиц. Все документы предоставляются.',
      images: [],
      attributes: [
        { name: 'Гарантия', value: '12 месяцев' },
        { name: 'Страна', value: pick(['Китай', 'Вьетнам', 'Корея', 'Узбекистан']) },
        { name: 'Состояние', value: 'Новый' },
      ],
      commissionRate: cat.commissionRate,
      createdAt: daysAgo(int(10, 200)),
      updatedAt: daysAgo(int(0, 9)),
    })
  }
}

/* ---------------------------------------------- Характеристики категорий
 *
 * От листовой категории зависит, какие характеристики заполняет продавец и по
 * каким осям товар делится на варианты. Это ядро профессионального добавления
 * товара: выбрал «Смартфоны и гаджеты» — получил бренд/память/цвет/экран и оси
 * «Цвет»+«Память»; выбрал «Периферия» — другой набор. Бэкенд отдаст это из
 * справочника категорий; формат совпадает.
 */
const COLOR_OPTS = [
  { value: 'black', label: 'Чёрный' },
  { value: 'white', label: 'Белый' },
  { value: 'silver', label: 'Серебристый' },
  { value: 'blue', label: 'Синий' },
  { value: 'green', label: 'Зелёный' },
  { value: 'gold', label: 'Золотой' },
]
const MEMORY_OPTS = [
  { value: '64', label: '64 ГБ' },
  { value: '128', label: '128 ГБ' },
  { value: '256', label: '256 ГБ' },
  { value: '512', label: '512 ГБ' },
  { value: '1024', label: '1 ТБ' },
]

const CATEGORY_SCHEMAS: Record<string, CategoryAttributeSchema> = {
  // Смартфоны и гаджеты
  'cat-2': {
    categoryId: 'cat-2',
    attributes: [
      { key: 'brand', label: 'Бренд', type: 'select', required: true, options: [
        { value: 'apple', label: 'Apple' }, { value: 'samsung', label: 'Samsung' },
        { value: 'xiaomi', label: 'Xiaomi' }, { value: 'realme', label: 'realme' },
        { value: 'honor', label: 'Honor' }, { value: 'tecno', label: 'Tecno' },
      ] },
      { key: 'model', label: 'Модель', type: 'text', required: true, hint: 'Например, Galaxy A55' },
      { key: 'ram', label: 'Оперативная память', type: 'select', required: true, options: [
        { value: '4', label: '4 ГБ' }, { value: '6', label: '6 ГБ' }, { value: '8', label: '8 ГБ' },
        { value: '12', label: '12 ГБ' }, { value: '16', label: '16 ГБ' },
      ] },
      { key: 'screen', label: 'Диагональ экрана', type: 'number', unit: '″', required: true },
      { key: 'battery', label: 'Ёмкость аккумулятора', type: 'number', unit: 'мА·ч' },
      { key: 'sim', label: 'SIM-карта', type: 'select', options: [
        { value: 'nano', label: 'Nano-SIM' }, { value: 'esim', label: 'eSIM' }, { value: 'dual', label: '2 SIM' },
      ] },
      { key: 'os', label: 'Операционная система', type: 'select', options: [
        { value: 'android', label: 'Android' }, { value: 'ios', label: 'iOS' },
      ] },
      { key: 'nfc', label: 'NFC', type: 'boolean' },
      { key: 'condition', label: 'Состояние', type: 'select', required: true, options: [
        { value: 'new', label: 'Новый' }, { value: 'refurb', label: 'Восстановленный' },
      ] },
    ],
    variantAxes: [
      { key: 'color', label: 'Цвет', options: COLOR_OPTS },
      { key: 'memory', label: 'Встроенная память', options: MEMORY_OPTS },
    ],
  },
  // Ноутбуки и компьютеры
  'cat-1': {
    categoryId: 'cat-1',
    attributes: [
      { key: 'brand', label: 'Бренд', type: 'select', required: true, options: [
        { value: 'lenovo', label: 'Lenovo' }, { value: 'asus', label: 'ASUS' },
        { value: 'hp', label: 'HP' }, { value: 'acer', label: 'Acer' }, { value: 'apple', label: 'Apple' },
      ] },
      { key: 'cpu', label: 'Процессор', type: 'select', required: true, options: [
        { value: 'i3', label: 'Intel Core i3' }, { value: 'i5', label: 'Intel Core i5' },
        { value: 'i7', label: 'Intel Core i7' }, { value: 'ryzen5', label: 'AMD Ryzen 5' },
        { value: 'ryzen7', label: 'AMD Ryzen 7' }, { value: 'm3', label: 'Apple M3' },
      ] },
      { key: 'ram', label: 'Оперативная память', type: 'select', required: true, options: [
        { value: '8', label: '8 ГБ' }, { value: '16', label: '16 ГБ' }, { value: '32', label: '32 ГБ' },
      ] },
      { key: 'screen', label: 'Диагональ экрана', type: 'number', unit: '″', required: true },
      { key: 'gpu', label: 'Видеокарта', type: 'text' },
      { key: 'os', label: 'Операционная система', type: 'select', options: [
        { value: 'win', label: 'Windows 11' }, { value: 'noos', label: 'Без ОС' }, { value: 'macos', label: 'macOS' },
      ] },
    ],
    variantAxes: [
      { key: 'color', label: 'Цвет', options: COLOR_OPTS },
      { key: 'storage', label: 'Накопитель', options: [
        { value: '256', label: 'SSD 256 ГБ' }, { value: '512', label: 'SSD 512 ГБ' }, { value: '1024', label: 'SSD 1 ТБ' },
      ] },
    ],
  },
  // Периферия и аксессуары
  'cat-3': {
    categoryId: 'cat-3',
    attributes: [
      { key: 'type', label: 'Тип устройства', type: 'select', required: true, options: [
        { value: 'keyboard', label: 'Клавиатура' }, { value: 'mouse', label: 'Мышь' },
        { value: 'headset', label: 'Гарнитура' }, { value: 'webcam', label: 'Веб-камера' },
      ] },
      { key: 'connection', label: 'Подключение', type: 'select', required: true, options: [
        { value: 'usb', label: 'USB' }, { value: 'bt', label: 'Bluetooth' }, { value: 'wireless', label: 'Радио 2.4 ГГц' },
      ] },
      { key: 'brand', label: 'Бренд', type: 'text' },
    ],
    variantAxes: [
      { key: 'color', label: 'Цвет', options: COLOR_OPTS },
    ],
  },
}

// Запасная схема для категорий без собственного справочника.
const DEFAULT_SCHEMA = (categoryId: string): CategoryAttributeSchema => ({
  categoryId,
  attributes: [
    { key: 'brand', label: 'Бренд', type: 'text' },
    { key: 'country', label: 'Страна-производитель', type: 'text' },
    { key: 'warranty', label: 'Гарантия', type: 'select', options: [
      { value: '0', label: 'Без гарантии' }, { value: '6', label: '6 месяцев' },
      { value: '12', label: '12 месяцев' }, { value: '24', label: '24 месяца' },
    ] },
  ],
  variantAxes: [
    { key: 'color', label: 'Цвет', options: COLOR_OPTS },
  ],
})

export function getCategoryAttributes(categoryId: string): CategoryAttributeSchema {
  return CATEGORY_SCHEMAS[categoryId] ?? DEFAULT_SCHEMA(categoryId)
}

/* ------------------------------------------------------------ Заказы */

const ORDER_STATUS_FLOW: OrderStatusCode[] = ['new', 'confirmed', 'packing', 'shipped', 'delivered', 'completed']
// Только B2B-способы: баланс кошелька (чаще) и корпоративная карта. Без налички
// и потребительских карт — прямой оплаты обычной картой на платформе нет.
const PAYMENTS: PaymentMethodCode[] = ['wallet', 'corp_card', 'wallet', 'corp_card', 'wallet']

export const orders: OrderListItem[] = []
const orderDetails = new Map<string, OrderDetail>()

for (let i = 0; i < 64; i++) {
  const id = `ord-${i + 1}`
  const number = `PM-${24000 + i}`
  const itemCount = int(1, 4)
  const rows: OrderItemRow[] = []
  let subtotalAmt = 0
  for (let j = 0; j < itemCount; j++) {
    const prod = pick(products)
    const qty = int(1, 6)
    const lineTotal = prod.price.amount * qty
    subtotalAmt += lineTotal
    rows.push({
      productId: prod.id,
      title: prod.title,
      image: null,
      sku: prod.sku,
      qty,
      price: prod.price,
      total: tiyin(lineTotal),
    })
  }
  const roll = rnd()
  const statusCode: OrderStatusCode
    = roll > 0.92 ? 'cancelled' : roll > 0.86 ? 'returned' : pick(ORDER_STATUS_FLOW)
  const deliveryAmt = int(0, 1) ? 0 : 35000 * 100
  const subtotal = tiyin(subtotalAmt)
  const total = tiyin(subtotalAmt + deliveryAmt)
  const commission = percentOf(subtotal, company.commissionRate)
  const payout = minus(total, commission)
  const createdAt = daysAgo(int(0, 88))

  const list: OrderListItem = {
    id,
    number,
    createdAt,
    statusCode,
    itemsCount: rows.reduce((s, r) => s + r.qty, 0),
    total,
    paymentMethod: pick(PAYMENTS),
  }
  orders.push(list)

  const flowIdx = ORDER_STATUS_FLOW.indexOf(statusCode)
  const timeline = (flowIdx >= 0 ? ORDER_STATUS_FLOW.slice(0, flowIdx + 1) : ['new', statusCode] as OrderStatusCode[])
    .map((code, k) => ({ code, at: daysAgo(int(0, 88) + (flowIdx - k)) }))

  // Покупатель продавцу не виден: товар забирает курьер spotshop или продавец везёт на склад площадки
  const pickup = rnd() > 0.4
  orderDetails.set(id, {
    ...list,
    items: rows,
    subtotal,
    delivery: tiyin(deliveryAmt),
    commission,
    payout,
    handover: {
      method: pickup ? 'courierPickup' : 'dropOff',
      point: pickup ? company.legalAddress : 'Склад spotshop: Ташкент, Сергелийский район, ул. Янги Сергели, 25',
      until: daysAgo(-1),
    },
    timeline,
  })
}

orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

/* ------------------------------------------------------------ Финансы */

const soldOrders = orders.filter(o => !['cancelled', 'returned'].includes(o.statusCode))

const lifetimeEarnedAmt = soldOrders.reduce((s, o) => s + (orderDetails.get(o.id)?.payout.amount ?? 0), 0)
const availableAmt = Math.round(lifetimeEarnedAmt * 0.18)
const pendingAmt = soldOrders
  .filter(o => ['new', 'confirmed', 'packing', 'shipped'].includes(o.statusCode))
  .reduce((s, o) => s + (orderDetails.get(o.id)?.payout.amount ?? 0), 0)

export const balance: BalanceState = {
  available: tiyin(availableAmt),
  pending: tiyin(pendingAmt),
  hold: sum(int(0, 3) * 250000),
  lifetimeEarned: tiyin(lifetimeEarnedAmt),
}

export const commissions: CommissionRow[] = soldOrders.map((o, i) => {
  const d = orderDetails.get(o.id)!
  return {
    id: `com-${i + 1}`,
    orderNumber: o.number,
    date: o.createdAt,
    base: d.subtotal,
    rate: company.commissionRate,
    amount: d.commission,
    categoryName: pick(categories).name,
  }
})

export const payouts: PayoutRow[] = Array.from({ length: 11 }, (_, i) => {
  const statusRoll = i < 2 ? 'processing' : i < 3 ? 'requested' : rnd() > 0.9 ? 'rejected' : 'paid'
  const requestedAt = daysAgo(i * 7 + int(0, 3))
  return {
    id: `pay-${i + 1}`,
    requestedAt,
    paidAt: statusRoll === 'paid' ? daysAgo(i * 7 - 1) : null,
    amount: sum(int(8, 55) * 1000000),
    status: statusRoll as PayoutRow['status'],
    destination: '**** 9012',
  }
})

export const transactions: TransactionRow[] = (() => {
  const rows: TransactionRow[] = []
  let running = balance.lifetimeEarned.amount
  let id = 0
  for (const o of soldOrders.slice(0, 40)) {
    const d = orderDetails.get(o.id)!
    rows.push({
      id: `tx-${++id}`,
      date: o.createdAt,
      type: 'sale',
      amount: d.total,
      balanceAfter: tiyin(running),
      description: `Продажа по заказу ${o.number}`,
      orderNumber: o.number,
    })
    running -= d.commission.amount
    rows.push({
      id: `tx-${++id}`,
      date: o.createdAt,
      type: 'commission',
      amount: tiyin(-d.commission.amount),
      balanceAfter: tiyin(running),
      description: `Комиссия маркетплейса ${company.commissionRate}%`,
      orderNumber: o.number,
    })
  }
  for (const p of payouts.filter(p => p.status === 'paid').slice(0, 6)) {
    running -= p.amount.amount
    rows.push({
      id: `tx-${++id}`,
      date: p.paidAt!,
      type: 'payout',
      amount: tiyin(-p.amount.amount),
      balanceAfter: tiyin(running),
      description: `Вывод средств на счёт ${p.destination}`,
    })
  }
  return rows.sort((a, b) => b.date.localeCompare(a.date))
})()

/* ------------------------------------------------------------ Документы */

export const documents: DocumentRow[] = [
  { id: 'doc-1', type: 'contract', title: 'Договор с продавцом (Merchant Agreement)', period: '2026', date: daysAgo(214), status: 'ready', amount: null, url: '#' },
  { id: 'doc-2', type: 'invoice', title: 'Счёт-фактура за октябрь 2026', period: 'Октябрь 2026', date: daysAgo(4), status: 'ready', amount: sum(48500000), url: '#' },
  { id: 'doc-3', type: 'act', title: 'Акт выполненных работ, октябрь 2026', period: 'Октябрь 2026', date: daysAgo(4), status: 'signRequired', amount: sum(3880000), url: '#' },
  { id: 'doc-4', type: 'report', title: 'Отчёт о продажах за октябрь 2026', period: 'Октябрь 2026', date: daysAgo(3), status: 'ready', amount: null, url: '#' },
  { id: 'doc-5', type: 'reconciliation', title: 'Акт сверки взаиморасчётов, Q3 2026', period: 'Q3 2026', date: daysAgo(30), status: 'ready', amount: null, url: '#' },
  { id: 'doc-6', type: 'invoice', title: 'Счёт-фактура за сентябрь 2026', period: 'Сентябрь 2026', date: daysAgo(35), status: 'ready', amount: sum(41200000), url: '#' },
  { id: 'doc-7', type: 'report', title: 'Отчёт о комиссиях за Q3 2026', period: 'Q3 2026', date: daysAgo(31), status: 'generating', amount: null, url: '#' },
]

/* ------------------------------------------------------------ Сотрудники */

export const employees: Employee[] = [
  { id: 'emp-1', name: 'Azizov Sardor', phone: '+998 90 123 45 67', email: 'sardor@technopro.uz', role: 'owner', status: 'active', lastActiveAt: daysAgo(0) },
  { id: 'emp-2', name: 'Karimova Nilufar', phone: '+998 91 234 56 78', email: 'nilufar@technopro.uz', role: 'manager', status: 'active', lastActiveAt: daysAgo(0) },
  { id: 'emp-3', name: 'Yusupov Jasur', phone: '+998 93 345 67 89', email: 'jasur@technopro.uz', role: 'storekeeper', status: 'active', lastActiveAt: daysAgo(1) },
  { id: 'emp-4', name: 'Rahimova Malika', phone: '+998 94 456 78 90', email: 'malika@technopro.uz', role: 'accountant', status: 'active', lastActiveAt: daysAgo(2) },
  { id: 'emp-5', name: 'Tursunov Bekzod', phone: '+998 95 567 89 01', email: 'bekzod@technopro.uz', role: 'viewer', status: 'invited', lastActiveAt: null },
]

/* ------------------------------------------------------------ Уведомления */

export const notifications: NotificationItem[] = [
  { id: 'n-1', kind: 'order', title: 'Новый заказ PM-24063', text: 'Поступил новый заказ на 2 позиции. Подтвердите в течение 24 часов.', createdAt: daysAgo(0), read: false, link: '/orders/ord-1' },
  { id: 'n-2', kind: 'finance', title: 'Выплата обработана', text: 'Выплата на сумму 32 000 000 сум зачислена на ваш счёт.', createdAt: daysAgo(1), read: false, link: '/finance/payouts' },
  { id: 'n-3', kind: 'product', title: 'Товар прошёл модерацию', text: 'Карточка «SSD Samsung 1TB» опубликована на витрине.', createdAt: daysAgo(1), read: false, link: '/products' },
  { id: 'n-4', kind: 'product', title: 'Заканчивается остаток', text: '3 товара заканчиваются на складе. Пополните остатки.', createdAt: daysAgo(2), read: true, link: '/products' },
  { id: 'n-5', kind: 'support', title: 'Ответ службы поддержки', text: 'Вам ответили по обращению TK-108.', createdAt: daysAgo(3), read: true, link: '/support' },
  { id: 'n-6', kind: 'system', title: 'Обновление условий', text: 'С 1 декабря обновляются тарифы комиссий по категории «Смартфоны».', createdAt: daysAgo(5), read: true, link: '/documents' },
]

/* ------------------------------------------------------------ Поддержка */

export const tickets: TicketDetail[] = [
  {
    id: 'tk-1', number: 'TK-108', subject: 'Вопрос по выплате за октябрь', status: 'answered', priority: 'high',
    createdAt: daysAgo(3), updatedAt: daysAgo(1), lastMessage: 'Выплата будет обработана в течение 2 рабочих дней.',
    messages: [
      { id: 'm-1', author: 'merchant', text: 'Здравствуйте! Когда ожидать выплату за октябрь?', createdAt: daysAgo(3) },
      { id: 'm-2', author: 'support', text: 'Добрый день! Выплата будет обработана в течение 2 рабочих дней.', createdAt: daysAgo(1) },
    ],
  },
  {
    id: 'tk-2', number: 'TK-101', subject: 'Как добавить второй склад?', status: 'closed', priority: 'normal',
    createdAt: daysAgo(14), updatedAt: daysAgo(12), lastMessage: 'Спасибо, вопрос решён.',
    messages: [
      { id: 'm-3', author: 'merchant', text: 'Нужно подключить второй склад в Самарканде.', createdAt: daysAgo(14) },
      { id: 'm-4', author: 'support', text: 'Добавьте склад в разделе «Профиль компании» → «Склады».', createdAt: daysAgo(13) },
      { id: 'm-5', author: 'merchant', text: 'Спасибо, вопрос решён.', createdAt: daysAgo(12) },
    ],
  },
]

/* ------------------------------------------------------------ Экспорт-геттеры */

export const getProductDetail = (id: string) => productDetails.get(id) ?? null
export const getOrderDetail = (id: string) => orderDetails.get(id) ?? null
export const allProductDetails = productDetails

/** Денежный ноль для редких краёв. */
export const ZERO: Money = { amount: 0, currency: 'UZS' }

/*
 * Заполняем обязательные характеристики демо-товаров по схеме их категории:
 * иначе ни один готовый товар нельзя было сохранить.
 */
for (const detail of productDetails.values()) {
  const required = getCategoryAttributes(detail.categoryId).attributes.filter(attr => attr.required)
  const filled = required.map((attr) => {
    if (attr.type === 'select' || attr.type === 'multiselect') return { name: attr.label, value: attr.options?.[0]?.label ?? '' }
    if (attr.type === 'number') return { name: attr.label, value: `1${attr.unit ? ` ${attr.unit}` : ''}` }
    return { name: attr.label, value: detail.title }
  })
  detail.attributes = [...filled, ...detail.attributes]
}

/* ---------------------------------------------- Отзывы о товарах */

const REVIEW_AUTHORS = ['OOO «MedLine»', 'OOO «EduTech»', 'OOO «Bank Service»', 'OOO «Silk Road Logistics»', 'IP Rahimov B.', 'Rahimova Malika']
const REVIEW_TEXTS: Array<[number, string]> = [
  [5, 'Партия пришла полностью и вовремя, документы в порядке. Закажем ещё.'],
  [4, 'Товар хороший, но доставка задержалась на день.'],
  [5, 'Менеджер быстро подтвердил заказ, упаковка надёжная.'],
  [2, 'В партии две единицы с повреждённой упаковкой. Ждём замену.'],
  [3, 'Качество нормальное, но описание на карточке неполное.'],
  [1, 'Отгрузили не ту модель, пришлось оформлять возврат.'],
  [5, 'Берём регулярно для офиса, нареканий нет.'],
  [4, 'Цена хорошая, но хотелось бы скидку от большой партии.'],
]

export const reviews: ReviewRow[] = products.slice(0, 24).map((product, index) => {
  const [rating, text] = REVIEW_TEXTS[index % REVIEW_TEXTS.length]!
  return {
    id: `rev-${index + 1}`,
    productId: product.id,
    productTitle: product.title,
    author: REVIEW_AUTHORS[index % REVIEW_AUTHORS.length]!,
    rating,
    text,
    createdAt: daysAgo(index),
    reply: index % 3 === 2
      ? { text: 'Спасибо за отзыв! Передали информацию на склад.', createdAt: daysAgo(Math.max(index - 1, 0)) }
      : null,
  }
})
