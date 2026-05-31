'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { THEMES } from '@/lib/themes'

interface Store {
  id: string
  name: string
  slug: string
  whatsappNumber: string
  maxInstallments: string
  theme: string
}

interface Props { store: Store }

export default function EditLojaForm({ store }: Props) {
  const router = useRouter()
  const [name, setName] = useState(store.name)
  const [whatsappNumber, setWhatsappNumber] = useState(store.whatsappNumber)
  const [maxInstallments, setMaxInstallments] = useState(store.maxInstallments)
  const [theme, setTheme] = useState(store.theme)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    setSaved(false)
    const res = await fetch(`/api/stores/${store.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, whatsappNumber, maxInstallments, theme }),
    })
    if (!res.ok) { setError('Erro ao salvar.'); setSaving(false); return }
    setSaved(true)
    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full max-w-lg">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Nome da loja</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-b border-white/15 bg-transparent px-0 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
          placeholder="Ex: Pratas da Nay"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Slug</label>
        <p className="py-2.5 text-sm text-white/30 border-b border-white/8 font-mono">/loja/{store.slug}</p>
        <p className="text-xs text-white/20">O slug não pode ser alterado após a criação.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">WhatsApp</label>
        <input
          type="text"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
          className="border-b border-white/15 bg-transparent px-0 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
          placeholder="5567999999999"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Parcelamento máximo</label>
        <select
          value={maxInstallments}
          onChange={(e) => setMaxInstallments(e.target.value)}
          className="border-b border-white/15 bg-transparent px-0 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer"
        >
          <option value="1" className="bg-[#0F0F0F]">Somente à vista</option>
          {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
            <option key={n} value={String(n)} className="bg-[#0F0F0F]">Até {n}x</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Tema</span>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className="relative text-left rounded-xl overflow-hidden transition-all cursor-pointer"
              style={{
                background: t.bg,
                border: theme === t.id ? `2px solid ${t.accent}` : `2px solid transparent`,
              }}
            >
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: t.bg, border: `2px solid ${t.text}` }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: t.accent }} />
                </div>
                <p className="text-sm leading-tight font-medium" style={{ color: t.text, fontFamily: t.fontSerif }}>{t.name}</p>
              </div>
              {theme === t.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: t.accent }}>
                  <Check size={11} color={t.bg} strokeWidth={2.5} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && (
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Check size={15} /> Salvo com sucesso.
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-white text-[#0F0F0F] py-3.5 text-sm tracking-widest uppercase font-medium hover:bg-white/90 disabled:opacity-40 transition-colors cursor-pointer"
      >
        {saving ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  )
}
