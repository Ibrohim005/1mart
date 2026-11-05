/**
 * Выгрузка иконок из Figma 1mart (страница Icon, node 9-21) в набор проекта.
 * Это единственный законный способ добавить иконку: см. раздел Icons в CLAUDE.md.
 *
 * FIGMA_TOKEN=... node scripts/export-figma-icons.mjs wallet wallet-fill truck
 *
 * Суффикс -fill значит стиль bold, без суффикса стиль linear. Имена social-telegram и подобные
 * берутся из компонента Social icon. Токен в репозиторий не кладём.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'

const FILE = 'ieFHxM11OwkuX1vgaFFUvl'
const PAGE = '9:21'
const ICONS = 'layers/shared/app/assets/icons'
const MANIFEST = 'layers/shared/app/assets/icons.figma.json'

const token = process.env.FIGMA_TOKEN
if (!token) throw new Error('FIGMA_TOKEN is required')
const headers = { 'X-Figma-Token': token }

async function api(path) {
  const res = await fetch(`https://api.figma.com/v1/${path}`, { headers })
  if (!res.ok) throw new Error(`Figma ${res.status} on ${path}`)
  return res.json()
}

/** Собирает все наборы и варианты страницы: имя → { linear, bold }. */
function collect(node, out = {}) {
  if (node.type === 'COMPONENT_SET') {
    const variants = {}
    for (const child of node.children ?? []) {
      // В файле встречаются «linier» и второе свойство: «Property 1=bold, Property 2=group».
      const style = child.name.match(/Property 1=([a-z]+)/i)?.[1].toLowerCase().replace('linier', 'linear')
      if (style) variants[style] = child.id
    }
    out[node.name.trim()] = variants
    return out
  }
  if (node.type === 'COMPONENT') {
    // Второе семейство: «Linear / Arrows / Alt Arrow Down» → alt-arrow-down. Только linear.
    const parts = node.name.split('/').map(part => part.trim())
    const name = parts.length >= 3 ? parts.slice(2).join(' ').toLowerCase().replace(/\s+/g, '-') : node.name.trim()
    out[name] ??= { linear: node.id }
    return out
  }
  for (const child of node.children ?? []) collect(child, out)
  return out
}

/** Одноцветные иконки красятся через currentColor, многоцветные остаются как есть. */
function normalize(svg) {
  const colors = new Set([...svg.matchAll(/(?:fill|stroke)="(#[0-9A-Fa-f]{3,8}|black|white)"/g)].map(m => m[1].toLowerCase()))
  if (colors.size > 1) return svg
  return svg.replace(/(fill|stroke)="(#[0-9A-Fa-f]{3,8}|black|white)"/g, '$1="currentColor"')
}

const names = process.argv.slice(2)
if (!names.length) throw new Error('Pass icon names to export')

const tree = await api(`files/${FILE}/nodes?ids=${encodeURIComponent(PAGE)}&depth=6`)
const library = collect(tree.nodes[PAGE].document)
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
mkdirSync(ICONS, { recursive: true })

// Соцсети живут в отдельном компоненте Social icon (node 11-52334), стиль White на тёмном подвале.
const SOCIAL_SET = '11:52334'
const socialTree = await api(`files/${FILE}/nodes?ids=${encodeURIComponent(SOCIAL_SET)}&depth=1`)
const socials = {}
for (const child of socialTree.nodes[SOCIAL_SET].document.children ?? []) {
  const props = Object.fromEntries(child.name.split(',').map(part => part.trim().split('=')))
  if (props.State === 'Default' && props.Style === 'White') socials[`social-${props.Platform.toLowerCase()}`] = child.id
}

// Решение владельца: в рейтинге чистая звезда «Linear / Like / Star» вместо star со штрихами.
// В Figma она только контурная, поэтому star-fill это та же форма, залитая цветом.
const OWNER_CHOICE = { 'star': '9:5307', 'star-fill': '9:5307' }

const wanted = []
const missing = []
for (const name of names) {
  if (OWNER_CHOICE[name]) {
    wanted.push({ name, id: OWNER_CHOICE[name] })
    continue
  }
  if (socials[name]) {
    wanted.push({ name, id: socials[name] })
    continue
  }
  const bold = name.endsWith('-fill')
  const variants = library[name.replace(/-fill$/, '')]
  const id = variants?.[bold ? 'bold' : 'linear']
  if (id) wanted.push({ name, id })
  else missing.push(name)
}

for (let i = 0; i < wanted.length; i += 80) {
  const batch = wanted.slice(i, i + 80)
  const { images } = await api(`images/${FILE}?format=svg&ids=${encodeURIComponent(batch.map(b => b.id).join(','))}`)
  for (const { name, id } of batch) {
    const res = await fetch(images[id])
    let svg = normalize(await res.text())
    if (name === 'star-fill') svg = svg.replace(/<path\b(?![^>]*fill="currentColor")/g, '<path fill="currentColor"')
    writeFileSync(`${ICONS}/${name}.svg`, svg)
    manifest[name] = id
  }
}

writeFileSync(MANIFEST, `${JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2)}\n`)
console.log(`exported ${wanted.length}`)
if (missing.length) console.log(`NOT IN FIGMA: ${missing.join(' ')}`)
