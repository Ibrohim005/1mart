import { defineStore } from 'pinia'

export interface AuthUser {
  phone: string
  name: string
  /** Сотрудник вошёл с временным паролем от руководителя — просим задать свой */
  mustChangePassword?: boolean
}

/**
 * Текст ошибки из ответа сервера.
 *
 * `statusMessage` ходит в строке состояния HTTP, а она обязана быть ASCII —
 * h3 вырезает из неё всё остальное (`sanitizeStatusMessage`), и сообщение
 * бэкенда на русском доехало бы до диалога пустым. Тот же текст целиком
 * лежит в теле ответа (`message`), поэтому читаем сначала его.
 */
function errorText(error: unknown, fallback: string): string {
  const failed = error as { data?: { message?: string }, statusMessage?: string }
  return failed.data?.message || failed.statusMessage || fallback
}

/**
 * Состояние авторизации. Хранится в cookie, а не в localStorage:
 * сервер тоже должен знать о сеансе, иначе защищённые страницы
 * рисуются на сервере и «прыгают» при гидратации.
 *
 * В этой cookie только имя и телефон для отрисовки, и читается она из JS.
 * Настоящую пару токенов ставит сервер отдельными `httpOnly` cookie
 * (`zoo_at` / `zoo_rt`, см. `layers/api-backend/server/api/auth/login.post.ts`)
 * — из браузера они не видны, поэтому XSS не уносит сеанс. Здесь `httpOnly`
 * не стоит намеренно: иначе фронт не узнает, кого рисовать в шапке.
 */
export const useAuthStore = defineStore('auth', () => {
  const cookie = useCookie<AuthUser | null>('paylov_auth', {
    default: () => null,
    sameSite: 'lax',
    // По HTTPS cookie не должна уходить в открытом виде; в dev протокол http
    secure: !import.meta.dev,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  /**
   * Клиент API создаётся здесь, в setup стора, а не внутри экшенов.
   * `useApi()` берёт язык через `useI18n()`, а тот работает только при живом
   * экземпляре компонента; в обработчике события его уже нет, и вызов из
   * экшена падал с «Must be called at the top of a `setup` function». Наружу
   * это выглядело как «нажал „Войти“ — получил общую ошибку»: запрос не
   * уходил вовсе. Стор корзины устроен так же (`const api = useApi()`).
   *
   * Стор поднимает ещё и middleware кабинета — там компонента нет вовсе, и
   * создавать клиента нечем. Сеть оттуда никто не трогает (проверяется
   * только cookie), поэтому там его просто не будет: на клиенте стор
   * заводит шапка, уже внутри своего setup.
   */
  const api = getCurrentInstance() ? useApi() : null

  function client() {
    if (!api) throw new Error('API-klient mavjud emas')
    return api
  }

  const user = computed(() => cookie.value)
  const isLoggedIn = computed(() => cookie.value !== null)

  const isAuthOpen = ref(false)
  const isRegisterOpen = ref(false)
  const isSmsOpen = ref(false)
  const isRecoverOpen = ref(false)
  const isNewPasswordOpen = ref(false)
  const isPasswordDoneOpen = ref(false)
  const pendingPhone = ref('')
  /** Экран ввода кода обслуживает оба сценария — от него зависит следующий шаг */
  const smsPurpose = ref<'register' | 'recover'>('register')

  /**
   * Заявка на регистрацию: бэкенд заводит пользователя только на шаге с
   * кодом, а до тех пор помнит номер, имя и пароль по этому идентификатору.
   */
  const pendingSession = ref('')
  /**
   * Пароль регистрации живёт в памяти до подтверждения кода: повторная
   * отправка кода — это тот же `send-otp`, и он снова требует пароль.
   * В cookie он не попадает и после подтверждения стирается.
   */
  const pendingPassword = ref('')
  /**
   * Имя из формы регистрации. Живёт рядом с паролем и по той же причине:
   * повторная отправка кода — это тот же `send-otp`, и заявку надо создать
   * заново целиком. А после подтверждения им же подписывается шапка: сам
   * `verify-otp` имени не возвращает.
   */
  const pendingName = ref('')
  /** Восстановление: бэкенд меняет пароль по этому токену, а не по коду. */
  const resetToken = ref('')
  /**
   * Зачем открыт диалог нового пароля: последний шаг восстановления или первый
   * вход сотрудника с временным паролем, который ему выдал руководитель.
   */
  const passwordPurpose = ref<'recover' | 'firstLogin'>('recover')

  function closeAll() {
    isAuthOpen.value = false
    isRegisterOpen.value = false
    isSmsOpen.value = false
    isRecoverOpen.value = false
    isNewPasswordOpen.value = false
  }

  /** «Забыли пароль?» из диалога входа */
  function startRecovery() {
    closeAll()
    smsPurpose.value = 'recover'
    isRecoverOpen.value = true
  }

  /** Код отправлен — переходим к его вводу */
  function askCode(phone: string, purpose: 'register' | 'recover') {
    pendingPhone.value = phone
    smsPurpose.value = purpose
    closeAll()
    isSmsOpen.value = true
  }

  /**
   * Диалоги ждут от сети не исключение, а текст ошибки: им нужно подписать
   * поле, а не уронить страницу. `null` — успех.
   */

  /**
   * Регистрация, шаг 1. Пароль спрашивается здесь, а не после кода, потому
   * что его требует сам `send-otp`: бэкенд хеширует пароль и хранит вместе
   * с заявкой, а пользователя заводит уже подтверждение кода.
   */
  async function register(phone: string, password: string, name = ''): Promise<string | null> {
    try {
      const started = await client().post<{ session: string }>('/auth/register', { phone, password, name })
      pendingSession.value = started.session
      pendingPassword.value = password
      pendingName.value = name
      askCode(phone, 'register')
      return null
    }
    catch (error) {
      return errorText(error, 'Ro\'yxatdan o\'tishda xatolik')
    }
  }

  /** Восстановление, шаг 1: заявка на код. */
  async function requestRecovery(phone: string): Promise<string | null> {
    try {
      await client().post('/auth/password/request', { phone })
      askCode(phone, 'recover')
      return null
    }
    catch (error) {
      return errorText(error, 'Kodni yuborishda xatolik')
    }
  }

  /**
   * Код из SMS. Проверяет его сервер — раньше код никуда не уходил и любые
   * пять цифр открывали сеанс.
   *
   * Регистрация на этом шаге заканчивается: бэкенд заводит пользователя и
   * отдаёт токены, которые сервер кладёт в `httpOnly` cookie. Восстановление
   * меняет код на `reset_token` и идёт к новому паролю.
   */
  async function confirmCode(code: string): Promise<string | null> {
    if (smsPurpose.value === 'register') {
      try {
        const registered = await client().post<AuthUser>('/auth/verify', {
          session: pendingSession.value,
          code,
        })
        // `verify-otp` имени не возвращает — берём то, что человек только что
        // ввёл сам. Выдумывать тут нечего, а телефон вместо имени в шапке
        // выглядит как несохранённая регистрация.
        cookie.value = {
          phone: registered.phone || pendingPhone.value,
          name: registered.name || pendingName.value,
        }
        pendingSession.value = ''
        pendingPassword.value = ''
        pendingName.value = ''
        closeAll()
        return null
      }
      catch (error) {
        return errorText(error, 'Kodni tasdiqlashda xatolik')
      }
    }

    try {
      const verified = await client().post<{ resetToken: string }>('/auth/password/verify', {
        phone: pendingPhone.value,
        code,
      })
      resetToken.value = verified.resetToken
      closeAll()
      isNewPasswordOpen.value = true
      return null
    }
    catch (error) {
      return errorText(error, 'Kodni tasdiqlashda xatolik')
    }
  }

  /**
   * Повторная отправка кода. Регистрация просит новый код тем же вызовом,
   * что и первый раз, — и получает НОВУЮ заявку: старый идентификатор после
   * этого недействителен, поэтому его обязательно надо заменить.
   */
  async function resendCode(): Promise<string | null> {
    if (smsPurpose.value === 'register') {
      try {
        const started = await client().post<{ session: string }>('/auth/register', {
          phone: pendingPhone.value,
          password: pendingPassword.value,
          name: pendingName.value,
        })
        pendingSession.value = started.session
        return null
      }
      catch (error) {
        return errorText(error, 'Kodni qayta yuborishda xatolik')
      }
    }

    try {
      await client().post('/auth/password/request', { phone: pendingPhone.value })
      return null
    }
    catch (error) {
      return errorText(error, 'Kodni qayta yuborishda xatolik')
    }
  }

  /**
   * Новый пароль. Сеанс открывает сервер — тем же паролем и тем же
   * `/users/login/`, что и обычный вход. Если это не удалось, рисовать
   * вошедшего нельзя: токенов нет, и первый же личный запрос получит 401 —
   * тогда просто просим войти.
   */
  async function finishRecovery(password: string): Promise<string | null> {
    try {
      const done = await client().post<{ signedIn: boolean, phone: string }>('/auth/password/confirm', {
        phone: pendingPhone.value,
        resetToken: resetToken.value,
        password,
      })
      resetToken.value = ''

      if (!done.signedIn) {
        closeAll()
        isAuthOpen.value = true
        return null
      }

      // Номер берём из ответа: сервер отдаёт тот, под которым сеанс открыт.
      login(done.phone || pendingPhone.value)
      isPasswordDoneOpen.value = true
      return null
    }
    catch (error) {
      return errorText(error, 'Parolni saqlashda xatolik')
    }
  }

  /** Оставлено для совместимости: cookie читается сама */
  function restore() {}

  /**
   * Отметить сеанс открытым. Вызывается после того, как сервер уже поставил
   * токены: здесь только имя и телефон для отрисовки шапки.
   */
  function login(phone: string, name = '') {
    cookie.value = { phone, name }
    closeAll()
  }

  /**
   * Вход по телефону и паролю. Пароль уходит на сервер и там же
   * обменивается на токены — в браузер он не возвращается ни в каком виде.
   *
   * Возвращает текст ошибки вместо исключения: вызывающий — форма, и ей
   * нужно подписать поле, а не уронить страницу.
   */
  async function signIn(phone: string, password: string): Promise<string | null> {
    try {
      const user = await client().post<AuthUser>('/auth/login', { phone, password })
      cookie.value = { phone: user.phone || phone, name: user.name || '' }
      closeAll()
      if (user.mustChangePassword) askOwnPassword()
      return null
    }
    catch (error) {
      return errorText(error, 'Kirishda xatolik')
    }
  }

  /** Первый вход по временному паролю: сразу просим придумать свой */
  function askOwnPassword() {
    passwordPurpose.value = 'firstLogin'
    isNewPasswordOpen.value = true
  }

  /** Свой пароль вместо временного (сеанс уже открыт) */
  async function changeOwnPassword(password: string): Promise<string | null> {
    try {
      await client().post('/auth/password/change', { password })
      isNewPasswordOpen.value = false
      passwordPurpose.value = 'recover'
      isPasswordDoneOpen.value = true
      return null
    }
    catch (error) {
      return errorText(error, 'Parolni saqlashda xatolik')
    }
  }

  /**
   * Сеанс после OneID / ЭЦП: регистрация компании или вход руководителя
   * уже зарегистрированной. Сервер отдаёт телефон и имя для шапки.
   */
  function openSession(user: AuthUser) {
    cookie.value = { phone: user.phone, name: user.name }
    closeAll()
  }

  async function logout() {
    // Сначала сервер: он снимает `httpOnly` cookie с токенами, до которых
    // отсюда не дотянуться. Локальную cookie чистим в любом случае —
    // кнопка «выйти» не должна зависеть от доступности бэкенда.
    try {
      await client().post('/auth/logout')
    }
    catch {
      // Сеанс закрываем всё равно.
    }
    cookie.value = null
  }

  /** Открыть вход; используется как гейт перед защищённым действием */
  function requireAuth() {
    if (isLoggedIn.value) return true
    isAuthOpen.value = true
    return false
  }

  /**
   * Сеанс истёк на бэкенде, хотя фронт ещё считал пользователя вошедшим.
   *
   * `zoo_auth` (имя/телефон для шапки) живёт 30 дней, а токены в `httpOnly`
   * cookie — часы. Когда и access, и refresh уже мертвы, каждое личное
   * действие возвращало 401, а `isLoggedIn` по-прежнему был true — на карточке
   * это выглядело как ливень «Не удалось сохранить», хотя причина одна: сеанс
   * закончился. Гасим видимый признак входа и открываем форму, ровно как
   * `requireAuth` для гостя. Без запроса на /auth/logout: токен и так мёртв,
   * а его 401 добавил бы второй ложный тост.
   */
  function sessionExpired() {
    cookie.value = null
    isAuthOpen.value = true
  }

  return {
    passwordPurpose,
    askOwnPassword,
    changeOwnPassword,
    openSession,
    user,
    isLoggedIn,
    isAuthOpen,
    isRegisterOpen,
    isSmsOpen,
    isRecoverOpen,
    isNewPasswordOpen,
    isPasswordDoneOpen,
    pendingPhone,
    smsPurpose,
    startRecovery,
    askCode,
    register,
    requestRecovery,
    confirmCode,
    resendCode,
    finishRecovery,
    restore,
    login,
    signIn,
    logout,
    requireAuth,
    sessionExpired,
  }
})
