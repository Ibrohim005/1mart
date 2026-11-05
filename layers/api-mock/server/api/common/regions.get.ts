import { mockLocale } from '../../../mocks/facets'

/**
 * Справочник областей для окна адреса. Без этого роута мок отвечал 404
 * на каждой странице с шапкой. Настоящий адаптер: api-backend/common/regions.
 */
const REGIONS = [
  { id: 'tashkent-city', ru: 'г. Ташкент', uz: 'Toshkent shahri' },
  { id: 'tashkent', ru: 'Ташкентская область', uz: 'Toshkent viloyati' },
  { id: 'andijan', ru: 'Андижанская область', uz: 'Andijon viloyati' },
  { id: 'bukhara', ru: 'Бухарская область', uz: 'Buxoro viloyati' },
  { id: 'fergana', ru: 'Ферганская область', uz: 'Farg\'ona viloyati' },
  { id: 'jizzakh', ru: 'Джизакская область', uz: 'Jizzax viloyati' },
  { id: 'kashkadarya', ru: 'Кашкадарьинская область', uz: 'Qashqadaryo viloyati' },
  { id: 'khorezm', ru: 'Хорезмская область', uz: 'Xorazm viloyati' },
  { id: 'namangan', ru: 'Наманганская область', uz: 'Namangan viloyati' },
  { id: 'navoi', ru: 'Навоийская область', uz: 'Navoiy viloyati' },
  { id: 'samarkand', ru: 'Самаркандская область', uz: 'Samarqand viloyati' },
  { id: 'sirdarya', ru: 'Сырдарьинская область', uz: 'Sirdaryo viloyati' },
  { id: 'surkhandarya', ru: 'Сурхандарьинская область', uz: 'Surxondaryo viloyati' },
  { id: 'karakalpakstan', ru: 'Республика Каракалпакстан', uz: 'Qoraqalpog\'iston Respublikasi' },
]

export default defineEventHandler((event) => {
  const locale = mockLocale(getHeader(event, 'accept-language'))
  return ok(REGIONS.map(region => ({ id: region.id, title: locale === 'ru' ? region.ru : region.uz })))
})
