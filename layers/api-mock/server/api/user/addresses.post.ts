/**
 * Save a new delivery address. Mirrors addresses.get.ts's id scheme (`aN`)
 * so a saved address is immediately selectable from the mock list too.
 */
let counter = 3

export default defineEventHandler(async (event) => {
  const body = await readBody<{ lat?: number, lng?: number }>(event)
  counter += 1
  return ok({
    id: `a${counter}`,
    title: `Точка на карте ${(body?.lat ?? 0).toFixed(5)}, ${(body?.lng ?? 0).toFixed(5)}`,
    subtitle: '',
  })
})
