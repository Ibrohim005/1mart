/**
 * Сохранённые адреса доставки — `GET /common/user-locations/`
 * (UserLocationListView + UserLocationSerializer).
 *
 * Порядок бэкенд задаёт сам: `-is_active, -created_at`, то есть первым
 * приходит адрес по умолчанию. Это важно, а не случайно: и корзина, и
 * оформление берут `addresses[0]` как выбранный.
 *
 * Зачем это вообще переводить: пока список отдавал мок, его id («a1») не
 * проходили валидацию бэкенда, и `orders/index.post.ts` их отбрасывал
 * (`UUID.test(addressId)`) — заказ уходил без адреса, а доставка считалась
 * нулевой. Теперь id — настоящий UserLocation, и `location_id` доезжает.
 *
 * Вьюха пагинирована по-умолчанию проекта (LimitOffsetPagination,
 * PAGE_SIZE=10), поэтому ответ — { count, results }, и разворачиваем его
 * через `items()`. Лимит поднимаем явно: десять сохранённых точек — не
 * предел, а «показать первые десять из двенадцати» в диалоге выбора адреса
 * выглядит как потерянные данные.
 *
 * Списки регионов и районов (`GET /common/regions/`, `/common/districts/`)
 * НЕ подключены намеренно: во фронте нет ни одного их потребителя — адрес
 * вводится точкой на карте (AddressDetailsModal шлёт lat/lng), а район
 * бэкенд определяет сам при создании UserLocation (resolve_from_components).
 * Роут, который никто не вызывает, регион на экране не покажет.
 */
/**
 * `region_name` и `district_name` объявлены необязательными не для порядка:
 * в сериализаторе это `CharField(source="region.name", read_only=True)`, и
 * когда FK пуст, DRF кладёт не null, а ВЫБРАСЫВАЕТ ключ из ответа целиком
 * (read_only ⇒ required=False ⇒ SkipField). Проверено на живом ответе: у
 * адреса без региона ключей region_name/district_name просто нет.
 */
interface UpstreamLocation {
  id: string
  title: string | null
  region_name?: string | null
  district_name?: string | null
  address: string | null
  is_active: boolean
  /*
   * Координаты и уточнения бэкенд хранит всегда, а здесь их не читали — и
   * список адресов приходил с пустыми `title`/`subtitle`: у точки с карты нет
   * ни `address`, ни региона, ни названия, а подпись собирали только из них.
   * В окне выбора строки выглядели пустыми, хотя покупатель вводил и
   * квартиру, и подъезд, и этаж: сразу после сохранения подпись рисовало
   * оформление по своим данным, а после перезагрузки она исчезала.
   *
   * Отдаём как есть, без склейки: «кв.», «подъезд», «этаж» — переводимые
   * слова, а на сервере i18n нет. Собирает их клиент (`describe()` в
   * useDeliveryAddress) — тем же кодом, что и для только что созданного
   * адреса, поэтому до и после перезагрузки подпись одна и та же.
   */
  latitude: string | null
  longitude: string | null
  apartment?: string | null
  entrance?: string | null
  floor?: string | null
}

const LIMIT = 50

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const response = await upstream<unknown>(event, '/common/user-locations/', {
    auth: true,
    query: { limit: LIMIT, offset: 0 },
  })

  return ok(items<UpstreamLocation>(response).map((location) => {
    const street = (location.address ?? '').trim()
    // Как названа точка самим покупателем («Дом», «Работа») — необязательное
    // поле, у адреса с карты его обычно нет.
    const label = (location.title ?? '').trim()
    const geo = [location.district_name, location.region_name].filter(Boolean).join(', ')

    // Первая строка — сам адрес, вторая — уточнение: так его читают и диалог
    // выбора (ChoiceModal), и карточка доставки в оформлении.
    const title = street || geo || label
    const subtitle = [title === label ? '' : label, title === geo ? '' : geo]
      .filter(Boolean)
      .join(', ')

    const lat = Number(location.latitude)
    const lng = Number(location.longitude)

    return {
      id: location.id,
      title,
      subtitle,
      // Сырые поля для `describe()`: из них клиент соберёт подпись, когда
      // улицы и региона нет — то есть у любой точки, поставленной на карте.
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      flat: (location.apartment ?? '').trim(),
      entrance: (location.entrance ?? '').trim(),
      floor: (location.floor ?? '').trim(),
    }
  }))
})
