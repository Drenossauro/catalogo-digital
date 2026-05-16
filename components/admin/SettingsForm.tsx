'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

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

    if (!res.ok) {
      setError('Erro ao salvar configurações.')
      setSaving(false)
      return
    }

    setSaved(true)
    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Nome da loja</label>
        <input
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Ex: Prata da Nay"
        />
        <p className="text-xs text-gray-400">Aparece no topo do catálogo público.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Número do WhatsApp</label>
        <input
          type="text"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
          required
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="5511999999999"
        />
        <p className="text-xs text-gray-400">Código do país + DDD + número, só números. Ex: 5511999999999</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Parcelamento máximo</label>
        <select
          value={maxInstallments}
          onChange={(e) => setMaxInstallments(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
        >
          <option value="1">Somente à vista</option>
          {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
            <option key={n} value={String(n)}>Até {n}x</option>
          ))}
        </select>
        <p className="text-xs text-gray-400">
          O valor por parcela é calculado automaticamente dividindo o total do pedido.
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {saved && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle size={16} />
          Configurações salvas com sucesso!
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-fit bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors cursor-pointer"
      >
        {saving ? 'Salvando...' : 'Salvar configurações'}
      </button>
    </form>
  )
}
