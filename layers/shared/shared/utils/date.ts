/**
 * Даты в одном формате на весь проект — дд.мм.гггг.
 * Считаем от сегодняшнего дня, чтобы демо-данные не выглядели просроченными.
 */
export function formatDate(value: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(value.getDate())}.${pad(value.getMonth() + 1)}.${value.getFullYear()}`
}

export function dateIn(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return formatDate(date)
}
