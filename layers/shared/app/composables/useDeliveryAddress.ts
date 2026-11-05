/**
 * Адрес доставки: выбранный — один на всё приложение, и одно место, где
 * адрес заводится.
 *
 * Раньше выбор из окна в шапке никуда не сохранялся: человек отмечал адрес,
 * нажимал «Выбрать адрес», окно закрывалось — и всё. Ни в шапке, ни на
 * оформлении выбор не появлялся.
 *
 * Вторая половина той же истории — создание. Форма «куда доставить» одна и
 * та же, а обработчиков у неё было два: на оформлении `saveAddress` слал
 * POST, а в шапке стояло `@submit="isAddressFormOpen = false"` — окно
 * закрывалось, введённый адрес исчезал, и список в шапке оставался пустым.
 * Отсюда и ощущение, что логики нет: один и тот же экран вёл себя
 * по-разному в зависимости от того, откуда его открыли.
 *
 * В cookie кладём и идентификатор, и подпись. Подпись нужна, чтобы шапка
 * рисовалась одинаково на сервере и в браузере: список адресов запрашивают
 * только корзина и оформление, а шапка есть на каждой странице — ждать
 * от неё этот запрос значило бы расхождение при гидратации.
 */
export interface DeliveryAddressChoice {
  id: string
  title: string
}

export interface SavedAddress {
  id: string
  title: string
  subtitle: string
  /** Сырые поля с сервера — нужны, чтобы достроить подпись на клиенте */
  lat?: number | null
  lng?: number | null
  flat?: string
  entrance?: string
  floor?: string
}

export interface AddressDetails {
  flat: string
  entrance: string
  floor: string
  intercom: string
  comment: string
  lat: number
  lng: number
  /** Выбранная вручную область — бэкенд предпочтёт её догадке геокодера */
  regionId?: string | null
}

export function useDeliveryAddress() {
  /*
   * `useI18n` и `useApi` берём здесь, а не внутри `saveAddress`/`describe`:
   * их зовут из обработчика клика, то есть уже вне setup, и vue-i18n там
   * бросает «Must be called at the top of a setup function» — сохранение
   * падало молча, окно не закрывалось, адрес не появлялся.
   */
  const { t } = useI18n()
  const api = useApi()

  const choice = useCookie<DeliveryAddressChoice | null>('paylov_address', {
    default: () => null,
    sameSite: 'lax',
    secure: !import.meta.dev,
    maxAge: 60 * 60 * 24 * 180,
    path: '/',
  })

  const selectedId = computed(() => choice.value?.id ?? null)

  function select(address: DeliveryAddressChoice) {
    choice.value = { id: address.id, title: address.title }
  }

  /**
   * Подпись собирается из того, что ввёл покупатель, и видна прямо в
   * оформлении — значит, обязана переводиться. Раньше «подъезд», «этаж» и
   * «кв.» были вшиты по-русски и на `/uz` оставались русскими.
   */
  function describe(details: AddressDetails, saved: Partial<SavedAddress> = {}): SavedAddress {
    const note = [
      details.entrance && t('ui.checkout.checkout.addressPartEntrance', { value: details.entrance }),
      details.floor && t('ui.checkout.checkout.addressPartFloor', { value: details.floor }),
      details.flat && t('ui.checkout.checkout.addressPartFlat', { value: details.flat }),
    ].filter(Boolean).join(', ')

    return {
      id: String(saved.id ?? ''),
      title: saved.title || t('ui.checkout.checkout.addressMapPoint', {
        lat: details.lat.toFixed(5),
        lng: details.lng.toFixed(5),
      }),
      subtitle: note || saved.subtitle || t('ui.checkout.checkout.addressNoDetails'),
    }
  }

  /**
   * Заводит адрес и сразу делает его выбранным — ради этого человек форму и
   * открывал. Бросает наверх: показывать тост и закрывать окно решает тот,
   * кто вызвал, у шапки и у оформления это по-разному.
   */
  async function saveAddress(details: AddressDetails): Promise<SavedAddress> {
    // Раньше тут выдумывался `a${n}` и бэкенд не звали вовсе: оформление
    // заказа передаёт только настоящий UUID, поэтому адрес до заказа не
    // доезжал, а перезагрузка его стирала (см. UserLocationCreateView).
    const saved = await api.post<SavedAddress>('/user/addresses', { ...details })
    const address = describe(details, saved)

    // Список в окне шапки живёт в кеше под ключом `user:addresses`. Без этого
    // только что заведённый адрес появлялся лишь после перезагрузки.
    const cached = useNuxtData<SavedAddress[]>('user:addresses')
    if (Array.isArray(cached.data.value)) {
      cached.data.value = [...cached.data.value, address]
    }

    select(address)
    return address
  }

  /**
   * Достраивает подпись адресу, пришедшему с сервера. У точки с карты ни
   * улицы, ни региона нет — `title`/`subtitle` приходят пустыми, и в списке
   * были пустые строки. Собираем то же самое, что показываем сразу после
   * сохранения: координаты в заголовок, квартиру/подъезд/этаж — в подпись.
   */
  function withLabels(address: SavedAddress): SavedAddress {
    if (address.title && address.subtitle) return address
    const details: AddressDetails = {
      flat: address.flat ?? '',
      entrance: address.entrance ?? '',
      floor: address.floor ?? '',
      intercom: '',
      comment: '',
      lat: address.lat ?? 0,
      lng: address.lng ?? 0,
    }
    const built = describe(details, address)
    return { ...address, title: built.title, subtitle: built.subtitle }
  }

  return { choice, selectedId, select, describe, withLabels, saveAddress }
}
