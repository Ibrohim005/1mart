import type { Id, Money } from './catalog'

/**
 * Компания-покупатель и её сотрудники (B2B, решение заказчика 2026-11-12).
 *
 * Компания регистрируется через OneID или ЭЦП (E-IMZO). Кто зарегистрировал —
 * руководитель: он заводит сотрудников, даёт им роли и открывает отделам
 * категории каталога. Сотрудники кладут товары в общую корзину компании как
 * заявки, а закупщик, бухгалтер или директор одобряет и оформляет заказ.
 * Проверяет права сервер; фронт только прячет то, что недоступно.
 */

/** Права. Роль — это набор прав; готовые роли и свои роли устроены одинаково. */
export type Permission =
  /** Видит весь каталог, без ограничения категориями отдела */
  | 'catalog.all'
  /** Кладёт товары в корзину компании — это заявка от его имени */
  | 'requests.create'
  /** Видит заявки всех, правит и убирает позиции, одобряет и оформляет заказ */
  | 'requests.approve'
  /** Видит все заказы компании, а не только со своими заявками */
  | 'orders.viewAll'
  /** Баланс компании, счета на пополнение, реквизиты */
  | 'balance.manage'
  /** Сотрудники, роли, отделы и доступ к категориям */
  | 'staff.manage'

export const PERMISSIONS: Permission[] = [
  'catalog.all',
  'requests.create',
  'requests.approve',
  'orders.viewAll',
  'balance.manage',
  'staff.manage',
]

/** Готовые роли. Свои роли руководитель собирает из тех же прав. */
export type RolePreset = 'owner' | 'purchaser' | 'accountant' | 'requester'

export interface Role {
  id: Id
  /** Готовая роль; у своей роли null */
  preset: RolePreset | null
  title: string
  permissions: Permission[]
  /** Сколько сотрудников с этой ролью — роль с людьми удалить нельзя */
  employeesCount: number
}

/** Отдел и открытые ему категории каталога (слаги корневых разделов или подразделов) */
export interface Department {
  id: Id
  title: string
  categories: string[]
  employeesCount: number
}

export type EmployeeStatus = 'invited' | 'active' | 'blocked'

export interface Employee {
  id: Id
  fullName: string
  /** Он же логин: «+998 90 123-45-67» */
  phone: string
  roleId: Id
  departmentId: Id | null
  /** Категории сверх отдела — ручная правка для конкретного человека */
  extraCategories: string[]
  /** Лимит заявок в месяц; null — без лимита (по умолчанию) */
  monthlyLimit: Money | null
  /** Сколько оформлено по его заявкам в этом месяце */
  spentThisMonth: Money
  /** invited — ещё не сменил выданный пароль */
  status: EmployeeStatus
  /** Руководителя нельзя заблокировать или удалить */
  isOwner: boolean
  createdAt: string
}

/** ОКЭД — вид экономической деятельности из налогового реестра */
export interface Oked {
  code: string
  title: string
}

export interface Company {
  id: Id
  name: string
  /** ИНН, 9 цифр */
  inn: string
  oked: Oked
  director: string
  address: string
  /** Как прошла регистрация */
  registeredVia: 'oneid' | 'eimzo' | 'demo'
  /** Категории, которые подходят по ОКЭД: их предлагаем отделам и ставим первыми на главной */
  suggestedCategories: string[]
}

/** Кто я в компании и что мне можно — главный ответ для интерфейса */
export interface Access {
  company: Company
  employee: Employee
  role: Role
  /** Отдел сотрудника; null — без отдела */
  department: Pick<Department, 'id' | 'title'> | null
  permissions: Permission[]
  /** Открытые категории; null — весь каталог */
  categories: string[] | null
  /** Сколько ещё можно заявить в этом месяце; null — без лимита */
  limitLeft: Money | null
}

/** Логин и временный пароль нового сотрудника: уходят ему по SMS, руководитель может скопировать */
export interface IssuedCredentials {
  login: string
  password: string
  smsSent: boolean
}

/** Автор заявки — подпись у позиции в корзине и в заказе */
export interface Requester {
  employeeId: Id
  fullName: string
  /** Готовая роль переводится на фронте по ключу; у своей роли — её название */
  rolePreset: RolePreset | null
  roleTitle: string
  departmentTitle: string | null
}

/** Данные компании, которые пришли из OneID или из сертификата ЭЦП */
export interface CompanyCandidate {
  name: string
  inn: string
  director: string
  address: string
  oked: Oked
  suggestedCategories: string[]
}
