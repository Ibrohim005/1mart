import type { MockEvent } from './visitor'
import { perVisitor } from './visitor'

/**
 * Профиль в моке — тоже «одно состояние на посетителя» (см. `cart-state.ts`):
 * иначе один открывший демо видел бы сохранения другого.
 *
 * TODO: Connect to backend — на бэкенде это `apps.users.models.User`.
 */
export interface ProfileState {
  fullName: string
  birthDate: string
  gender: 'male' | 'female'
  /** Файл никуда не пишем — только помним, что он был выбран */
  hasAvatar: boolean
}

function seed(): ProfileState {
  return {
    fullName: 'Отакулов Ферузбек',
    birthDate: '2004-03-06',
    gender: 'male',
    hasAvatar: false,
  }
}

const profiles = perVisitor<ProfileState>(seed)

export function profileState(event: MockEvent) {
  return profiles.get(event)
}

/** Заглушка вместо настоящего файла — только чтобы GET после «загрузки» не был пуст */
export const MOCK_AVATAR_URL = '/mock/trust-dog.webp'
