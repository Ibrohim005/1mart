import { DEMO_KEYS } from '../../../utils/org-signin'

/**
 * Только для мока: ключи ЭЦП на «компьютере пользователя». В бою их перечисляет
 * клиент E-IMZO в браузере (useEimzo), бэкенд в этом не участвует.
 */
export default defineEventHandler(() => ok(DEMO_KEYS.map(key => ({
  id: key.id,
  owner: key.owner,
  companyName: key.company.name,
  inn: key.company.inn,
  validTo: key.validTo,
}))))
