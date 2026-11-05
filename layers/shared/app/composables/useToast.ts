export interface Toast {
  id: number
  text: string
  kind: 'success' | 'error'
  /** Необратимое действие должно давать возможность передумать */
  undo?: { label: string, run: () => void }
}

const items = ref<Toast[]>([])
let seq = 0

/**
 * Короткие подтверждения действий: «в корзине», «в избранном».
 * Состояние общее для всего приложения, поэтому лежит вне composable.
 */
export function useToast() {
  function show(text: string, kind: Toast['kind'] = 'success', undo?: Toast['undo']) {
    const id = ++seq
    items.value = [...items.value, { id, text, kind, undo }]
    // С кнопкой отмены даём больше времени на решение
    setTimeout(() => dismiss(id), undo ? 6000 : 3000)
  }

  function dismiss(id: number) {
    items.value = items.value.filter(item => item.id !== id)
  }

  return { items: readonly(items), show, dismiss }
}
