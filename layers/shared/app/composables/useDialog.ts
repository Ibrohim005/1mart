import type { Ref } from 'vue'

/**
 * Общее поведение любого диалога: блокировка прокрутки фона, ловушка фокуса,
 * возврат фокуса на вызвавший элемент и закрытие по Esc.
 *
 * Держим это в одном месте, потому что часть диалогов собрана на UiModal,
 * а часть — на собственном оверлее; поведение у них должно быть одинаковым.
 */

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Последний элемент, по которому нажимали. Нужен как запасной вариант для
 * WebKit: в Safari клик по кнопке её не фокусирует, поэтому на момент открытия
 * диалога `document.activeElement` там равен body и возвращать фокус некуда.
 */
let lastPointerTarget: HTMLElement | null = null

if (import.meta.client) {
  document.addEventListener('pointerdown', event => {
    const target = event.target as HTMLElement | null
    lastPointerTarget = target?.closest<HTMLElement>(FOCUSABLE) ?? null
  }, true)
}

/** Сколько диалогов открыто сейчас — прокрутку возвращаем только последнему */
let lockCount = 0
let savedOverflow = ''
let savedPaddingRight = ''

function lockScroll() {
  if (lockCount++ > 0) return
  const body = document.body
  // Компенсируем ширину полосы прокрутки, иначе страница дёргается при открытии
  const gap = window.innerWidth - document.documentElement.clientWidth
  savedOverflow = body.style.overflow
  savedPaddingRight = body.style.paddingRight
  body.style.overflow = 'hidden'
  if (gap > 0) body.style.paddingRight = `${gap}px`
}

function unlockScroll() {
  if (lockCount === 0) return
  if (--lockCount > 0) return
  document.body.style.overflow = savedOverflow
  document.body.style.paddingRight = savedPaddingRight
}

function focusablesIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter(el => el.offsetParent !== null || getComputedStyle(el).position === 'fixed')
}

export function useDialog(
  isOpen: Ref<boolean>,
  options: { panel: Ref<HTMLElement | null>, onClose: () => void },
) {
  let trigger: HTMLElement | null = null
  let locked = false

  function onKeydown(event: KeyboardEvent) {
    if (!isOpen.value) return

    if (event.key === 'Escape') {
      event.stopPropagation()
      options.onClose()
      return
    }

    if (event.key !== 'Tab') return

    const panel = options.panel.value
    if (!panel) return
    const items = focusablesIn(panel)
    if (!items.length) {
      event.preventDefault()
      panel.focus()
      return
    }

    const first = items[0]!
    const last = items[items.length - 1]!
    const active = document.activeElement as HTMLElement | null

    if (event.shiftKey && (active === first || !panel.contains(active))) {
      event.preventDefault()
      last.focus()
    }
    else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function open() {
    if (locked) return
    locked = true
    const active = document.activeElement as HTMLElement | null
    trigger = active && active !== document.body ? active : lastPointerTarget
    lockScroll()
    nextTick(() => {
      const panel = options.panel.value
      if (!panel) return
      const items = focusablesIn(panel)
      ;(items[0] ?? panel).focus()
    })
  }

  function release() {
    if (!locked) return
    locked = false
    unlockScroll()

    // Фокус возвращаем на элемент, который открыл диалог, — иначе он уходит на body.
    // Обязательно после снятия диалога со страницы: WebKit сбрасывает фокус на body,
    // если вернуть его, пока панель ещё в DOM.
    const target = trigger
    trigger = null
    // Возвращаем фокус двумя шагами. Сразу — для Chrome и Firefox, они этого
    // достаточно. Затем ещё раз после снятия панели: WebKit переводит фокус
    // на body уже после удаления и затирает первый возврат.
    if (target?.isConnected) target.focus()
    nextTick(() => {
      setTimeout(() => {
        if (target?.isConnected && document.activeElement !== target) target.focus()
      }, 0)
    })
  }

  watch(isOpen, value => (value ? open() : release()), { immediate: true })

  onMounted(() => window.addEventListener('keydown', onKeydown, true))
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown, true)
    release()
  })
}
