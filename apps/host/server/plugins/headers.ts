/**
 * Снимаем `x-powered-by: Nuxt` — заголовок раскрывает стек и ничего не даёт.
 * Nitro ставит его перед самой отправкой, поэтому убираем на хуке ответа:
 * из обычного middleware его ставят заново.
 */
type ResponseEvent = Parameters<typeof removeResponseHeader>[0]

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event: ResponseEvent) => {
    removeResponseHeader(event, 'x-powered-by')
  })
})
