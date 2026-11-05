/**
 * Save a new delivery address — `POST /common/user-location-create/`
 * (UserLocationCreateView + UserLocationCreateSerializer).
 *
 * Checkout used to mint its own client-side id (`a${n}`) here and never call
 * the backend at all: `orders/index.post.ts` only forwards `location_id`
 * when it looks like a real UUID, so the address never reached the order,
 * and a reload wiped it. This is what was missing.
 *
 * The backend resolves district/region itself from lat/lng (reverse
 * geocoding) when no address text is given, and sets it as the promoted
 * "current district" on the user's profile — same shape the GET route
 * already documents.
 */
interface UpstreamLocation {
  id: string
  title: string | null
  region_name?: string | null
  district_name?: string | null
  address: string | null
  is_active: boolean
}

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const body = await readBody<{
    flat?: string
    entrance?: string
    floor?: string
    intercom?: string
    comment?: string
    lat?: number
    lng?: number
    /*
     * Область покупатель выбирает сам. Сериализатор бэкенда ставит свою
     * догадку только если поле пустое («An explicit region in the payload
     * always wins over the guess»), так что выбор руками всегда главнее
     * геокодера — а когда геокодер недоступен, он единственный источник.
     */
    regionId?: string | null
  }>(event)

  const regionId = String(body?.regionId ?? '')
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(regionId)

  const location = await upstream<UpstreamLocation>(event, '/common/user-location-create/', {
    method: 'POST',
    auth: true,
    body: {
      latitude: body?.lat,
      longitude: body?.lng,
      apartment: body?.flat || '',
      entrance: body?.entrance || '',
      floor: body?.floor || '',
      door_password: body?.intercom || '',
      ...(isUuid ? { region: regionId } : {}),
    },
  })

  // Same shape as GET /user/addresses, so the checkout page can push this
  // straight into its `addresses` list without a second round trip.
  const street = (location.address ?? '').trim()
  const geo = [location.district_name, location.region_name].filter(Boolean).join(', ')
  const title = street || geo || (location.title ?? '').trim()

  return ok({ id: location.id, title, subtitle: geo === title ? '' : geo })
})
