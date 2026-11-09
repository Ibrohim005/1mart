<script setup lang="ts">
/**
 * Шапка 1mart. Раскладка как у Uzum Market — три ряда:
 *
 *  1. служебная строка 36px: город, пункты выдачи, ссылки для продавцов,
 *     вопрос-ответ, заказы и выбор языка. При прокрутке уезжает вверх;
 *  2. основная полоса 76px: логотип, «Каталог», поиск с кнопкой,
 *     «Войти» / «Избранное» / «Корзина» иконкой с подписью;
 *  3. строка корневых категорий 44px и «Ещё», открывающее каталог.
 *
 * Ряды 2 и 3 залипают — их сумма и есть `--header-height` (tokens.css),
 * от которой отсчитываются липкие боковые колонки страниц.
 */
import type { Category, ProductCard } from '#shared/types/catalog'
import type { BalanceOverview } from '#shared/types/order'
import iconFlagRu from '@zoo/shared/app/assets/icons/flag-ru.svg'
import iconFlagUz from '@zoo/shared/app/assets/icons/flag-uz.svg'
import iconFlagEn from '@zoo/shared/app/assets/icons/flag-en.svg'
import iconFlagKaa from '@zoo/shared/app/assets/icons/flag-kaa.svg'

const localePath = useLocalePath()
const { sellerCabinetUrl } = useRuntimeConfig().public
// Выбранный адрес доставки: один на шапку и оформление, берётся из cookie
const { choice: deliveryAddress } = useDeliveryAddress()
const router = useRouter()
const cart = useCartStore()
const { t, locale, locales, setLocale } = useI18n()
const api = useApi()

/**
 * Счётчик в шапке должен быть сразу — иначе бейдж не появляется.
 * Ошибку гасим: шапка есть на каждой странице, и падение корзины
 * роняло весь сайт в 404 вместо того, чтобы просто скрыть бейдж.
 */
try {
  await cart.loadSummary()
}
catch {
  // бейджа не будет, остальной сайт работает
}

/*
 * Корневые категории для строки под поиском. Ключ общий с выпадающим
 * каталогом — второй запрос не уходит. Ошибка useAsyncData не бросается:
 * без категорий строка просто пустая, а шапка работает.
 */
const { data: rootCategories } = await useApiData<Category[]>('catalog-menu', '/categories/root')
/** Сводная «Все» в моках приходит обычной категорией — в строке она лишняя */
const stripCategories = computed(() => (rootCategories.value ?? []).filter(item => item.slug !== 'vse').slice(0, 10))

// Гостю показываем диалог входа — экран SIng из макета
const auth = useAuthStore()

// Гость, которого увели из кабинета, приходит с ?auth=1 — открываем вход
onMounted(() => {
  if (router.currentRoute.value.query.auth === '1') {
    auth.isAuthOpen = true
    router.replace({ query: { ...router.currentRoute.value.query, auth: undefined } })
  }
})

/**
 * Регистрация и восстановление пароля. Сеть живёт в сторе: диалоги остаются
 * вёрсткой, а шапка только раскладывает текст ошибки обратно по диалогам.
 *
 * Показывать ошибку обязательно: закрытое или просто застывшее окно без
 * объяснения читается как «получилось», хотя ни регистрация, ни смена
 * пароля не состоялись. Раньше отказ бэкенда молча уводил на другой экран.
 */
const authModal = useTemplateRef<{ fail: (message: string) => void }>('authModal')
const registerModal = useTemplateRef<{ fail: (message: string) => void }>('registerModal')
const recoverModal = useTemplateRef<{ fail: (message: string) => void }>('recoverModal')
const smsModal = useTemplateRef<{ fail: (message: string) => void }>('smsModal')
const newPasswordModal = useTemplateRef<{ fail: (message: string) => void }>('newPasswordModal')

async function signIn(credentials: { phone: string, password: string }) {
  const error = await auth.signIn(credentials.phone, credentials.password)
  if (error) authModal.value?.fail(error)
}

async function register(credentials: { phone: string, password: string, name: string }) {
  const error = await auth.register(credentials.phone, credentials.password, credentials.name)
  if (error) registerModal.value?.fail(error)
}

/**
 * Незарегистрированный номер больше не перекидывает на регистрацию молча:
 * бэкенд отвечает одним и тем же 400 и на «такого номера нет», и на
 * превышенный лимит отправок, — в этих случаях увод на регистрацию был бы
 * прямой ложью. Показываем его текст, а перейти к регистрации диалог и так
 * предлагает ссылкой.
 */
async function requestCode(phone: string) {
  const error = await auth.requestRecovery(phone)
  if (error) recoverModal.value?.fail(error)
}

async function confirmCode(code: string) {
  const error = await auth.confirmCode(code)
  if (error) smsModal.value?.fail(error)
}

async function resendCode() {
  const error = await auth.resendCode()
  if (error) smsModal.value?.fail(error)
}

async function savePassword(password: string) {
  const error = await auth.finishRecovery(password)
  if (error) newPasswordModal.value?.fail(error)
}

// Меню профиля показываем только вошедшему
const isProfileOpen = ref(false)
const profileRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLElement | null>(null)

/** Меню профиля, языки и подсказки закрываются по Esc и клику вне — как остальные оверлеи */
onMounted(() => {
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return
    isProfileOpen.value = false
    isLangOpen.value = false
    isSuggestOpen.value = false
  }
  const onPointer = (event: PointerEvent) => {
    if (isProfileOpen.value && !profileRef.value?.contains(event.target as Node))
      isProfileOpen.value = false
    if (isLangOpen.value && !langRef.value?.contains(event.target as Node))
      isLangOpen.value = false
    if (isSuggestOpen.value && !searchRef.value?.contains(event.target as Node))
      isSuggestOpen.value = false
  }
  document.addEventListener('keydown', onKey)
  document.addEventListener('pointerdown', onPointer, true)
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('pointerdown', onPointer, true)
  })
})
const isCatalogOpen = ref(false)

/*
 * Каталог открывается и наведением на строку разделов. Задержка не даёт панели
 * мигать, когда мышь просто проходит через строку, а закрытие с задержкой
 * прощает короткий выход за край. Клик по «Каталог» закрепляет панель: такая
 * закрывается только явно.
 */
const catalogRootSlug = ref<string | null>(null)
const isCatalogHoverOpen = ref(false)
let catalogOpenTimer: ReturnType<typeof setTimeout> | undefined
let catalogCloseTimer: ReturnType<typeof setTimeout> | undefined

function closeCatalog() {
  clearTimeout(catalogOpenTimer)
  clearTimeout(catalogCloseTimer)
  isCatalogOpen.value = false
  isCatalogHoverOpen.value = false
  catalogRootSlug.value = null
}

function toggleCatalog() {
  clearTimeout(catalogOpenTimer)
  clearTimeout(catalogCloseTimer)
  if (isCatalogOpen.value && isCatalogHoverOpen.value) {
    isCatalogHoverOpen.value = false
    return
  }
  if (isCatalogOpen.value) closeCatalog()
  else isCatalogOpen.value = true
}

function hoverCategory(slug: string) {
  clearTimeout(catalogOpenTimer)
  clearTimeout(catalogCloseTimer)
  catalogOpenTimer = setTimeout(() => {
    catalogRootSlug.value = slug
    if (isCatalogOpen.value) return
    isCatalogHoverOpen.value = true
    isCatalogOpen.value = true
  }, isCatalogOpen.value ? 60 : 160)
}

function leaveCatalogArea() {
  clearTimeout(catalogOpenTimer)
  if (!isCatalogHoverOpen.value) return
  clearTimeout(catalogCloseTimer)
  catalogCloseTimer = setTimeout(closeCatalog, 220)
}

function keepCatalog() {
  clearTimeout(catalogCloseTimer)
}

/*
 * Меню профиля тоже открывается наведением. Клик по открытому так меню его
 * закрепляет, а не закрывает: иначе наведение и клик гасили бы друг друга.
 */
const isProfileHoverOpen = ref(false)
let profileCloseTimer: ReturnType<typeof setTimeout> | undefined

function hoverProfile() {
  clearTimeout(profileCloseTimer)
  if (!auth.isLoggedIn || isProfileOpen.value) return
  isProfileHoverOpen.value = true
  isProfileOpen.value = true
}

function leaveProfile() {
  if (!isProfileHoverOpen.value) return
  clearTimeout(profileCloseTimer)
  profileCloseTimer = setTimeout(() => { isProfileOpen.value = false }, 220)
}

function clickProfile() {
  if (!auth.isLoggedIn) {
    auth.isAuthOpen = true
    return
  }
  clearTimeout(profileCloseTimer)
  if (isProfileHoverOpen.value) isProfileHoverOpen.value = false
  else isProfileOpen.value = !isProfileOpen.value
}

/*
 * Баланс компании в меню профиля. Только в браузере и только при открытии:
 * страницы кэшируются, и сумма в SSR-разметке досталась бы чужому посетителю.
 * Ошибку гасим: без блока баланса меню работает.
 */
const profileBalance = ref<BalanceOverview | null>(null)
const isBalanceLoading = ref(false)
const { money } = useMoney()

watch(isProfileOpen, async (open) => {
  if (!open) {
    isProfileHoverOpen.value = false
    return
  }
  isBalanceLoading.value = !profileBalance.value
  try {
    profileBalance.value = await api.get<BalanceOverview>('/balance')
  }
  catch {
    profileBalance.value = null
  }
  finally {
    isBalanceLoading.value = false
  }
})

onBeforeUnmount(() => {
  clearTimeout(catalogOpenTimer)
  clearTimeout(catalogCloseTimer)
  clearTimeout(profileCloseTimer)
})

const isLocationOpen = ref(false)
/** Из выбора адреса можно уйти в добавление нового — с картой и полями */
const isAddressFormOpen = ref(false)

/*
 * Введённый адрес надо сохранить. Здесь стояло `@submit="isAddressFormOpen =
 * false"`: форма отдавала заполненные поля, шапка их выбрасывала и просто
 * закрывала окно. Человек заводил адрес, возвращался к выбору — список
 * по-прежнему пуст. На оформлении та же форма работала как надо, и из-за
 * этого казалось, что логики нет вовсе.
 */
const { saveAddress } = useDeliveryAddress()
const addressToast = useToast()

async function addAddress(details: AddressDetails) {
  try {
    await saveAddress(details)
    isAddressFormOpen.value = false
    // Возвращаем к выбору: адрес уже в списке и уже отмечен
    isLocationOpen.value = true
  }
  catch {
    addressToast.show(t('ui.checkout.checkout.addressSaveError'), 'error')
  }
}

// Поиск ведёт на /search?q=… — там же работают сортировка и фильтры
const route = useRoute()

/** Запрос возвращаем в поле: на /search?q=… оно оставалось пустым */
const query = ref(String(route.query.q ?? ''))
watch(() => route.query.q, value => (query.value = String(value ?? '')))

/*
 * Подсказки под полем: GET /search/suggestions?q= (прощает опечатку и
 * забытую раскладку так же, как сама выдача). Запрос с задержкой, а ответ
 * на устаревший ввод отбрасываем — иначе медленный ответ на «и» перекрывал
 * подсказки по уже набранному «iphone».
 */
const suggestions = ref<ProductCard[]>([])
const isSuggestOpen = ref(false)
const activeSuggestion = ref(-1)
let suggestTimer: ReturnType<typeof setTimeout> | undefined
let suggestTicket = 0

function loadSuggestions() {
  clearTimeout(suggestTimer)
  const q = query.value.trim()
  if (q.length < 2) {
    suggestions.value = []
    isSuggestOpen.value = false
    return
  }
  suggestTimer = setTimeout(async () => {
    const ticket = ++suggestTicket
    try {
      const found = await api.get<ProductCard[]>('/search/suggestions', { q })
      if (ticket !== suggestTicket) return
      suggestions.value = (found ?? []).slice(0, 8)
      activeSuggestion.value = -1
      isSuggestOpen.value = suggestions.value.length > 0
    }
    catch {
      // Подсказки — удобство, а не функция: без них поиск работает
      if (ticket === suggestTicket) isSuggestOpen.value = false
    }
  }, 200)
}

onBeforeUnmount(() => clearTimeout(suggestTimer))

/**
 * Крестик в поле поиска чистит текст, но не отправляет форму: человек видел
 * пустое поле и прежнюю выдачу по удалённому запросу. Пустое поле на странице
 * поиска означает «показать всё» — уводим туда сразу.
 */
function onSearchInput() {
  loadSuggestions()
  if (query.value.trim()) return
  if (!route.path.includes('/search')) return
  router.replace(localePath('/search'))
}

function onSearchKey(event: KeyboardEvent) {
  if (!isSuggestOpen.value || !suggestions.value.length) return
  const total = suggestions.value.length
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeSuggestion.value = (activeSuggestion.value + 1) % total
  }
  else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeSuggestion.value = (activeSuggestion.value - 1 + total) % total
  }
}

function submitSearch() {
  // Enter на выделенной стрелками подсказке открывает сам товар
  const picked = isSuggestOpen.value && activeSuggestion.value >= 0
    ? suggestions.value[activeSuggestion.value]
    : undefined
  isSuggestOpen.value = false
  activeSuggestion.value = -1
  clearTimeout(suggestTimer)
  suggestTicket++
  if (picked) {
    router.push(localePath(`/product/${picked.slug}`))
    return
  }
  const q = query.value.trim()
  const base = localePath('/search')
  router.push(q ? `${base}?q=${encodeURIComponent(q)}` : base)
}

/**
 * Переключатель языка. Языков пять, поэтому перебор по кругу не годится —
 * до нужного пришлось бы кликать четыре раза. Вместо него список.
 */
const FLAGS: Record<string, string> = {
  'ru': iconFlagRu,
  'uz': iconFlagUz,
  // Кириллический узбекский — тот же язык и та же страна, флаг общий
  'uz-cyrl': iconFlagUz,
  'en': iconFlagEn,
  'kaa': iconFlagKaa,
}

/** Короткая подпись на кнопке: у двух узбекских она должна различаться */
const LABELS: Record<string, string> = {
  'ru': 'RU',
  'uz': 'UZ',
  'uz-cyrl': 'ЎЗ',
  'en': 'EN',
  'kaa': 'QQ',
}

type LocaleCode = typeof locale.value
interface LocaleOption { code: LocaleCode, name: string, flag: string, label: string }

const localeOptions = computed<LocaleOption[]>(() =>
  locales.value.map((item) => {
    const code = (typeof item === 'string' ? item : item.code) as LocaleCode
    const name = typeof item === 'string' ? item : (item.name ?? item.code)
    return {
      code,
      name,
      flag: FLAGS[code] ?? iconFlagRu,
      label: LABELS[code] ?? code.toUpperCase(),
    }
  }),
)

const currentLocale = computed(() =>
  localeOptions.value.find(item => item.code === locale.value) ?? localeOptions.value[0]!,
)

const isLangOpen = ref(false)
const langRef = ref<HTMLElement | null>(null)

function chooseLocale(code: LocaleCode) {
  isLangOpen.value = false
  if (code !== locale.value) setLocale(code)
}

/** Активная категория в строке — по текущему адресу */
function isCurrentCategory(slug: string) {
  return route.path.endsWith(`/category/${slug}`)
}

// Ни один оверлей не должен висеть открытым при переходе на другую страницу.
// Раньше сбрасывался только каталог: меню профиля переживало смену языка
watch(() => router.currentRoute.value.fullPath, () => {
  closeCatalog()
  isLocationOpen.value = false
  isAddressFormOpen.value = false
  isProfileOpen.value = false
  isSuggestOpen.value = false
})
</script>

<template>
  <header class="header">
    <!-- ── Служебная строка ── -->
    <div class="topbar">
      <div class="topbar__inner">
        <div class="topbar__group">
          <!--
            Город и адрес доставки — то же окно выбора адреса, что и на
            оформлении. Выбранный адрес уходит в подсказку и aria-label.
          -->
          <button
            type="button"
            class="topbar__link topbar__city"
            :aria-label="deliveryAddress ? `${t('shell.topbar.chooseCity')}: ${deliveryAddress.title}` : t('shell.topbar.chooseCity')"
            :title="deliveryAddress?.title"
            @click="isLocationOpen = true"
          >
            <UiIcon name="location" :size="16" />
            <span>{{ t('shell.topbar.city') }}</span>
            <span class="topbar__city-name">{{ t('shell.topbar.cityName') }}</span>
          </button>

          <NuxtLink :to="localePath('/info/delivery') + '#pickup'" class="topbar__link">
            {{ t('shell.topbar.pickupPoints') }}
          </NuxtLink>
        </div>

        <div class="topbar__group">
          <!-- Кабинет продавца живёт вне витрины, на business.paylov.uz -->
          <a :href="sellerCabinetUrl" target="_blank" rel="noopener" class="topbar__link topbar__link--brand">
            {{ t('shell.topbar.becomeSeller') }}
          </a>
          <NuxtLink :to="localePath('/info/faq')" class="topbar__link">{{ t('shell.topbar.faq') }}</NuxtLink>
          <NuxtLink :to="localePath('/account/orders')" class="topbar__link">{{ t('shell.topbar.myOrders') }}</NuxtLink>

          <div ref="langRef" class="lang">
            <button
              type="button"
              class="lang__button"
              :aria-label="t('common.chooseLanguage')"
              aria-haspopup="listbox"
              :aria-expanded="isLangOpen"
              @click="isLangOpen = !isLangOpen"
            >
              <!-- Флаг по текущему языку: раньше на /uz рядом с «UZ» стоял флаг России -->
              <img :src="currentLocale.flag" width="16" height="16" alt="" class="lang__flag">
              <span class="lang__code">{{ currentLocale.label }}</span>
              <UiIcon name="alt-arrow-down" :size="14" class="lang__chevron" :class="{ 'lang__chevron--open': isLangOpen }" />
            </button>

            <ul v-if="isLangOpen" class="lang__menu" role="listbox" :aria-label="t('common.chooseLanguage')">
              <li v-for="option in localeOptions" :key="option.code">
                <button
                  type="button"
                  class="lang__option"
                  :class="{ 'lang__option--active': option.code === locale }"
                  role="option"
                  :aria-selected="option.code === locale"
                  @click="chooseLocale(option.code)"
                >
                  <img :src="option.flag" width="20" height="20" alt="" class="lang__flag">
                  <span class="lang__name">{{ option.name }}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Основная полоса ── -->
    <div class="mainbar">
      <div class="mainbar__inner">
        <NuxtLink :to="localePath('/')" class="logo" :aria-label="t('shell.header.home')">
          <img src="/1mart-logo.svg" alt="spotshop" class="logo__img" width="190" height="40">
        </NuxtLink>

        <button
          type="button"
          class="catalog-button"
          :class="{ 'catalog-button--open': isCatalogOpen }"
          :aria-expanded="isCatalogOpen"
          @click="toggleCatalog"
        >
          <UiIcon :name="isCatalogOpen ? 'close' : 'category'" :size="20" />
          <span>{{ t('shell.header.catalog') }}</span>
        </button>

        <div ref="searchRef" class="search">
          <form class="search__form" role="search" @submit.prevent="submitSearch">
            <input
              v-model="query"
              class="search__input"
              type="search"
              autocomplete="off"
              :placeholder="t('shell.header.searchPlaceholder')"
              :aria-label="t('shell.header.searchLabel')"
              aria-autocomplete="list"
              :aria-expanded="isSuggestOpen"
              aria-controls="header-suggestions"
              @input="onSearchInput"
              @search="onSearchInput"
              @focus="suggestions.length && query.trim().length > 1 && (isSuggestOpen = true)"
              @keydown="onSearchKey"
            >
            <button type="submit" class="search__button" :aria-label="t('shell.header.search')">
              <UiIcon name="search-normal" :size="20" />
            </button>
          </form>

          <ul
            v-if="isSuggestOpen"
            id="header-suggestions"
            class="search__suggestions"
            role="listbox"
            :aria-label="t('shell.header.suggestions')"
          >
            <li v-for="(item, index) in suggestions" :key="item.id" role="option" :aria-selected="index === activeSuggestion">
              <NuxtLink
                :to="localePath(`/product/${item.slug}`)"
                class="search__suggestion"
                :class="{ 'search__suggestion--active': index === activeSuggestion }"
                @click="isSuggestOpen = false"
              >
                <UiIcon name="search-normal" :size="16" />
                <span class="search__suggestion-text">{{ item.title }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <nav class="actions">
          <div ref="profileRef" class="profile" @mouseenter="hoverProfile" @mouseleave="leaveProfile">
            <button
              type="button"
              class="action"
              :aria-label="auth.isLoggedIn ? t('common.profileMenu') : t('shell.header.login')"
              :aria-expanded="auth.isLoggedIn ? isProfileOpen : undefined"
              @click="clickProfile"
            >
              <UiIcon name="user" :size="24" />
              <span class="action__text">
                {{ auth.isLoggedIn ? (auth.user?.name || t('shell.header.profile')) : t('shell.header.login') }}
              </span>
            </button>

            <div v-if="auth.isLoggedIn && isProfileOpen" class="profile__menu">
              <p class="profile__name">{{ auth.user?.name }}</p>
              <p class="profile__phone">{{ auth.user?.phone }}</p>

              <div v-if="isBalanceLoading" class="profile__balance" aria-busy="true">
                <UiSkeleton width="110px" height="14px" />
                <UiSkeleton width="150px" height="22px" />
              </div>
              <div v-else-if="profileBalance" class="profile__balance">
                <NuxtLink :to="localePath('/account/balance')" class="profile__balance-main" @click="isProfileOpen = false">
                  <span class="profile__balance-label">{{ t('pay.balance.title') }}</span>
                  <span class="profile__balance-sum">{{ money(profileBalance.available) }}</span>
                </NuxtLink>
                <NuxtLink :to="localePath('/account/balance')" class="profile__balance-top" @click="isProfileOpen = false">{{ t('pay.payment.topUp') }}</NuxtLink>
              </div>

              <NuxtLink :to="localePath('/account/orders')" class="profile__link" @click="isProfileOpen = false">{{ t('shell.topbar.myOrders') }}</NuxtLink>
              <NuxtLink :to="localePath('/account/favorites')" class="profile__link" @click="isProfileOpen = false">{{ t('shell.header.favorites') }}</NuxtLink>
              <NuxtLink :to="localePath('/account/settings')" class="profile__link" @click="isProfileOpen = false">{{ t('account.settings') }}</NuxtLink>

              <button type="button" class="profile__logout" @click="auth.logout(); isProfileOpen = false">
                {{ t('common.logout') }}
              </button>
            </div>
          </div>

          <NuxtLink :to="localePath('/account/favorites')" class="action">
            <UiIcon name="heart" :size="24" />
            <span class="action__text">{{ t('shell.header.favorites') }}</span>
          </NuxtLink>

          <NuxtLink
            :to="localePath('/cart')"
            class="action"
            :aria-label="cart.count
              ? t('ui.appshell.appHeader.cartWithCount', { count: cart.count, word: t('common.tovar', cart.count) })
              : t('shell.header.cart')"
          >
            <span class="action__icon">
              <UiIcon name="shopping-bag" :size="24" />
              <!--
                Бейдж только на клиенте: страницы кэшируются (isr), и число из
                SSR-разметки уезжало в кэш — посетитель видел чужой счётчик
                и получал ошибку гидратации.
              -->
              <ClientOnly>
                <span v-if="cart.count" class="action__badge" aria-hidden="true">{{ cart.count > 99 ? '99+' : cart.count }}</span>
              </ClientOnly>
            </span>
            <span class="action__text">{{ t('shell.header.cart') }}</span>
          </NuxtLink>
        </nav>
      </div>
    </div>

    <!-- ── Строка категорий ── -->
    <div class="catbar" @mouseleave="leaveCatalogArea">
      <nav class="catbar__inner" :aria-label="t('shell.header.categoriesNav')">
        <!-- Не поместившиеся категории переносятся на скрытую вторую строку:
             длина названий зависит от языка, и число ссылок подбирается само -->
        <ul class="catbar__list">
          <li v-for="category in stripCategories" :key="category.id" @mouseenter="hoverCategory(category.slug)">
            <NuxtLink
              :to="localePath(`/category/${category.slug}`)"
              class="catbar__link"
              :class="{
                'catbar__link--active': isCurrentCategory(category.slug),
                'catbar__link--open': isCatalogOpen && catalogRootSlug === category.slug,
              }"
            >
              {{ category.title }}
            </NuxtLink>
          </li>
        </ul>

        <button
          type="button"
          class="catbar__more"
          :aria-expanded="isCatalogOpen"
          @click="toggleCatalog"
        >
          {{ t('shell.header.more') }}
          <UiIcon name="alt-arrow-down" :size="14" class="catbar__more-icon" :class="{ 'catbar__more-icon--open': isCatalogOpen }" />
        </button>
      </nav>
    </div>

    <AppCatalogMenu
      v-if="isCatalogOpen"
      :root-slug="catalogRootSlug"
      @close="closeCatalog"
      @panel-enter="keepCatalog"
      @panel-leave="leaveCatalogArea"
    />

    <LazyAppLocationModal
      v-model="isLocationOpen"
      @add="isLocationOpen = false; isAddressFormOpen = true"
    />

    <LazyAppAddressDetailsModal
      v-model="isAddressFormOpen"
      @submit="addAddress"
    />

    <LazyAppAuthModal
      ref="authModal"
      v-model="auth.isAuthOpen"
      @register="auth.isAuthOpen = false; auth.isRegisterOpen = true"
      @recover="auth.startRecovery()"
      @submit="signIn($event)"
    />

    <AppRegisterModal
      ref="registerModal"
      v-model="auth.isRegisterOpen"
      @login="auth.isRegisterOpen = false; auth.isAuthOpen = true"
      @submit="register($event)"
    />

    <LazyAppRecoverModal
      ref="recoverModal"
      v-model="auth.isRecoverOpen"
      @login="auth.isRecoverOpen = false; auth.isAuthOpen = true"
      @submit="requestCode($event)"
    />

    <AppSmsCodeModal
      ref="smsModal"
      v-model="auth.isSmsOpen"
      :phone="auth.pendingPhone"
      :title="auth.smsPurpose === 'recover' ? t('auth.recoverTitle') : t('auth.registerTitle')"
      @submit="confirmCode($event)"
      @resend="resendCode()"
    />

    <LazyAppNewPasswordModal
      ref="newPasswordModal"
      v-model="auth.isNewPasswordOpen"
      @submit="savePassword($event)"
    />

    <LazyAppStatusModal
      :model-value="auth.isPasswordDoneOpen"
      kind="success"
      :title="t('auth.passwordChanged')"
      :text="t('auth.passwordChangedText')"
      :primary-label="t('common.close')"
      :secondary-label="t('shell.topbar.myOrders')"
      @update:model-value="auth.isPasswordDoneOpen = false"
      @primary="auth.isPasswordDoneOpen = false"
      @secondary="auth.isPasswordDoneOpen = false; navigateTo(localePath('/account/orders'))"
    />
  </header>
</template>

<style scoped>
/*
 * Залипает вся шапка, но со сдвигом на высоту служебной строки: та уезжает
 * вверх, а поиск и категории остаются — как у Uzum.
 */
.header {
  position: sticky;
  top: calc(-1 * var(--header-topbar-height));
  z-index: 100;
  background: var(--color-surface);
  box-shadow: 0 1px 0 var(--color-line);
}

/* ---------- Служебная строка ---------- */

.topbar {
  height: var(--header-topbar-height);
  background: var(--color-topbar);
}

.topbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: var(--container-width);
  height: 100%;
  margin-inline: auto;
}

.topbar__group {
  display: flex;
  align-items: center;
  gap: 24px;
}

.topbar__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  background: none;
  font-family: var(--font-ui);
  font-weight: 400;
  font-size: var(--text-xs);
  line-height: 16px;
  color: var(--color-navy);
  white-space: nowrap;
  cursor: pointer;
}

.topbar__link:hover { color: var(--color-brand-text); }
.topbar__link--brand { font-weight: 500; color: var(--color-brand-text); }
.topbar__link--brand:hover { color: var(--color-brand-text-hover); }

.topbar__city :deep(svg) { color: var(--color-navy); }
.topbar__city-name {
  font-weight: 500;
  text-decoration: underline;
  text-decoration-color: rgb(39 49 64 / 30%);
  text-underline-offset: 3px;
}

.lang { position: relative; }

.lang__button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-navy);
  cursor: pointer;
}

.lang__button:hover { color: var(--color-brand-text); }

.lang__flag {
  flex: none;
  border-radius: 50%;
}

.lang__code {
  font-weight: 500;
  font-size: var(--text-xs);
  line-height: 16px;
}

.lang__chevron { transition: transform 0.15s ease; }
.lang__chevron--open { transform: rotate(180deg); }

/* Список языков: раскрывается вниз от кнопки, поверх основной полосы */
.lang__menu {
  position: absolute;
  z-index: 120;
  top: calc(100% + 10px);
  right: 0;
  min-width: 190px;
  margin: 0;
  padding: 6px;
  list-style: none;
  border-radius: 14px;
  background: var(--color-surface);
  box-shadow: 0 12px 32px rgb(39 49 64 / 18%);
}

.lang__option {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 9px 10px;
  border: 0;
  border-radius: 10px;
  background: none;
  font-family: var(--font-ui);
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--color-navy);
  text-align: left;
  cursor: pointer;
}

.lang__option:hover { background: var(--color-topbar); }
.lang__option--active { background: var(--color-brand-tint); color: var(--color-brand-text); }

.lang__name { white-space: nowrap; }

/* ---------- Основная полоса ---------- */

.mainbar {
  height: var(--header-mainbar-height);
  background: var(--color-surface);
}

.mainbar__inner {
  display: flex;
  align-items: center;
  gap: 16px;
  width: var(--container-width);
  height: 100%;
  margin-inline: auto;
}

.logo {
  display: inline-flex;
  flex: none;
  align-items: center;
  margin-right: 16px;
}

.logo__img { display: block; height: 40px; width: auto; }

.catalog-button {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding-inline: 16px 20px;
  border: 0;
  border-radius: 12px;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  transition: background 0.15s ease;
  font: var(--type-button);
}

.catalog-button:hover { background: var(--color-brand-dark); }
.catalog-button:active,
.catalog-button--open { background: var(--color-brand-darker); }

/* Поле с прикреплённой справа кнопкой, как у Uzum */
.search {
  position: relative;
  flex: 1;
  min-width: 0;
}

.search__form {
  display: flex;
  align-items: stretch;
  height: 44px;
  border: 1.5px solid var(--color-line);
  border-radius: 12px;
  background: var(--color-surface);
  overflow: hidden;
  transition: border-color 0.15s ease;
}

.search__form:hover { border-color: #C9CFD8; }

/* Фокус показывает вся плашка, а не поле внутри неё */
.search__form:focus-within { border-color: var(--color-brand); }

.search__input {
  flex: 1;
  min-width: 0;
  padding-inline: 16px;
  border: 0;
  background: none;
  outline: none;
  font: var(--type-input);
  color: var(--input-color);
}

.search__input:focus-visible {
  outline: none;
  box-shadow: none;
}

.search__input::placeholder { color: var(--input-placeholder); }

.search__button {
  display: grid;
  flex: none;
  place-items: center;
  width: 64px;
  border: 0;
  background: var(--color-topbar);
  color: var(--color-navy);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.search__button:hover { background: var(--color-brand); color: var(--color-on-brand); }

.search__suggestions {
  position: absolute;
  z-index: 130;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 6px;
  list-style: none;
  border-radius: 14px;
  background: var(--color-surface);
  box-shadow: 0 16px 40px rgb(39 49 64 / 18%);
}

.search__suggestion {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: var(--text-sm);
  line-height: 18px;
  color: var(--color-navy);
}

.search__suggestion :deep(svg) { color: var(--color-gray); }

.search__suggestion:hover,
.search__suggestion--active { background: var(--color-topbar); }

.search__suggestion-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Иконка над подписью не нужна: у Uzum иконка и подпись в строку */
.actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding-inline: 12px;
  border: 0;
  border-radius: 12px;
  background: none;
  font-family: var(--font-ui);
  color: var(--color-navy);
  cursor: pointer;
  transition: background 0.15s ease;
}

.action:hover { background: var(--color-topbar); }
.action.router-link-active { color: var(--color-brand-text); }

.action__icon {
  position: relative;
  display: inline-flex;
  /* Место под бейдж счётчика, чтобы он не наезжал на подпись */
  margin-right: 4px;
}

.action__text {
  max-width: 140px;
  overflow: hidden;
  font-weight: 500;
  font-size: var(--text-sm);
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action__badge {
  position: absolute;
  top: -7px;
  right: -9px;
  display: grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  padding-inline: 4px;
  border-radius: 9px;
  box-shadow: 0 0 0 2px var(--color-surface);
  background: var(--color-brand);
  font-family: var(--font-badge);
  font-weight: 600;
  font-size: 11px;
  line-height: 18px;
  color: var(--color-on-brand);
}

/* Меню профиля для вошедшего пользователя */
.profile { position: relative; }

.profile__menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 50;
  width: 260px;
  padding: 16px;
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: 0 18px 40px rgb(39 49 64 / 16%);
}

.profile__name { margin: 0; font-weight: 600; font-size: var(--text-base); color: var(--color-text); }
.profile__phone { margin: 2px 0 12px; font-size: var(--text-sm); color: var(--color-gray); }

.profile__balance {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
  padding: 12px;
  border-radius: 12px;
  background: var(--color-page);
}

.profile__balance-main { display: flex; flex-direction: column; gap: 2px; }
.profile__balance-main:hover { text-decoration: none; }

.profile__balance-label { font-size: var(--text-xs); line-height: 16px; color: var(--color-gray); }

.profile__balance-sum {
  font-weight: 700;
  font-size: var(--text-lg);
  line-height: 22px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.profile__balance-top {
  padding: 8px;
  border-radius: 10px;
  background: var(--color-brand);
  text-align: center;
  color: var(--color-on-brand);
  transition: background 0.15s ease;
  font: var(--type-button-sm);
}

.profile__balance-top:hover { background: var(--color-brand-dark); text-decoration: none; }

.profile__link {
  display: block;
  padding: 10px 8px;
  border-radius: 10px;
  font-size: var(--text-md);
  color: var(--color-text);
}

.profile__link:hover { background: var(--color-topbar); }

.profile__logout {
  width: 100%;
  margin-top: 8px;
  padding: 10px 8px;
  border: 0;
  border-radius: 10px;
  background: none;
  font-family: var(--font-ui);
  font-size: var(--text-md);
  color: var(--color-danger);
  text-align: left;
  cursor: pointer;
}

.profile__logout:hover { background: #FFF1F1; }

/* ---------- Строка категорий ---------- */

.catbar {
  height: var(--header-catbar-height);
  background: var(--color-surface);
}

.catbar__inner {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  width: var(--container-width);
  height: 100%;
  margin-inline: auto;
}

.catbar__list {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  column-gap: 24px;
  min-width: 0;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  list-style: none;
}

.catbar__link,
.catbar__more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: var(--header-catbar-height);
  padding: 0;
  border: 0;
  background: none;
  font-family: var(--font-ui);
  font-weight: 400;
  font-size: var(--text-sm);
  line-height: 18px;
  color: var(--color-gray);
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s ease;
}

.catbar__link:hover,
.catbar__more:hover { color: var(--color-navy); }

.catbar__link--active { color: var(--color-brand-text); }
.catbar__link--open { color: var(--color-navy); box-shadow: inset 0 -2px 0 var(--color-brand); }

.catbar__more { flex: none; color: var(--color-navy); }
.catbar__more-icon { transition: transform 0.15s ease; }
.catbar__more-icon--open { transform: rotate(180deg); }

/* Общее правило подчёркивает ссылки внутри li при наведении — здесь цвет и так меняется */
.catbar__link:hover,
.search__suggestion:hover { text-decoration: none; }
</style>
