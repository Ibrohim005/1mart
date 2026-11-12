import type { Banner } from '#shared/types/catalog'
import { mockLocale } from '../../mocks/facets'
import { allowedCategories } from '../utils/org-state'
import type { MockLocale } from '../../mocks/facets'

const uzs = (sum: number) => ({ amount: sum * 100, currency: 'UZS' as const })

/** Скидку считаем от цен, а не пишем руками: раньше подписи расходились с ними */
const discountLabel = (oldSum: number, sum: number) => `-${Math.round((1 - sum / oldSum) * 100)}%`

const OFFICE = '/mock/office'

type Text = Record<MockLocale, string>

type Source = {
  id: number
  title: Text
  oldSum: number
  sum: number
  until: Text
  tone: Banner['tone']
  link: string
  image: string
  description: Text
}

const UNTIL_NOV = { ru: 'до 30 ноября', uz: '30-noyabrgacha', 'uz-cyrl': '30 ноябргача', en: 'until 30 November' }
const UNTIL_DEC = { ru: 'до 31 декабря', uz: '31-dekabrgacha', 'uz-cyrl': '31 декабргача', en: 'until 31 December' }

/**
 * Промо-баннеры главной spotshop. B2B-витрина, поэтому акции — на то, что
 * закупает офис: бумага, оргтехника, мебель, техника для сотрудников, кухня.
 * Цены те же, что у товаров в mocks/office-goods.ts. Тексты на всех языках
 * витрины, язык — по заголовку Accept-Language. Фото со своим фоном, поэтому
 * imageKind: 'photo' — карусель показывает их плиткой, а не на градиенте.
 * TODO: Connect to backend endpoint GET /banners?placement=
 */
const carousel: Source[] = [
  {
    id: 1,
    title: { ru: 'Бумага А4 для всего офиса', uz: 'Butun ofis uchun A4 qog\'oz', 'uz-cyrl': 'Бутун офис учун A4 қоғоз', en: 'A4 paper for the whole office' },
    oldSum: 69_000,
    sum: 59_000,
    until: UNTIL_NOV,
    tone: 'brand',
    link: '/category/bumaga-i-bloknoty',
    image: `${OFFICE}/a4-paper.jpg`,
    description: {
      ru: 'Офисная бумага А4 Svetocopy, 500 листов, со скидкой. Счёт-фактура и закрывающие документы в комплекте. До 30 ноября.',
      uz: 'Svetocopy A4 ofis qog\'ozi, 500 varaq, chegirmada. Hisob-faktura va yopuvchi hujjatlar bilan. 30-noyabrgacha.',
      'uz-cyrl': 'Svetocopy A4 офис қоғози, 500 варақ, чегирмада. Ҳисоб-фактура ва ёпувчи ҳужжатлар билан. 30 ноябргача.',
      en: 'Svetocopy A4 office paper, 500 sheets, on sale. Invoice and closing documents included. Until 30 November.',
    },
  },
  {
    id: 2,
    title: { ru: 'Оргтехника для офиса', uz: 'Ofis uchun texnika', 'uz-cyrl': 'Офис учун техника', en: 'Office equipment' },
    oldSum: 5_290_000,
    sum: 4_690_000,
    until: UNTIL_NOV,
    tone: 'slate',
    link: '/category/orgtehnika',
    image: `${OFFICE}/mfp-printer.jpg`,
    description: {
      ru: 'МФУ, принтеры, картриджи и проекторы для офиса со скидкой. До 30 ноября.',
      uz: 'Ofis uchun MFQ, printerlar, kartrijlar va proyektorlar chegirmada. 30-noyabrgacha.',
      'uz-cyrl': 'Офис учун МФҚ, принтерлар, картрижлар ва проекторлар чегирмада. 30 ноябргача.',
      en: 'MFPs, printers, cartridges and projectors for the office on sale. Until 30 November.',
    },
  },
  {
    id: 3,
    title: { ru: 'Рабочее место под ключ', uz: 'Tayyor ish joyi', 'uz-cyrl': 'Тайёр иш жойи', en: 'Complete workstations' },
    oldSum: 2_990_000,
    sum: 2_490_000,
    until: UNTIL_DEC,
    tone: 'brand',
    link: '/category/ofisnaya-mebel',
    image: `${OFFICE}/office-chair.jpg`,
    description: {
      ru: 'Эргономичные кресла и офисные столы со скидкой, доставка и сборка силами spotshop. До 31 декабря.',
      uz: 'Ergonomik kreslolar va ofis stollari chegirmada, yetkazib berish va yig\'ish spotshop tomonidan. 31-dekabrgacha.',
      'uz-cyrl': 'Эргономик креслолар ва офис столлари чегирмада, етказиб бериш ва йиғиш spotshop томонидан. 31 декабргача.',
      en: 'Ergonomic chairs and office desks on sale, delivered and assembled by spotshop. Until 31 December.',
    },
  },
  {
    id: 4,
    title: { ru: 'Ноутбуки для сотрудников', uz: 'Xodimlar uchun noutbuklar', 'uz-cyrl': 'Ходимлар учун ноутбуклар', en: 'Laptops for your team' },
    oldSum: 15_400_000,
    sum: 13_900_000,
    until: UNTIL_DEC,
    tone: 'slate',
    link: '/category/kompyutery-i-periferiya',
    image: `${OFFICE}/laptop.jpg`,
    description: {
      ru: 'Ноутбуки, мониторы и периферия для сотрудников со скидкой. Оплата с баланса компании. До 31 декабря.',
      uz: 'Xodimlar uchun noutbuklar, monitorlar va periferiya chegirmada. Kompaniya balansidan to\'lov. 31-dekabrgacha.',
      'uz-cyrl': 'Ходимлар учун ноутбуклар, мониторлар ва периферия чегирмада. Компания балансидан тўлов. 31 декабргача.',
      en: 'Laptops, monitors and peripherals for your team on sale. Pay from the company balance. Until 31 December.',
    },
  },
  {
    id: 5,
    title: { ru: 'Кофе-точка в офис', uz: 'Ofisga qahva burchagi', 'uz-cyrl': 'Офисга қаҳва бурчаги', en: 'A coffee corner for the office' },
    oldSum: 8_200_000,
    sum: 7_400_000,
    until: UNTIL_DEC,
    tone: 'brand',
    link: '/category/ofisnaya-kuhnya-i-hoztovary',
    image: `${OFFICE}/coffee-machine.jpg`,
    description: {
      ru: 'Автоматические кофемашины и всё для офисной кухни со скидкой. До 31 декабря.',
      uz: 'Avtomatik qahva mashinalari va ofis oshxonasi uchun hammasi chegirmada. 31-dekabrgacha.',
      'uz-cyrl': 'Автоматик қаҳва машиналари ва офис ошхонаси учун ҳаммаси чегирмада. 31 декабргача.',
      en: 'Automatic coffee machines and everything for the office kitchen on sale. Until 31 December.',
    },
  },
]

/** Ряд из двух баннеров между полками: свой набор, чтобы не повторять карусель */
const platform: Source[] = [
  {
    id: 6,
    title: { ru: 'Канцтовары оптом', uz: 'Kanselyariya mollari ulgurji', 'uz-cyrl': 'Канцелярия моллари улгуржи', en: 'Stationery in bulk' },
    oldSum: 35_000,
    sum: 29_000,
    until: UNTIL_NOV,
    tone: 'slate',
    link: '/category/pismennye-prinadlezhnosti',
    image: `${OFFICE}/ballpoint-pens.jpg`,
    description: {
      ru: 'Ручки, карандаши и маркеры для офиса со скидкой. До 30 ноября.',
      uz: 'Ofis uchun ruchkalar, qalamlar va markerlar chegirmada. 30-noyabrgacha.',
      'uz-cyrl': 'Офис учун ручкалар, қаламлар ва маркерлар чегирмада. 30 ноябргача.',
      en: 'Pens, pencils and markers for the office on sale. Until 30 November.',
    },
  },
  {
    id: 7,
    title: { ru: 'Хозтовары для офиса', uz: 'Ofis uchun xo\'jalik mollari', 'uz-cyrl': 'Офис учун хўжалик моллари', en: 'Office cleaning supplies' },
    oldSum: 99_000,
    sum: 89_000,
    until: UNTIL_DEC,
    tone: 'brand',
    link: '/category/ofisnaya-kuhnya-i-hoztovary',
    image: `${OFFICE}/toilet-paper.jpg`,
    description: {
      ru: 'Бумажные и хозяйственные товары для офиса со скидкой. До 31 декабря.',
      uz: 'Ofis uchun qog\'oz va xo\'jalik mollari chegirmada. 31-dekabrgacha.',
      'uz-cyrl': 'Офис учун қоғоз ва хўжалик моллари чегирмада. 31 декабргача.',
      en: 'Paper and cleaning supplies for the office on sale. Until 31 December.',
    },
  },
]

export default defineEventHandler((event): ReturnType<typeof ok<Banner[]>> => {
  const locale = mockLocale(getHeader(event, 'accept-language'))
  // Реальный бэкенд отдаёт две площадки: shop_carousel — верхняя карусель,
  // shop_platform — ряд ниже. imageSmall пустой: ряд рисует баннер из данных.
  // Сотруднику не показываем акции разделов, закрытых его отделу: баннер вёл бы в пустоту
  const allowed = allowedCategories(event)
  const open = (link: string) => !allowed || allowed.includes(link.replace('/category/', ''))
  const source = (getQuery(event).placement === 'shop_platform' ? platform : carousel).filter(item => open(item.link))

  const banners: Banner[] = source.map(item => ({
    id: item.id,
    title: item.title[locale],
    oldPrice: uzs(item.oldSum),
    price: uzs(item.sum),
    discountLabel: discountLabel(item.oldSum, item.sum),
    until: item.until[locale],
    tone: item.tone,
    link: item.link,
    image: item.image,
    imageSmall: '',
    imageKind: 'photo',
    description: item.description[locale],
  }))

  return ok(banners)
})
