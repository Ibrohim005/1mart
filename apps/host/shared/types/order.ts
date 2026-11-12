import type { Id, Money } from './catalog'
import type { CartItem } from './cart'

export type DeliveryType = 'pickupPoint' | 'courier'

/**
 * 1mart — только B2B. Компания платит с баланса на сайте, который пополняет
 * переводом со своего расчётного счёта, или корпоративной картой.
 * Личных карт, рассрочки, кредита и наличных здесь нет.
 */
export type PaymentMethod = 'balance' | 'card'

/** Платёжные системы корпоративных карт */
export type CardNetwork = 'uzcard' | 'humo' | 'visa' | 'mastercard'

/** Службы курьерской доставки, с которыми интегрирован маркетплейс */
/** spotshop — собственная курьерская служба площадки, основной способ доставки */
export type DeliveryProvider = 'spotshop' | 'express24' | 'maxsus' | 'yandex'

/**
 * Состояние денег по заказу: при оформлении средства только резервируются
 * (hold), после подтверждения продавцом уходят на его расчётный счёт,
 * при отказе возвращаются тем же способом оплаты.
 */
export type PaymentStatus = 'held' | 'charged' | 'refunded'

/** Банковские реквизиты компании или площадки */
export interface BankDetails {
  name: string
  /** 9 цифр */
  inn: string
  bank: string
  /** 5 цифр */
  mfo: string
  /** Расчётный счёт, 20 цифр */
  account: string
}

export type BalanceInvoiceStatus = 'awaiting' | 'credited'

/** Счёт на пополнение баланса */
export interface BalanceInvoice {
  id: string
  /** «1M-000102» — идёт в назначение платежа */
  number: string
  amount: Money
  status: BalanceInvoiceStatus
  /** «09.10.2026, 14:32» */
  createdAt: string
}

export interface BalanceOperation {
  id: string
  kind: 'topup' | 'payment' | 'refund'
  /** Номер счёта или заказа */
  reference: string
  orderId?: number
  /** Со знаком: списание отрицательное */
  amount: Money
  date: string
}

export interface BalanceOverview {
  available: Money
  /** Зарезервировано по заказам, которые ждут подтверждения продавца */
  reserved: Money
  company: BankDetails
  /** Куда переводить деньги */
  requisites: BankDetails
  invoices: BalanceInvoice[]
  operations: BalanceOperation[]
  /** Реквизиты тестовые, поступление перевода имитируется */
  demo: boolean
}

/** Привязанная корпоративная карта. Номер приходит уже замаскированным — полный на фронт не отдаётся */
export interface PaymentCardInfo {
  id: string
  network: CardNetwork
  /** «860049••••••4408» — максимум первые 6 и последние 4 цифры */
  maskedPan: string
  last4: string
  /** Компания, на которую выпущена карта */
  holder: string
  /** «09/27» */
  expires: string
}

export interface PickupPoint {
  id: number
  title: string
  address: string
  coords: [number, number]
  workingHours: string
  /** Через сколько дней товар будет в этом пункте */
  deliveryDays: number
}

export interface Address {
  id: number
  title: string
  city: string
  street: string
  house: string
  flat?: string
  coords?: [number, number]
  isDefault: boolean
}

export type OrderStatus =
  | 'created'
  | 'paid'
  | 'processing'
  | 'onTheWay'
  | 'readyForPickup'
  | 'delivered'
  | 'canceled'
  /* Поток 1mart (UC-FL-10): заказ ждёт продавца, деньги в резерве */
  | 'awaitingSeller'
  /** Продавец подтвердил, средства списаны — заказ «В обработке» */
  | 'confirmed'
  /** Передан в службу доставки, есть трек-номер */
  | 'handedToDelivery'
  /** А2: продавец отклонил заказ, средства возвращены */
  | 'rejectedBySeller'
  /** Покупатель оформил возврат после доставки */
  | 'returnRequested'

export interface Order {
  id: Id
  number: string
  status: OrderStatus
  createdAt: string
  items: CartItem[]
  total: Money
  deliveryType: DeliveryType
  pickupPoint?: PickupPoint
  address?: Address
  /** Ожидаемая дата доставки, ISO */
  expectedAt?: string
}

export interface CheckoutDraft {
  deliveryType: DeliveryType
  pickupPointId?: number
  addressId?: number
  paymentMethod: PaymentMethod
  /** Id корпоративной карты; у оплаты с баланса его нет */
  cardId?: string
  /** Служба доставки, если deliveryType = courier */
  provider?: DeliveryProvider
  recipientName: string
  recipientPhone: string
  comment?: string
}

/* --- Раздел «Мои заказы» --- */

export interface OrderCardItem {
  id: Id
  title: string
  image: string
  quantity: number
  price: Money
  /** Название продавца строки заказа; пустая строка — продавец скрыт от покупателя (по умолчанию) */
  seller: string
  /** Статус-плашка под названием: «В пути», «Доставлен» */
  badge?: string
  /** «Иванова А. · Бухгалтер» — кто заявил позицию; нет у заказов без заявок */
  requestedBy?: string
}

/** Отметка в истории заказа: когда он перешёл в стадию */
export interface OrderStatusEvent {
  status: OrderStatus
  /** «20.09.2026» или «20.09.2026, 14:32» */
  at: string
}

export interface OrderCard {
  id: Id
  /** «#120021» */
  number: string
  /** Превью-плитки заказа; лишние сворачиваются в «+N» */
  images: string[]
  items: OrderCardItem[]
  total: Money
  /**
   * Машинный статус — по нему рисуется дорожка и красится плашка.
   * Отдельно от `statusLabel`: подпись приходит на языке покупателя,
   * а по строке фронт не может понять, что показывать, — на узбекском
   * и английском любая проверка по русскому слову промахнётся.
   */
  status: OrderStatus
  /** Готовая подпись статуса на языке запроса */
  statusLabel: string
  /** «04.01.2024» */
  date: string
  /** Курьер или пункт выдачи — от этого зависит подпись последних шагов */
  deliveryType: DeliveryType
  /** Ожидаемая дата доставки, готовая строка: «25 сентября» */
  expectedAt?: string
  /** Кто и когда переводил заказ по стадиям */
  history?: OrderStatusEvent[]
  /** Причина отмены, если заказ отменён */
  canceledReason?: string
  /** Состояние денег: зарезервированы, списаны или возвращены */
  paymentStatus?: PaymentStatus
  /** Трек-номер службы доставки, когда заказ передан в доставку */
  tracking?: { provider?: DeliveryProvider, number: string }
  /** «Саидова Дильноза · Закупщик» — кто оформил (одобрил) заказ в компании */
  placedBy?: string
  /** «Баланс компании» или «Корпоративная карта UzCard •4408» */
  paymentMethod?: string
}

/** Данные чека (п.4.1.7.3 ТЗ): оператор, сумма, дата, замаскированный способ оплаты */
export interface PaymentReceipt {
  transactionId: string
  operator: string
  inn: string
  amount: Money
  /** «09.10.2026, 14:32» */
  date: string
  /** «Баланс компании» или корпоративная карта: «Корпоративная карта UzCard •4408» */
  paymentMethod: string
  orderNumbers: string[]
  paymentStatus: PaymentStatus
}

/**
 * Полный заказ для страницы заказа: карточка плюс детали доставки — реальные
 * данные заказа, а не заглушка (адрес, получатель, способ оплаты и контакт
 * продавца-доставщика первой строки заказа).
 */
export interface OrderDetail extends OrderCard {
  address: string
  recipient: string
  recipientPhone: string
  paymentLabel: string
  deliveryPrice: Money
  courier?: { name: string, phone: string }
  comment?: string
  /** Какие действия сейчас разрешены — решает бэкенд, а не фронт */
  actions: OrderAction[]
  /** Комиссия платежа — у 1mart 0, строку всё равно показываем */
  commission?: Money
  /** Чек платежа, если оплата уже прошла */
  receipt?: PaymentReceipt
  /** Причина возврата, если покупатель его оформил */
  returnReason?: string
}

export type OrderAction = 'cancel' | 'repeat' | 'review' | 'receipt' | 'return'

export interface AccountMenuItem {
  label: string
  to: string
  active?: boolean
}
