/**
 * Сверяет словари всех языков с русским: одинаковый ли набор ключей и сколько
 * строк ещё ждут перевода (значение совпадает с исходным слово в слово).
 *
 * Русский — источник: на нём написан интерфейс, остальные языки догоняют.
 * Для каждого языка пишется свой TODO-файл — его можно отдать переводчику
 * или системе перевода как есть.
 *
 * Запуск: npm run i18n:todo
 */
import { readFileSync, writeFileSync } from 'node:fs'

const dir = new URL('../apps/host/i18n/locales/', import.meta.url)
const read = name => JSON.parse(readFileSync(new URL(`${name}.json`, dir), 'utf8'))

/** Язык-источник и все остальные */
const SOURCE = 'ru'
const TARGETS = ['uz', 'uz-cyrl', 'en', 'kaa']

function flatten(node, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === 'object') flatten(value, `${prefix}${key}.`, out)
    else out[`${prefix}${key}`] = value
  }
  return out
}

const source = flatten(read(SOURCE))
const total = Object.keys(source).length
let broken = false

console.log(`Ключей в ${SOURCE}.json: ${total}\n`)

for (const name of TARGETS) {
  const target = flatten(read(name))

  const missing = Object.keys(source).filter(key => !(key in target))
  const extra = Object.keys(target).filter(key => !(key in source))
  const todo = Object.keys(source).filter(key => target[key] === source[key])

  if (missing.length) {
    broken = true
    console.log(`  ${name}: нет ${missing.length} ключей — ${missing.slice(0, 5).join(', ')}…`)
  }
  if (extra.length) {
    broken = true
    console.log(`  ${name}: лишние ${extra.length} — ${extra.slice(0, 5).join(', ')}…`)
  }

  const done = total - todo.length
  const percent = Math.round((done / total) * 100)
  console.log(`  ${name.padEnd(8)} переведено ${done}/${total} (${percent}%), ждут перевода ${todo.length}`)

  if (todo.length) {
    const file = new URL(`TODO-${name}.md`, new URL('../apps/host/i18n/', import.meta.url))
    const rows = todo.map(key => `| \`${key}\` | ${String(source[key]).replace(/\|/g, '\\|')} |  |`)
    writeFileSync(file, [
      `# Ждут перевода на ${name} — ${todo.length} строк`,
      '',
      'Третья колонка пустая: впишите перевод и перенесите в словарь.',
      '',
      '| Ключ | Русский | Перевод |',
      '|---|---|---|',
      ...rows,
      '',
    ].join('\n'))
  }
}

console.log('\nСписки — apps/host/i18n/TODO-<язык>.md')
process.exit(broken ? 1 : 0)
