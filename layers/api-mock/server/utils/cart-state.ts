import { productCards } from '../../mocks/data'
import type { Id } from '#shared/types/catalog'
import type { MockEvent } from './visitor'
import { perVisitor } from './visitor'
import { can, membership, scopeId } from './org-state'

/**
 * Номер SKU в моке выводится из номера карточки — та же формула, что в
 * mocks/data.ts. Это собственный счётчик мока: у настоящего бэкенда SKU
 * приходит отдельным UUID и вычислять его неоткуда.
 */
const skuOf = (productId: Id) => Number(productId) * 10 + 1

/**
 * Состояние мок-корзины. Один источник правды для /cart, /cart/summary
 * и всех изменений — иначе счётчик в шапке и содержимое корзины расходятся.
 *
 * Корзина общая у компании (scopeId), а каждая строка — заявка конкретного
 * сотрудника: ключ строки `сотрудник|sku`. Двое заявили одну бумагу — это две
 * строки, у каждой своё имя. Закупщик (requests.approve) видит и правит все
 * строки, сотрудник — только свои. У гостя сотрудника нет: ключ `guest|sku`.
 */
interface CartLine {
  skuId: number
  quantity: number
  employeeId: string | null
}

interface CartState {
  lines: Map<string, CartLine>
  /** Снятые галочки (ключи строк): по умолчанию выбрано всё, что лежит в корзине */
  unselected: Set<string>
}

const lineKey = (employeeId: string | null, skuId: number) => `${employeeId ?? 'guest'}|${skuId}`

/** Пустое состояние; стартовые строки кладёт cartState — ему нужен вошедший пользователь */
function seed(): CartState {
  return { lines: new Map<string, CartLine>(), unselected: new Set<string>() }
}

const carts = perVisitor<CartState>(seed, 500, scopeId) // общее у всей компании, см. org-state
const seeded = new WeakSet<CartState>()

function me(event: MockEvent) {
  return membership(event)?.employee.id ?? null
}

/**
 * Демо-компания открывается с живыми заявками: бухгалтер просит бумагу и папки,
 * айтишник — мышь и клавиатуру. Закупщик сразу видит, как выглядит корзина
 * с заявками разных людей.
 */
const DEMO_REQUESTS: Array<{ fullName: string, items: Array<[string, number]> }> = [
  { fullName: 'Иванова Анна', items: [['Бумага офисная А4', 10], ['Ручки шариковые', 3], ['Папка-регистратор', 6]] },
  { fullName: 'Турсунов Жасур', items: [['Мышь проводная', 2], ['Клавиатура проводная', 2]] },
]

export function cartState(event: MockEvent) {
  const state = carts.get(event)
  if (!seeded.has(state)) {
    seeded.add(state)
    const member = membership(event)
    if (member?.state.shared) {
      for (const request of DEMO_REQUESTS) {
        const employee = member.state.employees.find(item => item.fullName === request.fullName)
        if (!employee) continue
        for (const [title, quantity] of request.items) {
          const product = productCards.find(item => item.title.startsWith(title))
          if (product) state.lines.set(lineKey(employee.id, skuOf(product.id)), { skuId: skuOf(product.id), quantity, employeeId: employee.id })
        }
      }
    }
    else {
      // Как раньше: две позиции, как на макете корзины
      const owner = me(event)
      for (const product of productCards.slice(0, 2))
        state.lines.set(lineKey(owner, skuOf(product.id)), { skuId: skuOf(product.id), quantity: 1, employeeId: owner })
    }
  }
  return state
}

/** Строки, которые видит этот пользователь: закупщику — все, остальным — свои */
function visibleLines(event: MockEvent) {
  const state = cartState(event)
  const all = [...state.lines.entries()].filter(([, line]) => line.quantity > 0)
  if (can(event, 'requests.approve')) return all
  const mine = me(event)
  return all.filter(([, line]) => line.employeeId === mine)
}

/**
 * Какие строки имеет в виду запрос: ключ строки (закупщик правит чужую заявку)
 * или номер SKU (старый контракт и свои строки).
 */
function resolve(event: MockEvent, ref: number | string): string[] {
  const visible = visibleLines(event)
  if (typeof ref === 'string' && ref.includes('|'))
    return visible.some(([key]) => key === ref) ? [ref] : []
  const skuId = Number(ref)
  const own = lineKey(me(event), skuId)
  if (visible.some(([key]) => key === own)) return [own]
  return visible.filter(([, line]) => line.skuId === skuId).map(([key]) => key)
}

export function cartEntries(event: MockEvent) {
  return visibleLines(event)
    .map(([lineId, line]) => ({
      lineId,
      skuId: line.skuId,
      quantity: line.quantity,
      employeeId: line.employeeId,
      // Идентификатор варианта — `id товара * 10 + номер варианта`.
      // Раньше искали только первый вариант через `skuOf(item.id) === skuId`
      // (которая всегда считает вариант 1), и всё остальное молча пропадало
      // из корзины: человек клал «256 ГБ», а строка не появлялась.
      product: productCards.find(item => item.id === Math.floor(line.skuId / 10)),
    }))
    .filter((entry): entry is typeof entry & { product: typeof productCards[0] } => Boolean(entry.product))
}

export function addToCart(event: MockEvent, skuId: number, quantity = 1) {
  const state = cartState(event)
  const owner = me(event)
  const key = lineKey(owner, skuId)
  const line = state.lines.get(key)
  state.lines.set(key, { skuId, quantity: (line?.quantity ?? 0) + quantity, employeeId: owner })
}

export function setQuantity(event: MockEvent, ref: number | string, quantity: number) {
  if (quantity <= 0) return removeFromCart(event, ref)
  const state = cartState(event)
  for (const key of resolve(event, ref)) state.lines.get(key)!.quantity = quantity
}

export function removeFromCart(event: MockEvent, ref: number | string) {
  const state = cartState(event)
  for (const key of resolve(event, ref)) {
    state.lines.delete(key)
    state.unselected.delete(key)
  }
}

export function setSelected(event: MockEvent, refs: Array<number | string>, selected: boolean) {
  const { unselected } = cartState(event)
  for (const key of refs.flatMap(ref => resolve(event, ref))) {
    if (selected) unselected.delete(key)
    else unselected.add(key)
  }
}

export function isSelected(event: MockEvent, lineId: string) {
  return !cartState(event).unselected.has(lineId)
}

/** Счётчик в шапке — сумма штук по выбранным и невыбранным позициям */
export function cartSummary(event: MockEvent) {
  const entries = cartEntries(event)
  const count = entries.reduce((acc, entry) => acc + entry.quantity, 0)
  const total = entries
    .filter(entry => isSelected(event, entry.lineId))
    .reduce((acc, entry) => acc + entry.product.price.amount * entry.quantity, 0)

  return { count, total: { amount: total, currency: 'UZS' as const } }
}

/** Сумма своих строк в корзине — она уже «занимает» лимит сотрудника */
export function pendingOf(event: MockEvent, employeeId: string) {
  return [...cartState(event).lines.values()]
    .filter(line => line.employeeId === employeeId)
    .reduce((acc, line) => acc + (productCards.find(item => item.id === Math.floor(line.skuId / 10))?.price.amount ?? 0) * line.quantity, 0)
}

export function resetCart(event: MockEvent) {
  carts.drop(event)
}
