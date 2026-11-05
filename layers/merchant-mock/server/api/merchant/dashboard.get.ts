import type { DashboardSummary, SalesPoint } from '#shared/types/merchant'
import { balance, orders, products, reviews } from '../../lib/db'
import { tiyin } from '../../lib/money'

/**
 * Сводка главной панели кабинета.
 * TODO: Connect to backend endpoint GET /merchant/dashboard
 */
export default defineEventHandler(() => {
  const now = new Date()
  const sold = orders.filter(o => !['cancelled', 'returned'].includes(o.statusCode))

  // Выручка и заказы за последние 14 дней — ряд для графика.
  const series: SalesPoint[] = []
  for (let i = 13; i >= 0; i--) {
    const day = new Date(now)
    day.setDate(day.getDate() - i)
    const key = day.toISOString().slice(0, 10)
    const dayOrders = sold.filter(o => o.createdAt.slice(0, 10) === key)
    series.push({
      date: key,
      revenue: tiyin(dayOrders.reduce((s, o) => s + o.total.amount, 0)),
      orders: dayOrders.length,
    })
  }

  const revenueAmt = sold.reduce((s, o) => s + o.total.amount, 0)
  const ordersCount = sold.length
  const avgCheck = ordersCount ? Math.round(revenueAmt / ordersCount) : 0

  const topProducts = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5)
  const recentOrders = orders.slice(0, 6)

  const summary: DashboardSummary = {
    revenue: { value: revenueAmt, deltaPct: 12.4 },
    orders: { value: ordersCount, deltaPct: 8.1 },
    avgCheck: { value: avgCheck, deltaPct: 3.9 },
    conversion: { value: 4.6, deltaPct: -0.4 },
    balanceAvailable: balance.available,
    balancePending: balance.pending,
    salesSeries: series,
    funnel: [
      { code: 'views', value: 48230 },
      { code: 'cart', value: 6120 },
      { code: 'checkout', value: 2840 },
      { code: 'paid', value: 2214 },
    ],
    topProducts,
    recentOrders,
    attention: {
      newOrders: orders.filter(o => o.statusCode === 'new').length,
      unansweredReviews: reviews.filter(r => !r.reply).length,
      moderation: products.filter(p => p.status === 'moderation').length,
      outOfStock: products.filter(p => p.stock === 0 && p.status === 'active').length,
      openTickets: 1,
      unreadNotifications: 3,
    },
  }
  return ok(summary)
})
