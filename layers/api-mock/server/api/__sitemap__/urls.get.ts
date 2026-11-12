import { categories, isSellerShown, productCards, sellers } from '../../../mocks/data'

/** Статические страницы из подвала — в карте сайта их не было ни одной */
const INFO_PAGES = [
  'about', 'blog', 'partners', 'post-ad', 'terms', 'privacy', 'rules', 'cookie',
  'documents', 'help', 'services', 'faq', 'contact', 'complaint', 'chat',
  'delivery', 'terms-conditions',
]

/**
 * Источник динамических URL для sitemap.xml.
 * Когда появится бэкенд — тянуть отсюда же, но из его API.
 */
export default defineEventHandler(() => [
  ...categories.map(c => ({
    loc: `/category/${c.slug}`,
    changefreq: 'daily',
    priority: 0.8,
  })),
  ...productCards.map(p => ({
    loc: `/product/${p.slug}`,
    changefreq: 'weekly',
    priority: 0.7,
  })),
  // Только продавцы, которых площадка показывает: страница скрытого отдаёт 404
  ...sellers.filter(s => isSellerShown(s.slug)).map(s => ({
    loc: `/seller/${s.slug}`,
    changefreq: 'weekly',
    priority: 0.6,
  })),
  ...INFO_PAGES.map(slug => ({
    loc: `/info/${slug}`,
    changefreq: 'monthly',
    priority: 0.4,
  })),
])
