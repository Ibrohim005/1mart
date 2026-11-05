/**
 * Генерирует QR-код на страницу приложения.
 *
 * Код рядом с кнопками сторов был заглушкой из макета и вёл в никуда —
 * человек наводил камеру и не получал ничего. Картинка собирается один раз
 * и лежит в public: в рантайме ничего считать не нужно.
 *
 * Запуск: npm run qr           — адрес берётся из NUXT_PUBLIC_GOOGLE_PLAY_URL
 *         npm run qr -- <url>  — или из аргумента
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'

const url = process.argv[2]
  || process.env.NUXT_PUBLIC_GOOGLE_PLAY_URL
  || 'https://play.google.com/store/apps/details?id=uz.zoo.elon'

const out = fileURLToPath(new URL('../apps/host/public/mock/qr-app.svg', import.meta.url))

/*
 * Уровень коррекции M — запас на случай, если код напечатают или снимут
 * под углом. Поля (margin) обязательны: без них камера не находит код
 * на светлом фоне блока.
 */
const svg = await QRCode.toString(url, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 2,
  color: { dark: '#0A0A0AFF', light: '#FFFFFFFF' },
})

writeFileSync(out, svg)
console.log(`QR на ${url}\nзаписан в ${out}`)
