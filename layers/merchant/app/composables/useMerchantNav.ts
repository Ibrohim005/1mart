/**
 * Карта навигации кабинета. Один источник правды для боковой панели и крошек.
 * Пути — без префикса языка; `localePath` применяется в месте отрисовки.
 * Подписи — ключи словаря (`m.nav.*`), иконки — имена из @zoo/shared.
 */
export interface MerchantNavItem {
  key: string
  labelKey: string
  icon: string
  to: string
}
export interface MerchantNavGroup {
  titleKey: string
  items: MerchantNavItem[]
}

export function useMerchantNav(): MerchantNavGroup[] {
  return [
    {
      titleKey: 'm.nav.groupMain',
      items: [
        { key: 'dashboard', labelKey: 'm.nav.dashboard', icon: 'element-3-fill', to: '/dashboard' },
      ],
    },
    {
      titleKey: 'm.nav.groupCatalog',
      items: [
        { key: 'products', labelKey: 'm.nav.products', icon: 'box-fill', to: '/products' },
        { key: 'categories', labelKey: 'm.nav.categories', icon: 'category-2-fill', to: '/categories' },
      ],
    },
    {
      titleKey: 'm.nav.groupSales',
      items: [
        { key: 'orders', labelKey: 'm.nav.orders', icon: 'bag-2-fill', to: '/orders' },
        { key: 'reviews', labelKey: 'm.nav.reviews', icon: 'star-fill', to: '/reviews' },
      ],
    },
    {
      titleKey: 'm.nav.groupFinance',
      items: [
        { key: 'finance', labelKey: 'm.nav.finance', icon: 'wallet-money-fill', to: '/finance' },
        { key: 'balance', labelKey: 'm.nav.balance', icon: 'wallet-3-fill', to: '/finance/balance' },
        { key: 'commissions', labelKey: 'm.nav.commissions', icon: 'percentage-square-fill', to: '/finance/commissions' },
        { key: 'payouts', labelKey: 'm.nav.payouts', icon: 'money-recive-fill', to: '/finance/payouts' },
        { key: 'transactions', labelKey: 'm.nav.transactions', icon: 'convert-card-fill', to: '/finance/transactions' },
        { key: 'documents', labelKey: 'm.nav.documents', icon: 'document-text-fill', to: '/documents' },
      ],
    },
    {
      titleKey: 'm.nav.groupCompany',
      items: [
        { key: 'company', labelKey: 'm.nav.company', icon: 'building-fill', to: '/company' },
        { key: 'employees', labelKey: 'm.nav.employees', icon: 'people-fill', to: '/employees' },
      ],
    },
    {
      titleKey: 'm.nav.groupSystem',
      items: [
        { key: 'notifications', labelKey: 'm.nav.notifications', icon: 'notification-bing-fill', to: '/notifications' },
        { key: 'support', labelKey: 'm.nav.support', icon: 'headphone-fill', to: '/support' },
      ],
    },
  ]
}
