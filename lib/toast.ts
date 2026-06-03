type ToastType = 'success' | 'error' | 'info'

export type ToastPayload = {
  id: string
  message: string
  type: ToastType
  duration?: number
}

type Listener = (t: ToastPayload) => void
let listeners: Listener[] = []

export function toast(message: string, type: ToastType = 'success', duration = 3500) {
  const id = Math.random().toString(36).slice(2)
  listeners.forEach(fn => fn({ id, message, type, duration }))
}

export function subscribeToast(fn: Listener) {
  listeners.push(fn)
  return () => { listeners = listeners.filter(l => l !== fn) }
}
