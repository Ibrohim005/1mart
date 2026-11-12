/**
 * Ключи ЭЦП (E-IMZO) на компьютере пользователя.
 *
 * В бою ключи перечисляет и подписывает приложение E-IMZO через свой
 * JS-клиент (e-imzo.js / e-imzo-client.js, локальный сокет 127.0.0.1:64443):
 * `EIMZOClient.listAllUserKeys` → `loadKey` → `createPkcs7(challenge)`.
 * Бэкенд получает только подпись PKCS#7 и проверяет её сам.
 *
 * Сейчас список и «подпись» даёт мок, чтобы экран работал целиком.
 * TODO: Connect to E-IMZO client — заменить listKeys и sign, остальной экран не меняется.
 */
export interface EimzoKey {
  id: string
  /** Владелец сертификата, как в нём записан */
  owner: string
  companyName: string
  inn: string
  /** Срок действия, ISO-дата */
  validTo: string
}

export function useEimzo() {
  const api = useApi()

  async function listKeys(): Promise<EimzoKey[]> {
    return api.get<EimzoKey[]>('/auth/eimzo/keys')
  }

  async function sign(key: EimzoKey, challenge: string): Promise<string> {
    return `mock-pkcs7:${key.id}:${challenge}`
  }

  return { listKeys, sign }
}
