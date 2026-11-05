// Моки API кабинета продавца. Поднимают внутри Nuxt те же адреса /api/merchant/*,
// которые потом отдаст бэкенд в формате { payload, errors }. Удаляется из extends,
// когда появится слой api-backend. Рядом с каждым роутом — пометка
// «TODO: Connect to backend endpoint».
export default defineNuxtConfig({})
