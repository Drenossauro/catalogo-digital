'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

interface Settings {
  id: string
  storeName: string
  whatsappNumber: string
  maxInstallments: string
}

interface Props {
  settings: Settings | null
}

export default function SettingsForm({ settings }: Props) {
  const router = useRouter()
  const [storeName, setStoreName] = useState(settings?.storeName ?? '')
  const [whatsappNumber, setWhatsappNumber] = useState(settings?.whatsappNumber ?? '')
  const [maxInstallments, setMaxInstallments] = useState(settings?.maxInstallments ?? '1')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    setSaved(false)
    const res = await fetch('/api/configuracoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeName, whatsappNumber, maxInstallments }),
    })
    if (!res.ok) { setError('Erro ao salvar configurações.'); setSaving(false); return }
    setSaved(true)
    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">Nome da loja</label>
        <input
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
          className="border-b border-black/15 bg-transparent px-0 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
          placeholder="Ex: Pratas da Nay"
        />
        <p className="text-xs text-[#1a1a1a]/30 mt-1">Aparece no topo do catálogo público.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">Número do WhatsApp</label>
        <input
          type="text"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
          required
          className="border-b border-black/15 bg-transparent px-0 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
          placeholder="5567992486473"
        />
        <p className="text-xs text-[#1a1a1a]/30 mt-1">Código do país + DDD + número, sem espaços ou traços.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">Parcelamento máximo</label>
        <select
          value={maxInstallments}
          onChange={(e) => setMaxInstallments(e.target.value)}
          className="border-b border-black/15 bg-transparent px-0 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors appearance-none cursor-pointer"
        >
          <option value="1">Somente à vista</option>
          {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
            <option key={n} value={String(n)}>Até {n}x</option>
          ))}
        </select>
        <p className="text-xs text-[#1a1a1a]/30 mt-1">O valor por parcela é calculado dividindo o total do pedido.</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {saved && (
        <div className="flex items-center gap-2 text-sm text-[#1a1a1a]/60">
          <Check size={15} />
          Configurações salvas.
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-[#1a1a1a] text-white py-3.5 text-sm tracking-widest uppercase font-medium hover:bg-black disabled:opacity-40 transition-colors cursor-pointer"
      >
        {saving ? 'Salvando...' : 'Salvar configurações'}
      </button>
    </form>
  )
}
