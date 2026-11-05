export interface User {
  id: number
  phone: string
  firstName: string
  lastName: string
  email?: string
  birthDate?: string
  gender?: 'male' | 'female'
  avatar?: string
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

/** Ответ на запрос кода: сколько секунд до повторной отправки */
export interface OtpChallenge {
  phone: string
  resendAfterSec: number
  codeLength: number
}
