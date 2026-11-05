<script setup lang="ts">
/**
 * Форма товара — одна на создание и редактирование (Uzum/WB/Ozon-стиль):
 *   категория из дерева → характеристики категории → варианты (цвет/размер/
 *   память) со своей ценой и остатком → фото → описание.
 * Режим редактирования включается, когда передан `productId`: форма
 * предзаполняется из `initial` и сохраняется через PUT, иначе — POST.
 */
import type {
  CategoryAttribute,
  CategoryAttributeSchema,
  MerchantCategory,
  ProductDetail,
  ProductStatus,
  ProductVat,
  ProductVariant,
} from '#shared/types/merchant'

const props = defineProps<{
  initial?: ProductDetail | null
  productId?: string
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const api = useApi()
const toast = useToast()

const isEdit = computed(() => !!props.productId)

const { data: categories } = await useApiData<MerchantCategory[]>('m:categories', '/merchant/categories')
const cats = computed(() => categories.value ?? [])

/* ---------------------------------------------------- Дерево категорий */
const childrenOf = (pid: string | null) => cats.value.filter(c => c.parentId === pid)
const isLeaf = (id: string) => !cats.value.some(c => c.parentId === id)
const byId = (id: string) => cats.value.find(c => c.id === id)

const pickerOpen = ref(true)
const browseParent = ref<string | null>(null)
const selectedCat = ref<MerchantCategory | null>(null)

const browseItems = computed(() => childrenOf(browseParent.value))
const crumbs = computed(() => {
  const chain: MerchantCategory[] = []
  let cur = browseParent.value
  while (cur) {
    const n = byId(cur)
    if (!n) break
    chain.unshift(n)
    cur = n.parentId
  }
  return chain
})
const selectedPath = computed(() => {
  if (!selectedCat.value) return []
  const chain: MerchantCategory[] = []
  let cur: string | null = selectedCat.value.id
  while (cur) {
    const n = byId(cur)
    if (!n) break
    chain.unshift(n)
    cur = n.parentId
  }
  return chain
})

/* ---------------------------------------------------- Схема характеристик */
const schema = ref<CategoryAttributeSchema | null>(null)
const schemaLoading = ref(false)
const chars = ref<Record<string, any>>({})

function openNode(c: MerchantCategory) {
  if (isLeaf(c.id)) void selectLeaf(c)
  else browseParent.value = c.id
}

async function selectLeaf(c: MerchantCategory) {
  selectedCat.value = c
  pickerOpen.value = false
  schemaLoading.value = true
  schema.value = null
  try {
    const res = await api.get<CategoryAttributeSchema>(`/merchant/categories/${c.id}/attributes`)
    schema.value = res
    const next: Record<string, any> = {}
    for (const a of res.attributes) next[a.key] = a.type === 'multiselect' ? [] : a.type === 'boolean' ? false : ''
    chars.value = next
    axisPick.value = Object.fromEntries(res.variantAxes.map(ax => [ax.key, [] as string[]]))
    variants.value = []
  }
  catch {
    toast.show(t('m.common.loadError'), 'error')
  }
  finally {
    schemaLoading.value = false
  }
}

function reopenPicker() {
  pickerOpen.value = true
  browseParent.value = selectedCat.value?.parentId ?? null
}

/* ---------------------------------------------------- Характеристики */
function toggleMulti(key: string, value: string) {
  const arr = chars.value[key] as string[]
  const i = arr.indexOf(value)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(value)
}
function charSelectOptions(a: CategoryAttribute) {
  return [{ value: '', label: t('m.productForm.selectPlaceholder') }, ...(a.options ?? [])]
}

/* ---------------------------------------------------- Варианты */
const hasVariants = ref(false)
const axisPick = ref<Record<string, string[]>>({})

function toggleAxis(key: string, value: string) {
  const arr = axisPick.value[key] ?? (axisPick.value[key] = [])
  const i = arr.indexOf(value)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(value)
  rebuildVariants()
}

interface VariantRow {
  key: string
  options: Record<string, string>
  labels: string[]
  sku: string
  price: string
  oldPrice: string
  stock: string
  barcode: string
}
const variants = ref<VariantRow[]>([])

function axisLabel(axisKey: string, value: string) {
  const ax = schema.value?.variantAxes.find(a => a.key === axisKey)
  return ax?.options.find(o => o.value === value)?.label ?? value
}

function rebuildVariants() {
  const axes = (schema.value?.variantAxes ?? []).filter(ax => (axisPick.value[ax.key]?.length ?? 0) > 0)
  if (!axes.length) { variants.value = []; return }

  let combos: Record<string, string>[] = [{}]
  for (const ax of axes) {
    const next: Record<string, string>[] = []
    for (const combo of combos)
      for (const val of axisPick.value[ax.key]!)
        next.push({ ...combo, [ax.key]: val })
    combos = next
  }

  const prev = new Map(variants.value.map(v => [v.key, v]))
  variants.value = combos.map((options) => {
    const key = Object.entries(options).map(([k, v]) => `${k}:${v}`).join('|')
    const kept = prev.get(key)
    return kept ?? {
      key,
      options,
      labels: Object.entries(options).map(([k, v]) => axisLabel(k, v)),
      sku: '',
      price: '',
      oldPrice: '',
      stock: '',
      barcode: '',
    }
  })
}

watch(hasVariants, (on) => { if (!on) variants.value = [] })

/* ---------------------------------------------------- Простой товар / статус */
const simple = reactive({ price: '', oldPrice: '', stock: '' })
const statusValue = ref<ProductStatus>('active')
/**
 * Продавец не может сам опубликовать товар: «Активен» выставляет модерация.
 * Отсюда доступны только честные переходы из текущего статуса.
 */
const STATUS_FLOW: Record<ProductStatus, ProductStatus[]> = {
  active: ['active', 'archived'],
  draft: ['draft', 'moderation'],
  moderation: ['moderation'],
  rejected: ['rejected', 'moderation'],
  archived: ['archived', 'moderation'],
}
const statusOptions = computed(() =>
  STATUS_FLOW[props.initial?.status ?? 'draft'].map(s => ({ value: s, label: t(`m.productStatus.${s}`) })))

/* ---------------------------------------------------- Условия для компаний */
const b2b = reactive({ minOrderQty: '', vat: 'included', weightKg: '', lengthCm: '', widthCm: '', heightCm: '' })
const vatOptions = computed(() => (['included', 'excluded', 'none'] as const)
  .map(code => ({ value: code, label: t(`m.productForm.vat.${code}`) })))

/* ---------------------------------------------------- Фото */
const images = ref<string[]>([])
const MAX_PHOTOS = 8
const MAX_PHOTO_BYTES = 5 * 1024 * 1024

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function addFiles(list: FileList | null | undefined) {
  for (const file of Array.from(list ?? [])) {
    if (images.value.length >= MAX_PHOTOS) return
    if (!file.type.startsWith('image/')) { toast.show(t('m.productForm.photoType'), 'error'); continue }
    if (file.size > MAX_PHOTO_BYTES) { toast.show(t('m.productForm.photoSize'), 'error'); continue }
    images.value.push(await readFile(file))
  }
}

function onPick(event: Event) {
  const input = event.target as HTMLInputElement
  void addFiles(input.files)
  input.value = ''
}
function removePhoto(i: number) { images.value.splice(i, 1) }

/* ---------------------------------------------------- Основное */
const form = reactive({ title: '', sku: '', description: '' })

/* ---------------------------------------------------- Предзаполнение (edit) */
let prefilled = false
async function prefill() {
  const p = props.initial
  if (prefilled || !p || !cats.value.length) return
  prefilled = true
  form.title = p.title
  form.sku = p.sku
  form.description = p.description
  simple.price = String(toSum(p.price))
  simple.oldPrice = p.oldPrice ? String(toSum(p.oldPrice)) : ''
  simple.stock = String(p.stock)
  images.value = [...(p.images ?? [])]
  statusValue.value = p.status
  b2b.minOrderQty = p.minOrderQty ? String(p.minOrderQty) : ''
  b2b.vat = p.vat ?? 'included'
  b2b.weightKg = p.weightKg ? String(p.weightKg) : ''
  b2b.lengthCm = p.lengthCm ? String(p.lengthCm) : ''
  b2b.widthCm = p.widthCm ? String(p.widthCm) : ''
  b2b.heightCm = p.heightCm ? String(p.heightCm) : ''
  const cat = byId(p.categoryId)
  if (cat) {
    await selectLeaf(cat)
    mapAttributes(p.attributes)
    restoreVariants(p.variants ?? [])
  }
}
/** Варианты сохранённого товара: без этого при редактировании они молча терялись */
function restoreVariants(list: ProductVariant[]) {
  if (!list.length) return
  hasVariants.value = true
  const picked: Record<string, string[]> = {}
  for (const item of list) {
    for (const [axis, value] of Object.entries(item.options)) {
      const values = picked[axis] ?? (picked[axis] = [])
      if (!values.includes(value)) values.push(value)
    }
  }
  axisPick.value = picked
  rebuildVariants()
  for (const row of variants.value) {
    const saved = list.find(item => Object.entries(row.options).every(([axis, value]) => item.options[axis] === value))
    if (!saved) continue
    row.sku = saved.sku
    row.price = String(saved.price)
    row.oldPrice = saved.oldPrice ? String(saved.oldPrice) : ''
    row.stock = String(saved.stock)
    row.barcode = saved.barcode ?? ''
  }
}

function mapAttributes(attrs: { name: string, value: string }[]) {
  if (!schema.value) return
  for (const a of schema.value.attributes) {
    const hit = attrs.find(x => x.name === a.label)
    if (!hit) continue
    const raw = hit.value
    if (a.type === 'select') chars.value[a.key] = a.options?.find(o => o.label === raw)?.value ?? ''
    else if (a.type === 'multiselect') chars.value[a.key] = raw.split(',').map(s => s.trim()).map(lbl => a.options?.find(o => o.label === lbl)?.value).filter(Boolean)
    else if (a.type === 'number') chars.value[a.key] = a.unit ? raw.replace(a.unit, '').trim() : raw
    else if (a.type === 'boolean') chars.value[a.key] = raw === t('m.productForm.boolYes')
    else chars.value[a.key] = raw
  }
}
watch([cats, () => props.initial], () => { void prefill() }, { immediate: true })

/* ---------------------------------------------------- Готовность */
const requiredOk = computed(() => {
  if (!schema.value) return false
  return schema.value.attributes.filter(a => a.required).every((a) => {
    const v = chars.value[a.key]
    if (a.type === 'multiselect') return Array.isArray(v) && v.length > 0
    if (a.type === 'boolean') return true
    return String(v ?? '').trim() !== ''
  })
})
const priceOk = computed(() =>
  hasVariants.value
    ? variants.value.length > 0 && variants.value.every(v => Number(v.price) > 0)
    : Number(simple.price) > 0)
const nameOk = computed(() => form.title.trim().length >= 2)

const checklist = computed(() => [
  { key: 'checkCategory', done: !!selectedCat.value },
  { key: 'checkName', done: nameOk.value },
  { key: 'checkChars', done: requiredOk.value },
  { key: 'checkPrice', done: priceOk.value },
  { key: 'checkPhoto', done: images.value.length > 0 },
])

/* ---------------------------------------------------- Отправка */
const error = ref('')
const saving = ref(false)

function buildAttributes() {
  if (!schema.value) return []
  const out: { name: string, value: string }[] = []
  for (const a of schema.value.attributes) {
    const v = chars.value[a.key]
    let text = ''
    if (a.type === 'multiselect') text = (v as string[]).map(val => a.options?.find(o => o.value === val)?.label ?? val).join(', ')
    else if (a.type === 'boolean') text = v ? t('m.productForm.boolYes') : t('m.productForm.boolNo')
    else if (a.type === 'select') text = a.options?.find(o => o.value === v)?.label ?? ''
    else if (a.type === 'number') text = v ? `${v}${a.unit ? ` ${a.unit}` : ''}` : ''
    else text = String(v ?? '')
    if (text.trim()) out.push({ name: a.label, value: text })
  }
  return out
}

async function save(createStatus?: ProductStatus) {
  error.value = ''
  if (!selectedCat.value) { error.value = t('m.productForm.errCategory'); return }
  if (!nameOk.value) { error.value = t('m.productForm.errName'); return }
  if (!requiredOk.value) { error.value = t('m.productForm.errChars'); return }
  if (!priceOk.value) { error.value = t('m.productForm.errPrice'); return }

  const status: ProductStatus = isEdit.value ? statusValue.value : (createStatus ?? 'moderation')
  const payload = {
    title: form.title.trim(),
    sku: form.sku.trim(),
    categoryId: selectedCat.value.id,
    status,
    description: form.description,
    characteristics: chars.value,
    minOrderQty: Number(b2b.minOrderQty) || 1,
    vat: b2b.vat as ProductVat,
    weightKg: Number(b2b.weightKg) || null,
    lengthCm: Number(b2b.lengthCm) || null,
    widthCm: Number(b2b.widthCm) || null,
    heightCm: Number(b2b.heightCm) || null,
    attributes: buildAttributes(),
    images: images.value,
    variants: hasVariants.value
      ? variants.value.map<ProductVariant>(v => ({
          id: v.key,
          options: v.options,
          sku: v.sku,
          price: Number(v.price) || 0,
          oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
          stock: Number(v.stock) || 0,
          barcode: v.barcode,
        }))
      : [],
    price: hasVariants.value ? 0 : Number(simple.price) || 0,
    oldPrice: hasVariants.value ? null : simple.oldPrice ? Number(simple.oldPrice) : null,
    stock: hasVariants.value ? 0 : Number(simple.stock) || 0,
  }

  saving.value = true
  try {
    if (isEdit.value) await api.put(`/merchant/products/${props.productId}`, payload)
    else await api.post('/merchant/products', payload)
    toast.show(t('m.common.saved'))
    await navigateTo(localePath('/products'))
  }
  catch {
    toast.show(t('m.common.loadError'), 'error')
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="pform">
    <div class="pform__main">
      <!-- 1. Категория -->
      <MCard :title="$t('m.productForm.sectionCategory')">
        <template v-if="selectedCat && !pickerOpen">
          <div class="cat-chosen">
            <div class="cat-chosen__path">
              <span v-for="(c, i) in selectedPath" :key="c.id" class="cat-chosen__crumb">
                <span>{{ c.name }}</span>
                <UiIcon v-if="i < selectedPath.length - 1" name="alt-arrow-right" :size="14" class="cat-chosen__sep" />
              </span>
            </div>
            <div class="cat-chosen__meta">
              <MStatus tone="success">{{ $t('m.productForm.categoryLeafBadge') }}</MStatus>
              <span class="cat-chosen__comm m-tnum">{{ $t('m.productForm.commissionLabel') }}: {{ selectedCat.commissionRate }}%</span>
              <button type="button" class="cat-chosen__change" @click="reopenPicker">{{ $t('m.productForm.categoryChange') }}</button>
            </div>
          </div>
        </template>

        <template v-else>
          <p class="cat-hint">{{ $t('m.productForm.categoryHint') }}</p>
          <nav class="cat-crumbs">
            <button type="button" class="cat-crumbs__item" :class="{ 'cat-crumbs__item--active': browseParent === null }" @click="browseParent = null">
              {{ $t('m.productForm.categoryRoot') }}
            </button>
            <template v-for="c in crumbs" :key="c.id">
              <UiIcon name="alt-arrow-right" :size="14" class="cat-crumbs__sep" />
              <button type="button" class="cat-crumbs__item" @click="browseParent = c.id">{{ c.name }}</button>
            </template>
          </nav>
          <ul class="cat-list">
            <li v-for="c in browseItems" :key="c.id">
              <button type="button" class="cat-node" @click="openNode(c)">
                <span class="cat-node__name">{{ c.name }}</span>
                <span v-if="isLeaf(c.id)" class="cat-node__count m-tnum">{{ c.commissionRate }}%</span>
                <UiIcon name="alt-arrow-right" :size="16" class="cat-node__chev" :class="{ 'cat-node__chev--leaf': isLeaf(c.id) }" />
              </button>
            </li>
          </ul>
        </template>
      </MCard>

      <!-- 2. Основная информация -->
      <MCard :title="$t('m.productForm.sectionBasic')">
        <div class="pform__grid">
          <MField v-model="form.title" :label="$t('m.productForm.name')" :placeholder="$t('m.productForm.namePlaceholder')" required class="pform__full" :error="error === $t('m.productForm.errName') ? error : ''" />
          <MField v-model="form.sku" :label="$t('m.productForm.sku')" class="pform__full" />
        </div>
        <div class="pform__desc">
          <MTextarea v-model="form.description" :label="$t('m.productForm.description')" :rows="5" />
          <p class="pform__hint">{{ $t('m.productForm.descriptionHint') }}</p>
        </div>
      </MCard>

      <!-- 3. Характеристики -->
      <MCard :title="$t('m.productForm.sectionChars')">
        <MEmpty v-if="!selectedCat" :title="$t('m.productForm.charsEmpty')" icon="category-2-fill" />
        <div v-else-if="schemaLoading" class="chars-grid">
          <UiSkeleton v-for="n in 6" :key="n" height="68px" radius="14px" />
        </div>
        <template v-else-if="schema">
          <div class="chars-grid">
            <div v-for="a in schema.attributes" :key="a.key" class="chars-field" :class="{ 'chars-field--wide': a.type === 'multiselect' }">
              <span class="chars-label">
                {{ a.label }}<span v-if="a.unit">, {{ a.unit }}</span><span v-if="a.required" class="chars-req">*</span>
              </span>

              <MSelect v-if="a.type === 'select'" v-model="chars[a.key]" :options="charSelectOptions(a)" />

              <input v-else-if="a.type === 'number'" v-model="chars[a.key]" type="number" inputmode="decimal" class="chars-input m-tnum">

              <input v-else-if="a.type === 'text'" v-model="chars[a.key]" type="text" class="chars-input" :placeholder="a.hint">

              <div v-else-if="a.type === 'boolean'" class="seg">
                <button type="button" class="seg__btn" :class="{ 'seg__btn--on': chars[a.key] === true }" @click="chars[a.key] = true">{{ $t('m.productForm.boolYes') }}</button>
                <button type="button" class="seg__btn" :class="{ 'seg__btn--on': chars[a.key] === false }" @click="chars[a.key] = false">{{ $t('m.productForm.boolNo') }}</button>
              </div>

              <div v-else-if="a.type === 'multiselect'" class="chips">
                <button
                  v-for="opt in a.options" :key="opt.value" type="button"
                  class="chip" :class="{ 'chip--on': chars[a.key].includes(opt.value) }"
                  @click="toggleMulti(a.key, opt.value)"
                >{{ opt.label }}</button>
              </div>

              <span v-if="a.hint && a.type !== 'text'" class="chars-hint">{{ a.hint }}</span>
            </div>
          </div>
          <p class="chars-note">{{ $t('m.productForm.charsRequiredNote') }}</p>
        </template>
      </MCard>

      <!-- 4. Варианты и наличие -->
      <MCard :title="$t('m.productForm.sectionVariants')">
        <MEmpty v-if="!selectedCat" :title="$t('m.productForm.charsEmpty')" icon="box-fill" />
        <template v-else>
          <label v-if="schema && schema.variantAxes.length" class="vtoggle">
            <input v-model="hasVariants" type="checkbox" class="vtoggle__cb">
            <span class="vtoggle__text">
              <b>{{ $t('m.productForm.hasVariants') }}</b>
              <span>{{ $t('m.productForm.hasVariantsHint') }}</span>
            </span>
          </label>

          <div v-if="!hasVariants" class="pform__grid pform__grid--3">
            <div class="chars-field">
              <span class="chars-label">{{ $t('m.productForm.price') }}<span class="chars-req">*</span></span>
              <input v-model="simple.price" type="number" inputmode="numeric" class="chars-input m-tnum">
            </div>
            <div class="chars-field">
              <span class="chars-label">{{ $t('m.productForm.oldPrice') }}</span>
              <input v-model="simple.oldPrice" type="number" inputmode="numeric" class="chars-input m-tnum">
            </div>
            <div class="chars-field">
              <span class="chars-label">{{ $t('m.productForm.stock') }}</span>
              <input v-model="simple.stock" type="number" inputmode="numeric" class="chars-input m-tnum">
            </div>
          </div>

          <template v-else>
            <p class="chars-note">{{ $t('m.productForm.axisPickHint') }}</p>
            <div v-for="ax in schema!.variantAxes" :key="ax.key" class="vaxis">
              <span class="vaxis__label">{{ ax.label }}</span>
              <div class="chips">
                <button
                  v-for="opt in ax.options" :key="opt.value" type="button"
                  class="chip" :class="{ 'chip--on': (axisPick[ax.key] ?? []).includes(opt.value) }"
                  @click="toggleAxis(ax.key, opt.value)"
                >{{ opt.label }}</button>
              </div>
            </div>

            <MEmpty v-if="!variants.length" :title="$t('m.productForm.variantsEmpty')" icon="box-fill" />
            <div v-else class="vtable">
              <div class="vtable__head">
                <span>{{ $t('m.productForm.colVariant') }}</span>
                <span>{{ $t('m.productForm.colSku') }}</span>
                <span class="vtable__num">{{ $t('m.productForm.colPrice') }}</span>
                <span class="vtable__num">{{ $t('m.productForm.colOldPrice') }}</span>
                <span class="vtable__num">{{ $t('m.productForm.colStock') }}</span>
                <span>{{ $t('m.productForm.colBarcode') }}</span>
              </div>
              <div v-for="v in variants" :key="v.key" class="vtable__row">
                <div class="vtable__variant">
                  <span v-for="(lb, i) in v.labels" :key="i" class="vtag">{{ lb }}</span>
                </div>
                <input v-model="v.sku" type="text" class="chars-input chars-input--sm">
                <input v-model="v.price" type="number" inputmode="numeric" class="chars-input chars-input--sm m-tnum vtable__num">
                <input v-model="v.oldPrice" type="number" inputmode="numeric" class="chars-input chars-input--sm m-tnum vtable__num">
                <input v-model="v.stock" type="number" inputmode="numeric" class="chars-input chars-input--sm m-tnum vtable__num">
                <input v-model="v.barcode" type="text" class="chars-input chars-input--sm m-tnum">
              </div>
              <p class="vtable__count m-tnum">{{ $t('m.productForm.variantsCount', { count: variants.length }) }}</p>
            </div>
          </template>
        </template>
      </MCard>

      <!-- Условия для компаний -->
      <MCard :title="$t('m.productForm.sectionB2b')">
        <div class="b2b">
          <MField v-model="b2b.minOrderQty" :label="$t('m.productForm.minOrderQty')" inputmode="numeric" placeholder="1" />
          <MSelect v-model="b2b.vat" :label="$t('m.productForm.vatLabel')" :options="vatOptions" />
          <MField v-model="b2b.weightKg" :label="$t('m.productForm.weightKg')" inputmode="numeric" />
          <div class="b2b__size">
            <MField v-model="b2b.lengthCm" :label="$t('m.productForm.lengthCm')" inputmode="numeric" />
            <MField v-model="b2b.widthCm" :label="$t('m.productForm.widthCm')" inputmode="numeric" />
            <MField v-model="b2b.heightCm" :label="$t('m.productForm.heightCm')" inputmode="numeric" />
          </div>
        </div>
      </MCard>

      <!-- 5. Фото -->
      <MCard :title="$t('m.productForm.sectionMedia')">
        <p class="pform__hint">{{ $t('m.productForm.mediaHint') }}</p>
        <div class="media">
          <div v-for="(img, i) in images" :key="i" class="media__tile">
            <img :src="img" alt="" class="media__img" @error="($event.target as HTMLImageElement).style.visibility = 'hidden'">
            <span v-if="i === 0" class="media__main">{{ $t('m.productForm.photoMain') }}</span>
            <button type="button" class="media__del" :aria-label="$t('m.common.delete')" @click="removePhoto(i)">
              <UiIcon name="close" :size="14" />
            </button>
          </div>
        </div>
        <label
          v-if="images.length < MAX_PHOTOS"
          class="media__drop"
          @dragover.prevent
          @drop.prevent="addFiles($event.dataTransfer?.files)"
        >
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple class="media__file" @change="onPick">
          <UiIcon name="gallery" :size="24" />
          <span class="media__drop-title">{{ $t('m.productForm.photoAdd') }}</span>
          <span class="media__drop-note">{{ $t('m.productForm.photoDrop') }}</span>
        </label>
      </MCard>
    </div>

    <!-- Сайдбар -->
    <aside class="pform__side">
      <MCard :title="$t('m.productForm.checklist')">
        <ul class="chk">
          <li v-for="item in checklist" :key="item.key" class="chk__row" :class="{ 'chk__row--done': item.done }">
            <span class="chk__mark"><UiIcon :name="item.done ? 'tick-circle-fill' : 'tick-circle'" :size="18" /></span>
            {{ $t(`m.productForm.${item.key}`) }}
          </li>
        </ul>
      </MCard>
      <MCard>
        <div v-if="isEdit" class="pform__status">
          <MSelect v-model="statusValue" :label="$t('m.productForm.status')" :options="statusOptions" />
          <p class="pform__hint">{{ $t('m.productForm.statusHint') }}</p>
        </div>
        <p v-if="error" class="pform__err">{{ error }}</p>
        <div class="pform__actions">
          <template v-if="isEdit">
            <UiButton variant="primary" block :disabled="saving" @click="save()">{{ $t('m.common.save') }}</UiButton>
          </template>
          <template v-else>
            <UiButton variant="primary" block :disabled="saving" @click="save('moderation')">{{ $t('m.productForm.publish') }}</UiButton>
            <UiButton variant="secondary" block :disabled="saving" @click="save('draft')">{{ $t('m.productForm.saveDraft') }}</UiButton>
          </template>
        </div>
      </MCard>
    </aside>
  </div>
</template>

<style scoped>
.b2b { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.b2b__size { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

.media__drop {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  padding: 22px;
  border: 1.5px dashed var(--color-line);
  border-radius: 14px;
  text-align: center;
  color: var(--m-slate);
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease;
}

.media__drop:hover,
.media__drop:focus-within { border-color: var(--color-brand); background: var(--color-brand-tint); }
.media__file { position: absolute; width: 1px; height: 1px; opacity: 0; }
.media__drop-title { font-weight: 600; font-size: var(--text-sm); color: var(--m-ink); }
.media__drop-note { font-size: var(--text-xs); }

.pform { display: grid; grid-template-columns: 1fr 304px; gap: 20px; align-items: start; }
.pform__main { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.pform__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.pform__grid--3 { grid-template-columns: repeat(3, 1fr); }
.pform__full { grid-column: 1 / -1; }
.pform__desc { margin-top: 16px; }
.pform__hint { margin: 0 0 14px; font-size: var(--text-sm); color: var(--m-slate); }
.pform__desc .pform__hint { margin: 8px 0 0; }
.pform__side { position: sticky; top: 88px; display: flex; flex-direction: column; gap: 16px; }
.pform__status { margin-bottom: 16px; }
.pform__actions { display: flex; flex-direction: column; gap: 12px; }
.pform__err { margin: 0 0 14px; font-size: var(--text-sm); font-weight: 600; color: var(--m-danger-fg); }

.cat-hint { margin: 0 0 14px; font-size: var(--text-sm); color: var(--m-slate); }
.cat-crumbs { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin-bottom: 14px; }
.cat-crumbs__item { border: 0; background: none; padding: 4px 6px; font-size: var(--text-sm); font-weight: 600; color: var(--m-brand-strong); cursor: pointer; border-radius: var(--m-radius-sm); }
.cat-crumbs__item:hover { background: var(--m-brand-tint); }
.cat-crumbs__item--active { color: var(--m-slate); }
.cat-crumbs__sep { color: var(--m-slate-soft); }
.cat-list { display: flex; flex-direction: column; gap: 4px; margin: 0; padding: 0; list-style: none; }
.cat-node {
  display: flex; align-items: center; gap: 12px; width: 100%;
  padding: 13px 16px; border: 1px solid var(--m-line); border-radius: var(--m-radius);
  background: var(--m-surface); cursor: pointer; text-align: left;
  transition: border-color var(--m-dur-fast) var(--m-ease), background var(--m-dur-fast) var(--m-ease);
}
.cat-node:hover { border-color: var(--m-brand); background: var(--m-brand-tint); }
.cat-node__name { flex: 1; font-size: var(--text-md); font-weight: 500; color: var(--m-ink); }
.cat-node__count { font-size: var(--text-xs); font-weight: 600; color: var(--m-slate); }
.cat-node__chev { color: var(--m-slate-soft); }
.cat-node__chev--leaf { color: var(--m-brand); }

.cat-chosen { display: flex; flex-direction: column; gap: 14px; }
.cat-chosen__path { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.cat-chosen__crumb { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-base); font-weight: 600; color: var(--m-ink); }
.cat-chosen__crumb:not(:last-child) { color: var(--m-slate); font-weight: 500; }
.cat-chosen__sep { color: var(--m-slate-soft); }
.cat-chosen__meta { display: flex; align-items: center; gap: 14px; }
.cat-chosen__comm { font-size: var(--text-sm); color: var(--m-slate); }
.cat-chosen__change { margin-left: auto; border: 0; background: none; font-size: var(--text-sm); font-weight: 600; color: var(--m-brand-strong); cursor: pointer; }
.cat-chosen__change:hover { text-decoration: underline; }

.chars-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.chars-field { display: flex; flex-direction: column; gap: 7px; }
.chars-field--wide { grid-column: 1 / -1; }
.chars-label { font-size: var(--text-sm); font-weight: 500; color: var(--m-ink-soft); }
.chars-req { margin-left: 2px; color: var(--m-danger); }
.chars-hint { font-size: var(--text-xs); color: var(--m-slate); }
.chars-note { margin: 16px 0 0; font-size: var(--text-xs); color: var(--m-slate); }
.chars-input {
  width: 100%; height: var(--field-height); padding-inline: 14px;
  border: 1px solid var(--m-line-strong); border-radius: var(--m-radius);
  background: var(--m-surface); font-family: var(--font-ui); font-size: var(--text-md); color: var(--m-ink);
  outline: none; transition: border-color var(--m-dur-fast) var(--m-ease), box-shadow var(--m-dur-fast) var(--m-ease);
}
.chars-input:focus { border-color: var(--m-brand); box-shadow: var(--m-brand-ring); }
.chars-input--sm { height: 40px; padding-inline: 10px; font-size: var(--text-sm); }

.seg { display: inline-flex; gap: 4px; padding: 4px; border-radius: var(--m-radius); background: var(--m-surface-sunken); width: max-content; }
.seg__btn { height: 38px; padding-inline: 20px; border: 0; border-radius: var(--m-radius-sm); background: none; font-size: var(--text-sm); font-weight: 600; color: var(--m-slate); cursor: pointer; }
.seg__btn--on { background: var(--m-surface); color: var(--m-ink); box-shadow: var(--m-shadow-sm); }

.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  height: 36px; padding-inline: 14px; border: 1px solid var(--m-line-strong);
  border-radius: var(--m-radius-pill); background: var(--m-surface);
  font-size: var(--text-sm); font-weight: 500; color: var(--m-ink-soft); cursor: pointer;
  transition: border-color var(--m-dur-fast) var(--m-ease), background var(--m-dur-fast) var(--m-ease), color var(--m-dur-fast) var(--m-ease);
}
.chip:hover { border-color: var(--m-brand); }
.chip--on { border-color: transparent; background: var(--m-brand); color: var(--m-on-brand); }

.vtoggle { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 18px; cursor: pointer; }
.vtoggle__cb { width: 20px; height: 20px; margin-top: 2px; accent-color: var(--m-brand); flex: none; }
.vtoggle__text { display: flex; flex-direction: column; gap: 2px; }
.vtoggle__text b { font-size: var(--text-md); color: var(--m-ink); }
.vtoggle__text span { font-size: var(--text-sm); color: var(--m-slate); }
.vaxis { display: flex; flex-direction: column; gap: 9px; margin-bottom: 16px; }
.vaxis__label { font-size: var(--text-sm); font-weight: 600; color: var(--m-ink-soft); }

.vtable { margin-top: 6px; border: 1px solid var(--m-line); border-radius: var(--m-radius-lg); overflow: hidden; }
.vtable__head, .vtable__row { display: grid; grid-template-columns: 1.4fr 1.1fr 1fr 1fr 0.8fr 1.1fr; gap: 10px; align-items: center; padding: 10px 14px; }
.vtable__head { background: var(--m-surface-sunken); font-size: var(--text-2xs); font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--m-slate-soft); }
.vtable__row { border-top: 1px solid var(--m-line-soft); }
.vtable__num { text-align: right; }
.vtable__num.chars-input { text-align: left; }
.vtable__variant { display: flex; flex-wrap: wrap; gap: 4px; }
.vtag { padding: 3px 8px; border-radius: var(--m-radius-sm); background: var(--m-brand-tint); font-size: var(--text-xs); font-weight: 600; color: var(--m-brand-strong); }
.vtable__count { margin: 0; padding: 10px 14px; border-top: 1px solid var(--m-line-soft); font-size: var(--text-xs); color: var(--m-slate); background: var(--m-surface-sunken); }

.media { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; }
.media:empty { display: none; }
.media__tile { position: relative; width: 104px; height: 104px; border-radius: var(--m-radius); overflow: hidden; border: 1px solid var(--m-line); background: var(--m-surface-sunken); }
.media__img { width: 100%; height: 100%; object-fit: cover; }
.media__main { position: absolute; left: 6px; bottom: 6px; padding: 2px 8px; border-radius: var(--m-radius-pill); background: var(--m-brand); font-size: var(--text-2xs); font-weight: 600; color: var(--m-on-brand); }
.media__del { position: absolute; top: 6px; right: 6px; display: grid; width: 24px; height: 24px; border: 0; border-radius: 50%; background: var(--m-scrim); color: var(--m-on-dark); cursor: pointer; place-items: center; }
.media__del:hover { background: var(--m-danger); }
.media__add { display: flex; align-items: flex-end; gap: 10px; }
.media__url { flex: 1; }

.chk { display: flex; flex-direction: column; gap: 12px; margin: 0; padding: 0; list-style: none; }
.chk__row { display: flex; align-items: center; gap: 10px; font-size: var(--text-sm); color: var(--m-slate); }
.chk__mark { color: var(--m-line-strong); display: inline-flex; }
.chk__row--done { color: var(--m-ink-soft); }
.chk__row--done .chk__mark { color: var(--m-success); }
</style>
