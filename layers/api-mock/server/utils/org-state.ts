import type { Id, Money } from '#shared/types/catalog'
import type {
  Company,
  CompanyCandidate,
  Department,
  Employee,
  Oked,
  Permission,
  Requester,
  Role,
  RolePreset,
} from '#shared/types/company'
import { PERMISSIONS } from '#shared/types/company'
import type { MockEvent } from './visitor'
import { visitorId } from './visitor'

/**
 * Компании-покупатели, сотрудники, роли и отделы.
 *
 * В отличие от корзины гостя это состояние общее на весь процесс: сотрудник
 * входит со своего компьютера, и его заявку должен увидеть закупщик в своём
 * браузере. Поэтому компании лежат в общей Map, а телефон ведёт в компанию.
 *
 * Два вида компаний:
 * - зарегистрированные (OneID / ЭЦП) и демо-компания с готовыми сотрудниками —
 *   общие, их корзина и заказы общие для всех её сотрудников;
 * - «своя» компания для любого другого телефона: заводится на посетителя, как
 *   раньше корзина. Так старый вход «любой номер, пароль от 4 символов» и тесты
 *   работают по-прежнему и не мешают друг другу.
 *
 * Мок живёт в памяти: при перезапуске dev-сервера всё, что завели руками, пропадает.
 * TODO: Connect to backend — компании, сотрудники, роли и отделы хранит бэкенд.
 */

/* ------------------------------------------------------------------ */
/* Справочник ОКЭД и данные из OneID / ЭЦП                              */
/* ------------------------------------------------------------------ */

/** Какие категории подходят виду деятельности. Бэкенд возьмёт это из своей таблицы. */
const OKED: Record<string, { title: string, categories: string[] }> = {
  '69200': {
    title: 'Деятельность в области бухгалтерского учёта и аудита',
    categories: ['bumaga-i-bloknoty', 'pismennye-prinadlezhnosti', 'kancelyarskie-melochi', 'papki-i-hranenie', 'orgtehnika', 'kompyutery-i-periferiya'],
  },
  '62010': {
    title: 'Разработка компьютерного программного обеспечения',
    categories: ['kompyutery-i-periferiya', 'orgtehnika', 'ofisnaya-mebel', 'ofisnaya-kuhnya-i-hoztovary', 'bumaga-i-bloknoty'],
  },
  '84110': {
    title: 'Деятельность органов государственного управления общего характера',
    categories: ['ofis-i-kancelyariya'],
  },
  '85310': {
    title: 'Общее среднее образование',
    categories: ['bumaga-i-bloknoty', 'pismennye-prinadlezhnosti', 'kancelyarskie-melochi', 'dlya-shkoly', 'kompyutery-i-periferiya'],
  },
}

function okedOf(code: string): Oked {
  return { code, title: OKED[code]?.title ?? code }
}

export function suggestedFor(code: string): string[] {
  return OKED[code]?.categories ?? ['ofis-i-kancelyariya']
}

/**
 * Компании из налогового реестра, где этот человек — директор. В бою их
 * отдаёт бэкенд по ПИНФЛ из OneID или по ИНН из сертификата ЭЦП.
 */
export const REGISTRY: CompanyCandidate[] = [
  {
    name: 'ООО «AUDIT CONSULT SERVICE»',
    inn: '305123456',
    director: 'Каримов Бахтиёр Рустамович',
    address: 'Ташкент, Мирабадский район, ул. Афросиаб, 12',
    oked: okedOf('69200'),
    suggestedCategories: suggestedFor('69200'),
  },
  {
    name: 'ООО «DIGITAL SOFT»',
    inn: '307654321',
    director: 'Юлдашева Нигора Алишеровна',
    address: 'Ташкент, Мирзо-Улугбекский район, ул. Буюк Ипак Йули, 154',
    oked: okedOf('62010'),
    suggestedCategories: suggestedFor('62010'),
  },
  {
    name: 'Хокимият Юнусабадского района',
    inn: '201456789',
    director: 'Рахимов Шухрат Каримович',
    address: 'Ташкент, Юнусабадский район, ул. Амира Темура, 108',
    oked: okedOf('84110'),
    suggestedCategories: suggestedFor('84110'),
  },
]

/* ------------------------------------------------------------------ */
/* Роли                                                                */
/* ------------------------------------------------------------------ */

const PRESETS: Array<{ preset: RolePreset, title: string, permissions: Permission[] }> = [
  { preset: 'owner', title: 'Руководитель', permissions: [...PERMISSIONS] },
  { preset: 'purchaser', title: 'Закупщик', permissions: ['catalog.all', 'requests.create', 'requests.approve', 'orders.viewAll'] },
  { preset: 'accountant', title: 'Бухгалтер', permissions: ['requests.create', 'requests.approve', 'orders.viewAll', 'balance.manage'] },
  { preset: 'requester', title: 'Сотрудник', permissions: ['requests.create'] },
]

/* ------------------------------------------------------------------ */
/* Хранилище                                                           */
/* ------------------------------------------------------------------ */

interface StoredRole { id: string, preset: RolePreset | null, title: string, permissions: Permission[] }
interface StoredDepartment { id: string, title: string, categories: string[] }
interface StoredEmployee {
  id: string
  fullName: string
  phone: string
  roleId: string
  departmentId: string | null
  extraCategories: string[]
  monthlyLimit: number | null
  spentThisMonth: number
  status: Employee['status']
  isOwner: boolean
  createdAt: string
}

export interface CompanyState {
  company: Company
  roles: StoredRole[]
  departments: StoredDepartment[]
  employees: StoredEmployee[]
  /** Общая или «своя» компания: от этого зависит, чья корзина и чьи заказы */
  shared: boolean
}

const companies = new Map<string, CompanyState>()
/** Телефон (9 цифр) → компания и сотрудник */
const directory = new Map<string, { companyId: string, employeeId: string }>()
/** Пароли сотрудников, которых завели в моке. Остальные номера входят по-старому. */
const passwords = new Map<string, { password: string, mustChange: boolean }>()
/** «Свои» компании посетителей: visitorId → companyId */
const personal = new Map<string, string>()

let sequence = 0
const nextId = (prefix: string) => `${prefix}-${(sequence += 1).toString(36)}`

export const digitsOf = (phone: string) => phone.replace(/\D/g, '').replace(/^998/, '')

export function formatPhone(digits: string) {
  return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`
}

function presetRoles(): StoredRole[] {
  return PRESETS.map(item => ({ id: `role-${item.preset}`, preset: item.preset, title: item.title, permissions: [...item.permissions] }))
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function createCompany(candidate: CompanyCandidate, via: Company['registeredVia'], owner: { fullName: string, phone: string }, shared: boolean): CompanyState {
  const id = nextId('company')
  const state: CompanyState = {
    company: {
      id,
      name: candidate.name,
      inn: candidate.inn,
      oked: candidate.oked,
      director: candidate.director,
      address: candidate.address,
      registeredVia: via,
      suggestedCategories: candidate.suggestedCategories,
    },
    roles: presetRoles(),
    departments: [],
    employees: [],
    shared,
  }
  const ownerId = nextId('employee')
  state.employees.push({
    id: ownerId,
    fullName: owner.fullName,
    phone: owner.phone,
    roleId: 'role-owner',
    departmentId: null,
    extraCategories: [],
    monthlyLimit: null,
    spentThisMonth: 0,
    status: 'active',
    isOwner: true,
    createdAt: today(),
  })
  companies.set(id, state)
  if (shared) directory.set(digitsOf(owner.phone), { companyId: id, employeeId: ownerId })
  return state
}

/**
 * Демо-компания с готовыми сотрудниками: под каждой ролью можно войти и пройти
 * путь заявки целиком. Пароль у всех demo1234 (см. BACKEND.md, раздел про компании).
 */
export const DEMO_PASSWORD = 'demo1234'

function seedDemo() {
  const state = createCompany(REGISTRY[0]!, 'demo', { fullName: 'Каримов Бахтиёр', phone: formatPhone('901000001') }, true)
  passwords.set('901000001', { password: DEMO_PASSWORD, mustChange: false })

  const accounting = { id: nextId('department'), title: 'Бухгалтерия', categories: ['bumaga-i-bloknoty', 'pismennye-prinadlezhnosti', 'kancelyarskie-melochi', 'papki-i-hranenie'] }
  const office = { id: nextId('department'), title: 'Администрация офиса', categories: ['ofis-i-kancelyariya'] }
  const it = { id: nextId('department'), title: 'IT-отдел', categories: ['kompyutery-i-periferiya', 'orgtehnika'] }
  state.departments.push(accounting, office, it)

  const people: Array<{ fullName: string, digits: string, preset: RolePreset, department: string | null, limit: number | null, status: Employee['status'] }> = [
    { fullName: 'Саидова Дильноза', digits: '901000002', preset: 'purchaser', department: office.id, limit: null, status: 'active' },
    { fullName: 'Иванова Анна', digits: '901000003', preset: 'accountant', department: accounting.id, limit: null, status: 'active' },
    { fullName: 'Турсунов Жасур', digits: '901000004', preset: 'requester', department: it.id, limit: 300_000_000, status: 'active' },
    { fullName: 'Мирзаева Камола', digits: '901000005', preset: 'requester', department: accounting.id, limit: null, status: 'invited' },
  ]
  for (const person of people) {
    const id = nextId('employee')
    state.employees.push({
      id,
      fullName: person.fullName,
      phone: formatPhone(person.digits),
      roleId: `role-${person.preset}`,
      departmentId: person.department,
      extraCategories: [],
      monthlyLimit: person.limit,
      spentThisMonth: 0,
      status: person.status,
      isOwner: false,
      createdAt: today(),
    })
    directory.set(person.digits, { companyId: String(state.company.id), employeeId: id })
    passwords.set(person.digits, { password: DEMO_PASSWORD, mustChange: person.status === 'invited' })
  }
}

seedDemo()

/* ------------------------------------------------------------------ */
/* Сессия                                                              */
/* ------------------------------------------------------------------ */

/**
 * Кто вошёл. Мок держит сеанс в cookie `paylov_auth` (телефон и имя), её же
 * пишет стор авторизации. Настоящий бэкенд узнаёт пользователя по токену.
 */
function sessionCookie(event: MockEvent): { phone?: string, name?: string } | null {
  const raw = getCookie(event, 'paylov_auth')
  if (!raw) return null
  try {
    return JSON.parse(raw) as { phone?: string, name?: string }
  }
  catch {
    return null
  }
}

export function sessionPhone(event: MockEvent): string | null {
  const digits = digitsOf(String(sessionCookie(event)?.phone ?? ''))
  return digits.length === 9 ? digits : null
}

/** Компания и сотрудник вошедшего. «Своя» компания заводится при первом обращении. */
export function membership(event: MockEvent): { state: CompanyState, employee: StoredEmployee } | null {
  const digits = sessionPhone(event)
  if (!digits) return null

  const known = directory.get(digits)
  if (known) {
    const state = companies.get(known.companyId)
    const employee = state?.employees.find(item => item.id === known.employeeId)
    if (state && employee) return { state, employee }
  }

  const visitor = visitorId(event)
  let companyId = personal.get(`${visitor}:${digits}`)
  if (!companyId || !companies.has(companyId)) {
    // Тот же ИНН и название, что у реквизитов баланса (balance-state): одна компания везде
    const fullName = sessionCookie(event)?.name?.trim() || 'Отакулов Ферузбек'
    const state = createCompany({
      name: 'ООО «TEST COMPANY»',
      inn: '111111111',
      director: fullName,
      address: 'Ташкент, Чиланзарский район, ул. Бунёдкор, 1',
      oked: okedOf('69200'),
      suggestedCategories: suggestedFor('69200'),
    }, 'demo', { fullName, phone: formatPhone(digits) }, false)
    companyId = String(state.company.id)
    personal.set(`${visitor}:${digits}`, companyId)
  }
  const state = companies.get(companyId)!
  return { state, employee: state.employees.find(item => item.isOwner)! }
}

/**
 * Ключ общего состояния: корзина, баланс и заказы общие у компании. У «своей»
 * компании ключ — посетитель, ровно как было до компаний: гостевая корзина
 * после входа не пропадает, а тесты в разных браузерах не видят друг друга.
 */
export function scopeId(event: MockEvent): string {
  const member = membership(event)
  return member?.state.shared ? `company:${member.state.company.id}` : visitorId(event)
}

/* ------------------------------------------------------------------ */
/* Права и доступ                                                      */
/* ------------------------------------------------------------------ */

export function roleOf(state: CompanyState, employee: StoredEmployee) {
  return state.roles.find(role => role.id === employee.roleId) ?? state.roles.find(role => role.preset === 'requester')!
}

export function permissionsOf(event: MockEvent): Permission[] {
  const member = membership(event)
  // Гость смотрит весь каталог и собирает корзину; оформить заказ его всё равно попросят войти
  if (!member) return ['catalog.all', 'requests.create', 'requests.approve']
  return roleOf(member.state, member.employee).permissions
}

export function can(event: MockEvent, permission: Permission) {
  return permissionsOf(event).includes(permission)
}

/** Открытые категории: null — весь каталог */
export function allowedCategories(event: MockEvent): string[] | null {
  const member = membership(event)
  if (!member) return null
  const role = roleOf(member.state, member.employee)
  if (role.permissions.includes('catalog.all')) return null
  const department = member.state.departments.find(item => item.id === member.employee.departmentId)
  return [...new Set([...(department?.categories ?? []), ...member.employee.extraCategories])]
}

/** Подходит ли товар под открытые категории: слаг раздела или подраздела */
export function isAllowed(allowed: string[] | null, facets: { categorySlug?: string, subcategorySlug?: string } | undefined) {
  if (!allowed) return true
  return allowed.includes(facets?.categorySlug ?? '') || allowed.includes(facets?.subcategorySlug ?? '')
}

/* ------------------------------------------------------------------ */
/* Представление для API                                               */
/* ------------------------------------------------------------------ */

const money = (amount: number): Money => ({ amount, currency: 'UZS' })

export function viewRole(state: CompanyState, role: StoredRole): Role {
  return { ...role, permissions: [...role.permissions], employeesCount: state.employees.filter(item => item.roleId === role.id).length }
}

export function viewDepartment(state: CompanyState, department: StoredDepartment): Department {
  return { ...department, categories: [...department.categories], employeesCount: state.employees.filter(item => item.departmentId === department.id).length }
}

export function viewEmployee(employee: StoredEmployee): Employee {
  return {
    ...employee,
    extraCategories: [...employee.extraCategories],
    monthlyLimit: employee.monthlyLimit === null ? null : money(employee.monthlyLimit),
    spentThisMonth: money(employee.spentThisMonth),
  }
}

export function requesterOf(state: CompanyState, employee: StoredEmployee): Requester {
  const role = roleOf(state, employee)
  return {
    employeeId: employee.id,
    fullName: employee.fullName,
    rolePreset: role.preset,
    roleTitle: role.title,
    departmentTitle: state.departments.find(item => item.id === employee.departmentId)?.title ?? null,
  }
}

/* ------------------------------------------------------------------ */
/* Изменения                                                           */
/* ------------------------------------------------------------------ */

export function findCompany(id: Id) {
  return companies.get(String(id)) ?? null
}

export function companyByInn(inn: string) {
  return [...companies.values()].find(state => state.shared && state.company.inn === inn) ?? null
}

export function isInnTaken(inn: string) {
  return [...companies.values()].some(state => state.shared && state.company.inn === inn)
}

export function isPhoneTaken(digits: string) {
  return directory.has(digits)
}

export function registerCompany(candidate: CompanyCandidate, via: 'oneid' | 'eimzo', owner: { fullName: string, phone: string }, password: string) {
  const state = createCompany(candidate, via, owner, true)
  passwords.set(digitsOf(owner.phone), { password, mustChange: false })
  return state
}

/** Временный пароль: 8 символов без похожих букв, чтобы его можно было продиктовать */
export function temporaryPassword() {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

export function addEmployee(state: CompanyState, input: Omit<StoredEmployee, 'id' | 'spentThisMonth' | 'status' | 'isOwner' | 'createdAt'>) {
  const employee: StoredEmployee = { ...input, id: nextId('employee'), spentThisMonth: 0, status: 'invited', isOwner: false, createdAt: today() }
  state.employees.push(employee)
  const digits = digitsOf(employee.phone)
  directory.set(digits, { companyId: String(state.company.id), employeeId: employee.id })
  const password = temporaryPassword()
  passwords.set(digits, { password, mustChange: true })
  return { employee, password }
}

export function resetPassword(employee: StoredEmployee) {
  const password = temporaryPassword()
  passwords.set(digitsOf(employee.phone), { password, mustChange: true })
  if (employee.status === 'active') employee.status = 'invited'
  return password
}

export function removeEmployee(state: CompanyState, employee: StoredEmployee) {
  state.employees = state.employees.filter(item => item.id !== employee.id)
  directory.delete(digitsOf(employee.phone))
  passwords.delete(digitsOf(employee.phone))
}

/** Проверка пароля. Номер, которого нет в справочнике, входит по-старому — любым паролем от 4 символов. */
export function checkPassword(digits: string, password: string): 'ok' | 'wrong' | 'blocked' | 'unknown' {
  const known = directory.get(digits)
  const stored = passwords.get(digits)
  if (!known || !stored) return 'unknown'
  const employee = companies.get(known.companyId)?.employees.find(item => item.id === known.employeeId)
  if (employee?.status === 'blocked') return 'blocked'
  return stored.password === password ? 'ok' : 'wrong'
}

export function mustChangePassword(digits: string) {
  return passwords.get(digits)?.mustChange ?? false
}

export function changePassword(digits: string, password: string) {
  passwords.set(digits, { password, mustChange: false })
  const known = directory.get(digits)
  const employee = known ? companies.get(known.companyId)?.employees.find(item => item.id === known.employeeId) : null
  if (employee && employee.status === 'invited') employee.status = 'active'
}

export function nameOf(digits: string) {
  const known = directory.get(digits)
  return known ? companies.get(known.companyId)?.employees.find(item => item.id === known.employeeId)?.fullName ?? null : null
}

export function newRoleId() {
  return nextId('role')
}

export function newDepartmentId() {
  return nextId('department')
}

/** Заказ оформлен: суммы позиций идут в «потрачено за месяц» их авторов */
export function addSpent(state: CompanyState, byEmployee: Map<string, number>) {
  for (const [employeeId, amount] of byEmployee) {
    const employee = state.employees.find(item => item.id === employeeId)
    if (employee) employee.spentThisMonth += amount
  }
}
