'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ChevronDown, Store } from 'lucide-react'

interface StoreOption {
  storeId: string
  storeSlug: string
  storeName: string
  role: string
}

export default function StoreSwitcher() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [stores, setStores] = useState<StoreOption[]>([])
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentStoreId = session?.user?.storeId

  useEffect(() => {
    fetch('/api/user/stores')
      .then(r => r.json())
      .then((data: StoreOption[]) => {
        setStores(data)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Only render if user has multiple stores
  if (!loaded || stores.length <= 1) return null

  const currentStore = stores.find(s => s.storeId === currentStoreId) ?? stores[0]

  async function switchStore(storeId: string) {
    setOpen(false)
    await update({ preferredStoreId: storeId })
    router.refresh()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:bg-black/5 rounded transition-colors cursor-pointer max-w-[140px]"
      >
        <Store size={13} strokeWidth={1.5} className="shrink-0" />
        <span className="truncate">{currentStore?.storeName}</span>
        <ChevronDown size={12} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-black/10 shadow-lg z-50 py-1">
          {stores.map((store) => (
            <button
              key={store.storeId}
              onClick={() => switchStore(store.storeId)}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                store.storeId === currentStoreId
                  ? 'bg-black/5 text-[#1a1a1a] font-medium'
                  : 'text-[#1a1a1a]/70 hover:bg-black/3 hover:text-[#1a1a1a]'
              }`}
            >
              <p className="truncate">{store.storeName}</p>
              <p className="text-[10px] text-[#1a1a1a]/30 font-mono">/loja/{store.storeSlug}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
