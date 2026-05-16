'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, Camera, Trash2, Loader2 } from 'lucide-react'
import { THEMES } from '@/lib/themes'

interface Settings {
  id: string
  storeName: string
  whatsappNumber: string
  maxInstallments: string
  theme: string
  logoUrl?: string | null
}

interface Props {
  settings: Settings | null
}

export default function SettingsForm({ settings }: Props) {
  const router = useRouter()
  const logoRef = useRef<HTMLInputElement>(null)

  const [storeName, setStoreName] = useState(settings?.storeName ?? '')
  const [whatsappNumber, setWhatsappNumber] = useState(settings?.whatsappNumber ?? '')
  const [maxInstallments, setMaxInstallments] = useState(settings?.maxInstallments ?? '1')
  const [theme, setTheme] = useState(settings?.theme ?? 'prata')
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl ?? '')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    if (!res.ok) { setError('Erro ao enviar logo.'); setUploadingLogo(false); return }
    const { url } = await res.json()
    setLogoUrl(url)
    setUploadingLogo(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    setSaved(false)
    const res = await fetch('/api/configuracoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeName, whatsappNumber, maxInstallments, theme, logoUrl: logoUrl || null }),
    })
    if (!res.ok) { setError('Erro ao salvar configurações.'); setSaving(false); return }
    setSaved(true)
    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10 w-full max-w-lg">

      {/* Logo */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">Logo da loja</span>
        <div
          onClick={() => logoRef.current?.click()}
          className="relative w-full h-20 rounded-lg overflow-hidden cursor-pointer group"
          style={{ background: '#F0EDE8' }}
        >
          {logoUrl ? (
            <>
              <Image src={logoUrl} alt="Logo" fill className="object-contain p-3" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={20} className="text-white" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#1a1a1a]/30">
              {uploadingLogo ? <Loader2 size={20} className="animate-spin" /> : (
                <>
                  <Camera size={20} strokeWidth={1.5} />
                  <span className="text-xs">Adicionar logo (PNG transparente)</span>
                </>
              )}
            </div>
          )}
        </div>
        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        {logoUrl && (
          <button type="button" onClick={() => setLogoUrl('')} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 cursor-pointer w-fit">
            <Trash2 size={12} /> Remover logo
          </button>
        )}
        <p className="text-xs text-[#1a1a1a]/30">Se tiver logo, ela substitui o nome da loja no catálogo.</p>
      </div>

      {/* Nome da loja */}
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
        <p className="text-xs text-[#1a1a1a]/30 mt-1">Aparece no catálogo quando não há logo.</p>
      </div>

      {/* WhatsApp */}
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

      {/* Parcelamento */}
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
      </div>

      {/* Tema */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">Tema do catálogo</span>
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
                boxShadow: theme === t.id ? `0 0 0 1px ${t.accent}` : undefined,
              }}
            >
              {/* preview */}
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: t.bg, border: `2px solid ${t.text}` }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: t.accent }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: t.surface }} />
                </div>
                <p
                  className="text-sm leading-tight font-medium"
                  style={{ color: t.text, fontFamily: t.fontSerif }}
                >
                  {t.name}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: t.textMuted, fontFamily: t.fontSans }}>
                  {t.fontSerif.includes('cormorant') ? 'Cormorant' :
                   t.fontSerif.includes('playfair') ? 'Playfair' : 'DM Serif'}
                  {' · '}
                  {t.fontSans.includes('jost') ? 'Jost' :
                   t.fontSans.includes('raleway') ? 'Raleway' : 'DM Sans'}
                </p>
              </div>
              {theme === t.id && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: t.accent }}
                >
                  <Check size={11} color={t.bg} strokeWidth={2.5} />
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#1a1a1a]/30">As cores e fontes mudam instantaneamente no catálogo após salvar.</p>
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
        disabled={saving || uploadingLogo}
        className="w-full bg-[#1a1a1a] text-white py-3.5 text-sm tracking-widest uppercase font-medium hover:bg-black disabled:opacity-40 transition-colors cursor-pointer"
      >
        {saving ? 'Salvando...' : 'Salvar configurações'}
      </button>
    </form>
  )
}
