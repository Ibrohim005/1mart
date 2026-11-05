/**
 * Адрес со слэшем на конце отдавал ту же страницу, что и без него, —
 * поисковик видел две страницы с одинаковым содержимым. Уводим на
 * вариант без слэша постоянным редиректом.
 */
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Корень и служебные адреса не трогаем
  if (path === '/' || path.startsWith('/_') || path.startsWith('/api') || !path.endsWith('/')) return

  return sendRedirect(event, path.slice(0, -1) + url.search, 301)
})
