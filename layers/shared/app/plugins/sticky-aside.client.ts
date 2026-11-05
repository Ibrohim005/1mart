/**
 * Поведение закреплённых боковых колонок (`.sticky-aside`).
 *
 * Колонка ниже экрана раньше обрезалась: ей ставили max-height в высоту
 * экрана и прятали полосу прокрутки, поэтому низ («Возврат и гарантия»,
 * карточка продавца) не был виден и до него было не добраться.
 *
 * Теперь колонка ничем не обрезана. Помещается на экран — стоит под шапкой.
 * Выше экрана — едет вместе со страницей, пока не покажется её низ, и там
 * останавливается; при прокрутке вверх так же доезжает до своего верха.
 * Человек видит колонку целиком, а колесо мыши всегда крутит страницу.
 */
export default defineNuxtPlugin(() => {
  const SELECTOR = '.sticky-aside'
  const items = new Set<HTMLElement>()
  let lastScroll = 0
  let frame = 0

  function readVar(name: string, fallback: number): number {
    const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name))
    return Number.isFinite(value) ? value : fallback
  }

  function place(el: HTMLElement, delta: number) {
    const height = el.offsetHeight
    const top = readVar('--sticky-top', 152)
    const bottom = readVar('--sticky-gap', 16)

    // Помещается целиком — держим под шапкой
    if (height <= window.innerHeight - top - bottom) {
      el.style.top = `${top}px`
      return
    }

    // Выше экрана: вниз доезжаем до низа колонки, вверх — до её верха
    const lowest = window.innerHeight - height - bottom
    const current = Number.parseFloat(el.style.top) || top
    el.style.top = `${Math.min(Math.max(current - delta, lowest), top)}px`
  }

  function update() {
    frame = 0
    const delta = window.scrollY - lastScroll
    lastScroll = window.scrollY
    for (const el of items) {
      if (el.isConnected) place(el, delta)
      else items.delete(el)
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update)
  }

  /** Новые колонки после перехода по страницам подхватываем, уже известные не трогаем */
  function scan() {
    scanQueued = false
    for (const el of document.querySelectorAll<HTMLElement>(SELECTOR)) {
      if (items.has(el)) continue
      el.style.top = `${readVar('--sticky-top', 152)}px`
      items.add(el)
    }
  }

  /**
   * Наблюдатель срабатывает на каждое изменение разметки — тосты, диалоги,
   * карусель. Полный обход по каждому такому событию был лишним: собираем
   * их в один проход на кадр и пропускаем изменения без новых узлов.
   */
  let scanQueued = false

  function queueScan(records: MutationRecord[]) {
    if (scanQueued) return
    const hasNewNodes = records.some(record => record.addedNodes.length > 0)
    if (!hasNewNodes) return
    scanQueued = true
    requestAnimationFrame(scan)
  }

  onNuxtReady(() => {
    lastScroll = window.scrollY
    scan()
    new MutationObserver(queueScan).observe(document.body, { childList: true, subtree: true })
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
  })
})
