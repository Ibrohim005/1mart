import type { Banner } from '#shared/types/catalog'
import { mockLocale } from '../../mocks/facets'
import type { MockLocale } from '../../mocks/facets'

const uzs = (sum: number) => ({ amount: sum * 100, currency: 'UZS' as const })

/** Скидку считаем от цен, а не пишем руками: раньше подписи расходились с ними */
const discountLabel = (oldSum: number, sum: number) => `-${Math.round((1 - sum / oldSum) * 100)}%`

const CDN = 'https://cdn.dummyjson.com/product-images'

type Text = Record<MockLocale, string>

/**
 * Промо-баннеры главной 1mart. Тексты на всех языках витрины,
 * язык — по заголовку Accept-Language. Картинки — фотографии товаров акции.
 * TODO: Connect to backend endpoint GET /banners?placement=
 */
const source: Array<{
  id: number
  title: Text
  oldSum: number
  sum: number
  until: Text
  tone: Banner['tone']
  link: string
  image: string
  imageSmall: string
  description: Text
}> = [
  {
    id: 1,
    title: {
      ru: 'Смартфоны со скидкой до 20%',
      uz: 'Smartfonlarga 20% gacha chegirma',
      'uz-cyrl': 'Смартфонларга 20% гача чегирма',
      en: 'Smartphones up to 20% off',
    },
    oldSum: 17_990_000,
    sum: 14_490_000,
    until: { ru: 'до 30 ноября', uz: '30-noyabrgacha', 'uz-cyrl': '30 ноябргача', en: 'until 30 November' },
    tone: 'violet',
    link: '/category/smartfony',
    image: `${CDN}/smartphones/iphone-13-pro/1.webp`,
    imageSmall: '',
    description: {
      ru: 'Смартфоны Apple, Samsung, Oppo, Realme и Vivo со скидкой до 20%. Акция действует до 30 ноября.',
      uz: 'Apple, Samsung, Oppo, Realme va Vivo smartfonlariga 20% gacha chegirma. Aksiya 30-noyabrgacha amal qiladi.',
      'uz-cyrl': 'Apple, Samsung, Oppo, Realme ва Vivo смартфонларига 20% гача чегирма. Акция 30 ноябргача амал қилади.',
      en: 'Apple, Samsung, Oppo, Realme and Vivo smartphones up to 20% off. The offer is valid until 30 November.',
    },
  },
  {
    id: 2,
    title: { ru: 'Всё для дома', uz: 'Uy uchun hammasi', 'uz-cyrl': 'Уй учун ҳаммаси', en: 'Everything for your home' },
    oldSum: 36_900_000,
    sum: 31_500_000,
    until: { ru: 'до 15 ноября', uz: '15-noyabrgacha', 'uz-cyrl': '15 ноябргача', en: 'until 15 November' },
    tone: 'orange',
    link: '/category/dom-i-sad',
    image: `${CDN}/furniture/annibale-colombo-sofa/1.webp`,
    // Второй слот ряда — тот же макет iPhone 17 Pro (решение заказчика)
    imageSmall: '',
    description: {
      ru: 'Мебель, декор, посуда и освещение для дома со скидками. Предложение действует до 15 ноября.',
      uz: 'Uy uchun mebel, dekor, idish-tovoq va yoritgichlar chegirmada. Taklif 15-noyabrgacha amal qiladi.',
      'uz-cyrl': 'Уй учун мебель, декор, идиш-товоқ ва ёритгичлар чегирмада. Таклиф 15 ноябргача амал қилади.',
      en: 'Furniture, decor, tableware and lighting on sale. The offer is valid until 15 November.',
    },
  },
  {
    id: 3,
    title: { ru: 'Красота -30%', uz: 'Go\'zallik -30%', 'uz-cyrl': 'Гўзаллик -30%', en: 'Beauty -30%' },
    oldSum: 2_690_000,
    sum: 1_890_000,
    until: { ru: 'до 20 октября', uz: '20-oktabrgacha', 'uz-cyrl': '20 октябргача', en: 'until 20 October' },
    tone: 'violet',
    link: '/category/krasota-i-uhod',
    image: `${CDN}/fragrances/dior-j%27adore/1.webp`,
    imageSmall: `${CDN}/fragrances/gucci-bloom-eau-de/1.webp`,
    description: {
      ru: 'Парфюмерия, косметика и уход со скидкой до 30%. Предложение действует до 20 октября.',
      uz: 'Atirlar, kosmetika va parvarish vositalariga 30% gacha chegirma. Taklif 20-oktabrgacha amal qiladi.',
      'uz-cyrl': 'Атирлар, косметика ва парвариш воситаларига 30% гача чегирма. Таклиф 20 октябргача амал қилади.',
      en: 'Fragrances, make-up and skin care up to 30% off. The offer is valid until 20 October.',
    },
  },
  {
    id: 4,
    title: { ru: 'Новая коллекция одежды', uz: 'Yangi kiyim kolleksiyasi', 'uz-cyrl': 'Янги кийим коллекцияси', en: 'New clothing collection' },
    oldSum: 459_000,
    sum: 349_000,
    until: { ru: 'до 30 ноября', uz: '30-noyabrgacha', 'uz-cyrl': '30 ноябргача', en: 'until 30 November' },
    tone: 'orange',
    link: '/category/odezhda',
    image: `${CDN}/tops/gray-dress/1.webp`,
    imageSmall: `${CDN}/womens-dresses/dress-pea/1.webp`,
    description: {
      ru: 'Платья, костюмы и мужские рубашки новой коллекции. Предложение действует до 30 ноября.',
      uz: 'Yangi kolleksiyadagi ko\'ylaklar, kostyumlar va erkaklar ko\'ylaklari. Taklif 30-noyabrgacha amal qiladi.',
      'uz-cyrl': 'Янги коллекциядаги кўйлаклар, костюмлар ва эркаклар кўйлаклари. Таклиф 30 ноябргача амал қилади.',
      en: 'Dresses, suits and men\'s shirts from the new collection. The offer is valid until 30 November.',
    },
  },
  {
    id: 5,
    title: {
      ru: 'Наушники и гаджеты -25%',
      uz: 'Quloqchinlar va gadjetlar -25%',
      'uz-cyrl': 'Қулоқчинлар ва гаджетлар -25%',
      en: 'Headphones and gadgets -25%',
    },
    oldSum: 2_520_000,
    sum: 1_890_000,
    until: { ru: 'до 31 декабря', uz: '31-dekabrgacha', 'uz-cyrl': '31 декабргача', en: 'until 31 December' },
    tone: 'violet',
    link: '/search?kind=recommended',
    image: `${CDN}/mobile-accessories/apple-airpods/1.webp`,
    imageSmall: `${CDN}/mobile-accessories/apple-watch-series-4-gold/1.webp`,
    description: {
      ru: 'Беспроводные наушники, смарт-часы и аксессуары со скидкой до 25%. Акция действует до 31 декабря.',
      uz: 'Simsiz quloqchinlar, aqlli soatlar va aksessuarlarga 25% gacha chegirma. Aksiya 31-dekabrgacha amal qiladi.',
      'uz-cyrl': 'Симсиз қулоқчинлар, ақлли соатлар ва аксессуарларга 25% гача чегирма. Акция 31 декабргача амал қилади.',
      en: 'Wireless headphones, smartwatches and accessories up to 25% off. The offer is valid until 31 December.',
    },
  },
]

export default defineEventHandler((event): ReturnType<typeof ok<Banner[]>> => {
  const locale = mockLocale(getHeader(event, 'accept-language'))
  // Реальный бэкенд отдаёт две площадки (shop_carousel — верхняя карусель,
  // shop_platform — ряд ниже). Для второй мок отдаёт `imageSmall` и в
  // `image`, чтобы ряд не повторял кадры карусели.
  const platform = getQuery(event).placement === 'shop_platform'

  const banners: Banner[] = source.map(item => ({
    id: item.id,
    title: item.title[locale],
    oldPrice: uzs(item.oldSum),
    price: uzs(item.sum),
    discountLabel: discountLabel(item.oldSum, item.sum),
    until: item.until[locale],
    tone: item.tone,
    link: item.link,
    image: platform && item.imageSmall ? item.imageSmall : item.image,
    imageSmall: item.imageSmall,
    description: item.description[locale],
  }))

  return ok(banners)
})
