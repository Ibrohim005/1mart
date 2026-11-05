/**
 * Проверка набора иконок: каждое имя, на которое ссылается разметка,
 * должно существовать файлом. UiIcon при промахе молча рисует пустоту —
 * так уже терялись иконки сортировки и настроек.
 *
 * Запуск: node tests/icons.test.mjs
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ICONS = 'layers/shared/app/assets/icons'
const have = new Set(readdirSync(ICONS).filter(f => f.endsWith('.svg')).map(f => f.replace('.svg', '')))

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(path)
    return /\.(vue|ts)$/.test(entry.name) ? [path] : []
  })
}

const used = new Map()
for (const file of [...walk('layers'), ...walk('apps')]) {
  const source = readFileSync(file, 'utf8')

  for (const tag of source.match(/<UiIcon\b[^>]*?>/gs) ?? []) {
    // Только статическое name=, но не :name= — там лежит переменная,
    // и сканер принимал её за имя иконки («step» в OrderPlaced.vue)
    for (const [, name] of tag.matchAll(/(?<![:\w])name="([a-z0-9-]+)"/g)) add(name, file)

    const dynamic = tag.match(/:name="([^"]+)"/)
    if (!dynamic) continue
    // Внутри выражения берём только строковые литералы, но не сравнения вида kind === 'success'
    const expression = dynamic[1].replace(/[!=]==?\s*'[a-z0-9-]+'/g, '')
    for (const [, literal] of expression.matchAll(/'([a-z0-9-]+)'/g)) add(literal, file)
  }

  for (const [, name] of source.matchAll(/\bicon: '([a-z0-9-]+)'/g)) add(name, file)
}

function add(name, file) {
  if (!used.has(name)) used.set(name, new Set())
  used.get(name).add(file)
}

const missing = [...used].filter(([name]) => !have.has(name) && !['return', 'seal-check'].includes(name))

// Жёсткое правило владельца: только иконки из Figma 1mart (см. раздел Icons в CLAUDE.md).
const manifest = JSON.parse(readFileSync('layers/shared/app/assets/icons.figma.json', 'utf8'))
// Не иконки: флаги языков в шапке и ключи API, которые InfoCard сопоставляет с иконками Figma.
const NOT_ICONS = new Set(['flag-ru', 'flag-uz', 'flag-en', 'flag-kaa'])
const API_KEYS = new Set(['return', 'seal-check'])
const allowed = name => manifest[name] || NOT_ICONS.has(name)
const foreign = [...used].filter(([name]) => !allowed(name) && !API_KEYS.has(name))
const extraFiles = [...have].filter(name => !allowed(name))

// Иконки, нарисованные прямо в шаблоне, запрещены. Исключения: график и сам UiIcon.
const INLINE_ALLOWED = /(?:MBarChart|ui\/Icon)\.vue$/
const inline = [...walk('layers'), ...walk('apps')]
  .filter(file => file.endsWith('.vue') && !INLINE_ALLOWED.test(file))
  .filter(file => /<svg[\s>]/.test(readFileSync(file, 'utf8').replace(/<style[\s\S]*?<\/style>/g, '')))

const problems = [
  ['Иконок нет на диске', missing.map(([name, files]) => `${name} -> ${[...files].join(', ')}`)],
  ['Иконок нет в Figma 1mart', foreign.map(([name, files]) => `${name} -> ${[...files].join(', ')}`)],
  ['Лишние файлы в наборе, не из Figma', extraFiles],
  ['Svg нарисован прямо в шаблоне, используй UiIcon', inline],
].filter(([, items]) => items.length)

if (problems.length) {
  for (const [title, items] of problems) {
    console.error(`${title}: ${items.length}`)
    for (const item of items) console.error(`  ${item}`)
  }
  process.exit(1)
}

console.log(`Иконки в порядке: ${used.size} ссылок, все из Figma 1mart`)
