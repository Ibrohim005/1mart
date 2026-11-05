/**
 * Доменные типы кабинета продавца (B2B Merchant).
 *
 * Деньги везде — это `Money` из каталога: целые тийины внутри, сумы на экран
 * (`useMoney`). Любое поле, от которого зависит поведение интерфейса, несёт
 * машинный код (`statusCode`, `legalForm`, `role`) рядом с переводимой
 * подписью — ветвиться по переведённой строке в этом проекте уже ломалось
 * (см. CLAUDE.md), поэтому здесь так не делаем.
 */
import type { Money, Paged } from '#shared/types/catalog'

/* --------------------------------------------------------------------------
 * Компания и сессия
 * ------------------------------------------------------------------------ */

/** Юридическая форма субъекта. Подпись — в словаре (`m.legalForm.*`). */
export type LegalForm = 'llc' | 'ie' | 'jsc' | 'selfEmployed' | 'other'

/** Статус проверки компании маркетплейсом. */
export type CompanyStatus = 'active' | 'pending' | 'rejected' | 'suspended'

export interface CompanyRequisites {
  /** ИНН / СТИР */
  inn: string
  /** ОКЭД — основной вид деятельности */
  oked?: string
  /** НДС-код плательщика, если есть */
  vatCode?: string
  /** Расчётный счёт в банке */
  bankAccount: string
  /** МФО банка */
  mfo: string
  /** Название банка */
  bankName: string
}

export interface CompanyProfile {
  id: string
  /** Витринное имя магазина */
  shopName: string
  /** Полное юридическое наименование */
  legalName: string
  legalForm: LegalForm
  status: CompanyStatus
  requisites: CompanyRequisites
  director: string
  phone: string
  email: string
  legalAddress: string
  logo?: string | null
  /** Дата подключения к маркетплейсу (ISO) */
  joinedAt: string
  /** Ставка комиссии маркетплейса по умолчанию, проценты */
  commissionRate: number
}

export type MerchantRole = 'owner' | 'manager' | 'storekeeper' | 'accountant' | 'viewer'

export interface MerchantUser {
  id: string
  name: string
  phone: string
  email: string
  role: MerchantRole
  company: Pick<CompanyProfile, 'id' | 'shopName' | 'status'>
}

/* --------------------------------------------------------------------------
 * Dashboard
 * ------------------------------------------------------------------------ */

/** Пара «значение + изменение к прошлому периоду» для плиток KPI. */
export interface MetricDelta {
  value: number
  /** Изменение в процентах; null — не с чем сравнивать */
  deltaPct: number | null
}

export interface SalesPoint {
  /** День в ISO (YYYY-MM-DD) */
  date: string
  revenue: Money
  orders: number
}

export interface FunnelStage {
  code: 'views' | 'cart' | 'checkout' | 'paid'
  value: number
}

export interface DashboardSummary {
  /** Выручка за период */
  revenue: MetricDelta
  orders: MetricDelta
  /** Средний чек, тийины */
  avgCheck: MetricDelta
  /** Конверсия в заказ, проценты */
  conversion: MetricDelta
  /** Доступно к выводу прямо сейчас */
  balanceAvailable: Money
  /** В ожидании (резерв до подтверждения) */
  balancePending: Money
  salesSeries: SalesPoint[]
  funnel: FunnelStage[]
  topProducts: ProductListItem[]
  recentOrders: OrderListItem[]
  /** Что требует внимания: модерация, нет на складе, вопросы */
  attention: {
    newOrders: number
    unansweredReviews: number
    moderation: number
    outOfStock: number
    openTickets: number
    unreadNotifications: number
  }
}

/* --------------------------------------------------------------------------
 * Товары
 * ------------------------------------------------------------------------ */

export type ProductStatus = 'active' | 'draft' | 'moderation' | 'archived' | 'rejected'

export interface ProductListItem {
  id: string
  title: string
  sku: string
  image?: string | null
  categoryId: string
  categoryName: string
  price: Money
  /** Цена до скидки */
  oldPrice?: Money | null
  stock: number
  status: ProductStatus
  rating: number
  /** Всего продано штук */
  sold: number
}

export interface ProductDetail extends ProductListItem, ProductB2bTerms {
  variants?: ProductVariant[]
  description: string
  images: string[]
  /** Характеристики: название → значение */
  attributes: { name: string, value: string }[]
  /** Ставка комиссии для этого товара, проценты */
  commissionRate: number
  createdAt: string
  updatedAt: string
}

/** Отзыв покупателя о товаре продавца */
export interface ReviewRow {
  id: string
  productId: string
  productTitle: string
  author: string
  rating: number
  text: string
  createdAt: string
  reply: { text: string, createdAt: string } | null
}

export interface ReviewsPage extends Paged<ReviewRow> {
  counts: { all: number, unanswered: number, answered: number }
  average: number
  totalReviews: number
}

export type ProductVat = 'included' | 'excluded' | 'none'

/** Условия для компаний: минимальная партия, НДС и данные для доставки */
export interface ProductB2bTerms {
  minOrderQty?: number
  vat?: ProductVat
  weightKg?: number | null
  lengthCm?: number | null
  widthCm?: number | null
  heightCm?: number | null
}

export interface ProductInput extends ProductB2bTerms {
  title: string
  brand?: string
  sku: string
  categoryId: string
  /** Цена в сумах (форма работает в сумах, бэкенд получает тийины) */
  price: number
  oldPrice?: number | null
  stock: number
  status: ProductStatus
  description?: string
  /** Заполненные характеристики категории: ключ → значение(я) */
  characteristics?: Record<string, string | string[]>
  /** Модификации (варианты) товара; пусто — простой товар без вариантов */
  variants?: ProductVariant[]
  images?: string[]
  /** Старый плоский формат характеристик — оставлен для совместимости */
  attributes?: { name: string, value: string }[]
}

/* --------------------------------------------------------------------------
 * Характеристики и варианты товара
 *
 * Профессиональное добавление товара устроено как у Uzum/WB/Ozon: продавец
 * выбирает категорию из дерева, и ОТ КАТЕГОРИИ зависит набор характеристик
 * (`CategoryAttribute`) и оси вариантов (`VariantAxis` — цвет, размер, память).
 * Из осей собираются модификации (`ProductVariant`) со своей ценой и остатком.
 * ------------------------------------------------------------------------ */

/** Тип поля характеристики. */
export type AttributeType = 'select' | 'multiselect' | 'number' | 'text' | 'boolean'

/** Определение одной характеристики категории (что продавец заполняет). */
export interface CategoryAttribute {
  key: string
  label: string
  type: AttributeType
  /** Для select/multiselect */
  options?: { value: string, label: string }[]
  /** Единица измерения для number (", ГБ, мА·ч) */
  unit?: string
  required?: boolean
  hint?: string
}

/** Ось вариантов: по ней товар делится на модификации (Цвет, Размер, Память). */
export interface VariantAxis {
  key: string
  label: string
  options: { value: string, label: string }[]
}

/** Схема категории: характеристики + оси вариантов для листовой категории. */
export interface CategoryAttributeSchema {
  categoryId: string
  attributes: CategoryAttribute[]
  variantAxes: VariantAxis[]
}

/** Одна модификация товара (комбинация значений по осям). */
export interface ProductVariant {
  id: string
  /** Значения по осям: { color: 'black', memory: '256' } */
  options: Record<string, string>
  sku: string
  price: number
  oldPrice?: number | null
  stock: number
  barcode?: string
}

/* --------------------------------------------------------------------------
 * Категории
 * ------------------------------------------------------------------------ */

export interface MerchantCategory {
  id: string
  name: string
  parentId: string | null
  /** Сколько товаров продавца в этой категории */
  productCount: number
  /** Ставка комиссии маркетплейса для категории, проценты */
  commissionRate: number
}

/* --------------------------------------------------------------------------
 * Заказы
 * ------------------------------------------------------------------------ */

/**
 * Машинные статусы заказа. Подпись локализуется (`m.orderStatus.*`),
 * ветвимся по коду. `new` — ждёт подтверждения продавцом.
 */
export type OrderStatusCode =
  | 'new'
  | 'confirmed'
  | 'packing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'returned'

/**
 * Способы оплаты B2B-маркетплейса. Прямой оплаты обычной картой нет: покупатель
 * либо платит с баланса кошелька (который пополняет заранее), либо корпоративной
 * картой компании. Наличных и потребительских карт в модели нет.
 */
export type PaymentMethodCode = 'wallet' | 'corp_card'

export interface OrderItemRow {
  productId: string
  title: string
  image?: string | null
  sku: string
  qty: number
  price: Money
  total: Money
}

export interface OrderListItem {
  id: string
  /** Человекочитаемый номер заказа */
  number: string
  createdAt: string
  statusCode: OrderStatusCode
  customerName: string
  itemsCount: number
  total: Money
  paymentMethod: PaymentMethodCode
}

export interface OrderDetail extends OrderListItem {
  customer: {
    id: string
    name: string
    company?: string | null
    phone: string
  }
  items: OrderItemRow[]
  /** Итоги */
  subtotal: Money
  delivery: Money
  /** Комиссия маркетплейса по заказу */
  commission: Money
  /** К зачислению продавцу после удержания комиссии */
  payout: Money
  deliveryAddress: string
  deliveryType: 'courier' | 'pickup'
  /** Лента событий заказа */
  timeline: { code: OrderStatusCode, at: string }[]
  comment?: string | null
}

/* --------------------------------------------------------------------------
 * Покупатели
 * ------------------------------------------------------------------------ */

export interface CustomerListItem {
  id: string
  name: string
  /** Для B2B: компания-покупатель */
  company?: string | null
  phone: string
  ordersCount: number
  totalSpent: Money
  firstOrderAt: string
  lastOrderAt: string
}

export interface CustomerDetail extends CustomerListItem {
  email?: string | null
  /** Средний чек */
  avgCheck: Money
  recentOrders: OrderListItem[]
}

/* --------------------------------------------------------------------------
 * Финансы
 * ------------------------------------------------------------------------ */

export interface BalanceState {
  /** Доступно к выводу */
  available: Money
  /** В ожидании: заказы ещё не завершены / резерв */
  pending: Money
  /** Удержано (споры, возвраты) */
  hold: Money
  /** Всего заработано за всё время */
  lifetimeEarned: Money
}

export interface CommissionRow {
  id: string
  orderNumber: string
  date: string
  /** Сумма заказа, с которой считается комиссия */
  base: Money
  rate: number
  amount: Money
  categoryName: string
}

export interface CommissionSummary {
  /** Текущая базовая ставка, проценты */
  baseRate: number
  /** Удержано за период */
  periodTotal: Money
  rows: Paged<CommissionRow>
  /** Ставки по категориям */
  byCategory: { categoryName: string, rate: number, amount: Money }[]
}

export type PayoutStatus = 'requested' | 'processing' | 'paid' | 'rejected'

export interface PayoutRow {
  id: string
  requestedAt: string
  paidAt?: string | null
  amount: Money
  status: PayoutStatus
  /** Реквизит зачисления (маскированный счёт) */
  destination: string
}

export type TransactionType =
  | 'sale'
  | 'commission'
  | 'payout'
  | 'refund'
  | 'adjustment'

export interface TransactionRow {
  id: string
  date: string
  type: TransactionType
  /** Знак задаёт направление: + поступление, − списание */
  amount: Money
  balanceAfter: Money
  description: string
  orderNumber?: string | null
}

export interface FinanceOverview {
  balance: BalanceState
  /** Выручка и удержания за период */
  periodRevenue: Money
  periodCommission: Money
  periodPayouts: Money
  /** Последние движения */
  recentTransactions: TransactionRow[]
  /** Запланированная ближайшая выплата */
  nextPayout?: { amount: Money, date: string } | null
}

/* --------------------------------------------------------------------------
 * Документы
 * ------------------------------------------------------------------------ */

export type DocumentType = 'invoice' | 'act' | 'report' | 'contract' | 'reconciliation'

export interface DocumentRow {
  id: string
  type: DocumentType
  title: string
  /** Период, к которому относится документ */
  period: string
  date: string
  amount?: Money | null
  /** Готов / формируется / требует подписи */
  status: 'ready' | 'generating' | 'signRequired'
  /** Ссылка на скачивание (в моках — заглушка) */
  url: string
}

/* --------------------------------------------------------------------------
 * Сотрудники и доступ
 * ------------------------------------------------------------------------ */

export type EmployeeStatus = 'active' | 'invited' | 'blocked'

export interface Employee {
  id: string
  name: string
  phone: string
  email: string
  role: MerchantRole
  status: EmployeeStatus
  lastActiveAt?: string | null
}

export interface RoleDefinition {
  code: MerchantRole
  /** Разделы, к которым роль имеет доступ */
  sections: string[]
}

/* --------------------------------------------------------------------------
 * Уведомления
 * ------------------------------------------------------------------------ */

export type NotificationKind = 'order' | 'finance' | 'product' | 'system' | 'support'

export interface NotificationItem {
  id: string
  kind: NotificationKind
  title: string
  text: string
  createdAt: string
  read: boolean
  /** Куда ведёт клик */
  link?: string | null
}

/* --------------------------------------------------------------------------
 * Поддержка
 * ------------------------------------------------------------------------ */

export type TicketStatus = 'open' | 'answered' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high'

export interface TicketMessage {
  id: string
  author: 'merchant' | 'support'
  text: string
  createdAt: string
}

export interface TicketListItem {
  id: string
  number: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  updatedAt: string
  /** Последняя реплика для превью в списке */
  lastMessage: string
}

export interface TicketDetail extends TicketListItem {
  messages: TicketMessage[]
}

/* --------------------------------------------------------------------------
 * Регистрация / заявка с лендинга
 * ------------------------------------------------------------------------ */

export interface SellerApplication {
  name: string
  phone: string
  shopName: string
  legalForm: LegalForm
  category?: string
  comment?: string
}
