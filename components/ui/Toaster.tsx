'use client'

import { useEffect, useState } from 'react'
import { subscribeToast, type ToastPayload } from '@/lib/toast'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastPayload[]>([])

  useEffect(() => {
    return subscribeToast((t) => {
      setToasts(prev => [...prev, t])
      setTimeout(() => remove(t.id), t.duration ?? 3500)
    })
  }, [])

  function remove(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 bg-white border border-black/10 shadow-lg px-4 py-3 w-80 max-w-[calc(100vw-2rem)]"
        >
          {t.type === 'success' && <CheckCircle size={16} className="text-green-600 shrink-0" />}
          {t.type === 'error'   && <XCircle    size={16} className="text-red-500 shrink-0" />}
          {t.type === 'info'    && <Info        size={16} className="text-blue-500 shrink-0" />}
          <p className="text-sm text-[#1a1a1a] flex-1 leading-snug">{t.message}</p>
          <button
            onClick={() => remove(t.id)}
            className="text-[#1a1a1a]/25 hover:text-[#1a1a1a]/60 transition-colors cursor-pointer shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
