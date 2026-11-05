<script setup lang="ts">
/**
 * Уточнение адреса поверх карты. Макет: Ad Location —
 * панель 505 с полями «Квартира / Подъезд / Этаж», паролем от подъезда
 * и комментарием; кнопка «Продолжить» 505×60.3, r16.9.
 */
const props = defineProps<{ modelValue: boolean }>()

const { t } = useI18n()

const { data: regionList } = await useApiData<Array<{ id: string, title: string }>>(
  'common:regions', '/common/regions', { lazy: true })
const regions = computed(() => regionList.value ?? [])
const regionId = ref<string>('')
export interface AddressDetails {
  flat: string
  entrance: string
  floor: string
  intercom: string
  comment: string
  lat: number
  lng: number
  /*
   * Область выбирает покупатель. Бэкенд умеет определять её сам, обратным
   * геокодированием по точке, но геокодер — внешний сервис: когда до него нет
   * маршрута, у адреса не остаётся ни области, ни района, а доставка считается
   * именно по области (тариф продавца + список областей у товара) и отвечает
   * «не доставляем» на любой адрес. Явный выбор делает расчёт независимым от
   * чужой доступности, а догадку геокодера бэкенд применяет только к пустому
   * полю.
   */
  regionId: string | null
}

const emit = defineEmits<{ 'update:modelValue': [boolean], submit: [AddressDetails] }>()

function close() {
  emit('update:modelValue', false)
}

// Блокировка фона, ловушка фокуса, Esc и возврат фокуса — общие для всех диалогов
const panel = ref<HTMLElement | null>(null)
useDialog(toRef(props, 'modelValue'), { panel, onClose: close })


/**
 * Карта выбора точки на местности.
 *
 * Основной вариант — Яндекс.Карты: в Узбекистане у них подробнее адресная
 * основа, и заказчик просил именно их. Ключ задаётся переменной
 * NUXT_PUBLIC_YANDEX_MAPS_KEY; пока его нет, карта работает на Leaflet
 * с тайлами OpenStreetMap (библиотека лежит в сборке, внешних скриптов нет —
 * CSP ослаблять не пришлось, только разрешены тайлы в img-src) — форма
 * адреса не должна оставаться без карты только потому, что ключ ещё не
 * выписан.
 *
 * Выбранные lat/lng уходят в POST /user/addresses при сохранении (см.
 * saveAddress в checkout/index.vue).
 */
const TASHKENT = { lat: 41.3111, lng: 69.2797 }

const mapHost = ref<HTMLElement | null>(null)
const position = ref({ ...TASHKENT })
const locating = ref(false)
const locateError = ref('')

const coords = computed(() => `${position.value.lat.toFixed(5)}, ${position.value.lng.toFixed(5)}`)

const yandexKey = useRuntimeConfig().public.yandexMapsKey

/** Общие действия над картой — одинаковые для обеих реализаций */
interface MapHandle {
  setCenter: (lat: number, lng: number, zoom?: number) => void
  setMarker: (lat: number, lng: number) => void
  zoomBy: (step: number) => void
  destroy: () => void
}

let handle: MapHandle | null = null

/** Загружаем скрипт Яндекс.Карт один раз на страницу */
function loadYandex(key: string) {
  const existing = document.querySelector<HTMLScriptElement>('script[data-yandex-maps]')
  if (existing) return existing.dataset.loaded === '1'
    ? Promise.resolve()
    : new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Яндекс.Карты не загрузились')))
    })

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(key)}&lang=ru_RU`
    script.async = true
    script.dataset.yandexMaps = '1'
    script.addEventListener('load', () => {
      script.dataset.loaded = '1'
      resolve()
    })
    script.addEventListener('error', () => reject(new Error('Яндекс.Карты не загрузились')))
    document.head.appendChild(script)
  })
}

async function mountYandex(host: HTMLElement): Promise<MapHandle> {
  await loadYandex(yandexKey)
  const ymaps = (window as unknown as { ymaps3?: Record<string, unknown> }).ymaps3
  if (!ymaps) throw new Error('ymaps3 недоступен')

  await (ymaps.ready as Promise<void>)
  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapListener } = ymaps as Record<string, new (...args: unknown[]) => unknown> & Record<string, unknown>

  const state = { center: [position.value.lng, position.value.lat], zoom: 16 }
  const map = new (YMap as new (...args: unknown[]) => { addChild: (child: unknown) => void, update: (state: unknown) => void, destroy: () => void })(host, { location: state })

  map.addChild(new (YMapDefaultSchemeLayer as new () => unknown)())
  map.addChild(new (YMapDefaultFeaturesLayer as new () => unknown)())

  const pin = document.createElement('div')
  pin.className = 'address__marker'

  const markerInstance = new (YMapMarker as new (...args: unknown[]) => { update: (props: unknown) => void })(
    { coordinates: [position.value.lng, position.value.lat], draggable: true, onDragEnd: (coordinates: number[]) => {
      position.value = { lat: coordinates[1]!, lng: coordinates[0]! }
    } },
    pin,
  )
  map.addChild(markerInstance)

  map.addChild(new (YMapListener as new (...args: unknown[]) => unknown)({
    layer: 'any',
    onClick: (_object: unknown, event: { coordinates: number[] }) => {
      const [lng, lat] = event.coordinates
      position.value = { lat: lat!, lng: lng! }
      markerInstance.update({ coordinates: [lng!, lat!] })
    },
  }))

  let zoom = 16
  return {
    setCenter: (lat, lng, next) => {
      zoom = next ?? zoom
      map.update({ location: { center: [lng, lat], zoom, duration: 300 } })
    },
    setMarker: (lat, lng) => markerInstance.update({ coordinates: [lng, lat] }),
    zoomBy: (step) => {
      zoom += step
      map.update({ location: { zoom, duration: 200 } })
    },
    destroy: () => map.destroy(),
  }
}

async function mountLeaflet(host: HTMLElement): Promise<MapHandle> {
  const L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')

  const map = L.map(host, { zoomControl: false, attributionControl: true })
    .setView([position.value.lat, position.value.lng], 16)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
  }).addTo(map)

  // Своя иконка: стандартную Leaflet ищет по путям, которых в сборке нет
  const icon = L.divIcon({ className: 'address__marker', iconSize: [26, 34], iconAnchor: [13, 34] })
  const marker = L.marker([position.value.lat, position.value.lng], { icon, draggable: true }).addTo(map)

  marker.on('dragend', () => {
    const { lat, lng } = marker.getLatLng()
    position.value = { lat, lng }
  })

  // Клик по карте переставляет точку
  map.on('click', (event) => {
    position.value = { lat: event.latlng.lat, lng: event.latlng.lng }
    marker.setLatLng(event.latlng)
  })

  return {
    setCenter: (lat, lng, zoom) => map.setView([lat, lng], zoom ?? map.getZoom()),
    setMarker: (lat, lng) => marker.setLatLng([lat, lng]),
    zoomBy: step => map.setZoom(map.getZoom() + step),
    destroy: () => map.remove(),
  }
}

async function mountMap() {
  if (handle || !mapHost.value) return

  if (yandexKey) {
    try {
      handle = await mountYandex(mapHost.value)
      return
    }
    catch {
      // Ключ просрочен или Яндекс недоступен — показываем карту,
      // а не пустой прямоугольник на месте выбора точки
      mapHost.value.innerHTML = ''
    }
  }

  handle = await mountLeaflet(mapHost.value)
}

/** Определение местоположения браузером — по кнопке, без автозапроса */
function locate() {
  if (!navigator.geolocation) {
    locateError.value = t('ui.appshell.addressDetailsModal.geoUnsupported')
    return
  }
  locating.value = true
  locateError.value = ''
  navigator.geolocation.getCurrentPosition(
    ({ coords: found }) => {
      locating.value = false
      position.value = { lat: found.latitude, lng: found.longitude }
      handle?.setMarker(found.latitude, found.longitude)
      handle?.setCenter(found.latitude, found.longitude, 17)
    },
    error => {
      locating.value = false
      locateError.value = error.code === error.PERMISSION_DENIED
        ? t('ui.appshell.addressDetailsModal.geoDenied')
        : t('ui.appshell.addressDetailsModal.geoFailed')
    },
    { enableHighAccuracy: true, timeout: 10_000 },
  )
}

function zoom(step: number) {
  handle?.zoomBy(step)
}

/** Отдаём наверх и поля, и точку на карте — иначе заполненное никуда не уходит */
function apply() {
  emit('submit', {
    flat: flat.value,
    entrance: entrance.value,
    floor: floor.value,
    intercom: intercom.value,
    comment: comment.value,
    lat: position.value.lat,
    lng: position.value.lng,
    regionId: regionId.value || null,
  })
}

// Карту создаём после открытия окна: до этого её контейнера нет в DOM
watch(() => props.modelValue, async open => {
  if (!open) return
  await nextTick()
  await mountMap()
  handle?.setCenter(position.value.lat, position.value.lng)
})

onBeforeUnmount(() => {
  handle?.destroy()
  handle = null
})

const flat = ref('')
const entrance = ref('')
const floor = ref('')
const intercom = ref('')
const comment = ref('')
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="address-overlay" @click.self="emit('update:modelValue', false)">
      <div ref="panel" class="address" role="dialog" aria-modal="true" :aria-label="$t('ui.appshell.addressDetailsModal.kudaDostavitZakaz')" tabindex="-1">
        <div class="address__panel">
          <div class="address__search">
            <p class="address__search-text">{{ $t('ui.appshell.addressDetailsModal.kudaDostavitZakaz') }}</p>
          </div>

          <p class="address__hint">
            {{ $t('ui.appshell.addressDetailsModal.ukazhiteDopolnitelnoInformaciyuZakazu') }}<br>
            {{ $t('ui.appshell.addressDetailsModal.naprimerKakDobratsyaIli') }}
          </p>

          <label class="address__field">
            <span class="address__title">{{ $t('ui.appshell.addressDetailsModal.region') }}</span>
            <select v-model="regionId" class="address__select">
              <option value="">{{ $t('ui.appshell.addressDetailsModal.regionPlaceholder') }}</option>
              <option v-for="region in regions" :key="region.id" :value="region.id">{{ region.title }}</option>
            </select>
          </label>

          <div class="address__row">
            <label class="address__field address__field--third">
              <span class="address__title">{{ $t('ui.appshell.addressDetailsModal.kvartira') }}</span>
              <input v-model="flat" type="text" maxlength="10" :placeholder="$t('ui.appshell.addressDetailsModal.nomerKv')">
            </label>
            <label class="address__field address__field--third">
              <span class="address__title">{{ $t('ui.appshell.addressDetailsModal.podezd') }}</span>
              <input v-model="entrance" type="text" maxlength="10" :placeholder="$t('ui.appshell.addressDetailsModal.podezd')">
            </label>
            <label class="address__field address__field--third">
              <span class="address__title">{{ $t('ui.appshell.addressDetailsModal.etazh') }}</span>
              <input v-model="floor" type="text" maxlength="10" :placeholder="$t('ui.appshell.addressDetailsModal.etazh')">
            </label>
          </div>

          <label class="address__field">
            <span class="address__title">{{ $t('ui.appshell.addressDetailsModal.parolPodezda') }}</span>
            <input v-model="intercom" type="text" maxlength="30" :placeholder="$t('ui.appshell.addressDetailsModal.parolPodezda')">
          </label>

          <label class="address__field">
            <span class="address__title">{{ $t('ui.appshell.addressDetailsModal.tekstKommentariya') }}</span>
            <input v-model="comment" type="text" maxlength="300" :placeholder="$t('ui.appshell.addressDetailsModal.vvediteTekstKommentariya')">
          </label>

          <button type="button" class="address__submit" @click="apply">{{ $t('ui.appshell.addressDetailsModal.prodolzhit') }}</button>
        </div>

        <div class="address__map">
          <div ref="mapHost" class="address__map-canvas" />

          <div class="address__map-zoom">
            <button type="button" :aria-label="$t('ui.appshell.addressDetailsModal.priblizit')" @click="zoom(1)">+</button>
            <button type="button" :aria-label="$t('ui.appshell.addressDetailsModal.otdalit')" @click="zoom(-1)">−</button>
          </div>

          <button
            type="button"
            class="address__locate"
            :disabled="locating"
            :aria-label="$t('ui.appshell.addressDetailsModal.opredelitMoeMestopolozhenie')"
            @click="locate"
          >
            <UiIcon name="location" :size="22" color="#1F2026" />
          </button>

          <p v-if="locateError" class="address__locate-error" role="alert">{{ locateError }}</p>

          <p class="address__coords">{{ coords }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.address-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--overlay-z);
  display: grid;
  place-items: center;
  background: var(--overlay-bg);
}

.address {
  display: flex;
  gap: 24px;
  width: 1100px;
  padding: 24px;
  border-radius: var(--dialog-radius);
  background: var(--color-surface);
}

.address__panel { width: 505px; }

.address__search {
  display: flex;
  align-items: center;
  height: 77.7px;
  padding-inline: 20px;
  border-radius: 27.5px;
  background: #F2F4F7;
}

.address__search-text {
  margin: 0;
  font-weight: 600;
  font-size: var(--text-3xl);
  color: #101010;
}

.address__hint {
  /* Подсказка отбита от заголовка и от первой группы полей */
  margin: 18px 0 26px;
  font-weight: 400;
  font-size: var(--text-xl);
  line-height: 24px;
  color: #7C8A94;
}

.address__row { display: flex; gap: 16.7px; }

.address__field { display: block; margin-bottom: 24px; }
.address__field--third { width: 157.2px; }

.address__title {
  display: block;
  /* 10px вместо 6: подпись 22px прилипала к полю */
  margin-bottom: 10px;
  font-weight: 600;
  font-size: var(--text-3xl);
  line-height: 31px;
  color: #000000;
}

.address__field select,
.address__field input {
  width: 100%;
  height: 66.7px;
  padding-inline: 18.2px;
  border: 1px solid #EBEFF2;
  border-radius: 18.2px;
  background: var(--color-surface);
  outline: none;
  font: var(--type-input);
  color: var(--input-color);
}

.address__field input::placeholder { color: var(--input-placeholder); }

/* Select-у нужна своя стрелка: `appearance: none` снимает системную, иначе
   она рисуется поверх нашей рамки и ломает высоту поля. */
.address__select {
  appearance: none;
  cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, #7C8A94 50%),
                    linear-gradient(135deg, #7C8A94 50%, transparent 50%);
  background-position: calc(100% - 22px) 29px, calc(100% - 15px) 29px;
  background-size: 7px 7px, 7px 7px;
  background-repeat: no-repeat;
}

.address__submit {
  width: 100%;
  border: 0;
  background: var(--color-brand);
  color: var(--color-on-brand);
  cursor: pointer;
  font: var(--type-button);
  height: var(--control-height);
  border-radius: var(--control-radius);
}

.address__map {
  position: relative;
  flex: 1;
  overflow: hidden;
  border-radius: 24px;
  background: #E8EEF2;
}

/* Холст карты занимает всю панель; Leaflet рисует тайлы внутрь */
.address__map-canvas {
  width: 100%;
  height: 100%;
}

/* Кнопка «моё местоположение» — рядом с зумом, как в макете */
.address__locate {
  position: absolute;
  right: 14px;
  /* Над блоком зума: он занимает 52..130, кнопка идёт с 140 */
  bottom: 140px;
  z-index: 500;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 14px;
  background: var(--color-surface);
  box-shadow: 0 2px 10px rgb(17 17 17 / 12%);
  cursor: pointer;
}

.address__locate:disabled { opacity: .6; cursor: progress; }

.address__locate-error {
  position: absolute;
  right: 14px;
  bottom: 196px;
  z-index: 500;
  margin: 0;
  padding: 8px 12px;
  border-radius: 12px;
  background: #FFF0F0;
  font-size: var(--text-sm);
  color: #C3271F;
}

.address__map-zoom {
  position: absolute;
  z-index: 500;
  right: 14px;
  bottom: 52px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.address__map-zoom button {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: var(--color-surface);
  font-size: var(--text-2xl);
  line-height: 1;
  color: var(--color-text);
  box-shadow: 0 4px 12px rgb(31 32 38 / 18%);
  cursor: pointer;
}

.address__coords {
  position: absolute;
  z-index: 500;
  /* Выше подписи OpenStreetMap, которую Leaflet держит в правом нижнем углу */
  bottom: 26px;
  left: 50%;
  margin: 0;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgb(255 255 255 / 92%);
  font-size: var(--text-sm);
  color: var(--color-text);
  transform: translateX(-50%);
}

</style>

<style>
/* Маркер Leaflet рисуется вне scoped-дерева, поэтому стиль глобальный */
.address__marker {
  border-radius: 50% 50% 50% 0;
  background: #E5322D;
  box-shadow: 0 2px 8px rgb(17 17 17 / 25%);
  transform: rotate(-45deg);
  cursor: grab;
}

.address__marker::after {
  content: '';
  display: block;
  width: 10px;
  height: 10px;
  margin: 8px auto;
  border-radius: 50%;
  background: #FFFFFF;
}
</style>
