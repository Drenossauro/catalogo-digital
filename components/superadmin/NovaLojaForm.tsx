'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { THEMES } from '@/lib/themes'

export default function NovaLojaForm() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [maxInstallments, setMaxInstallments] = useState('1')
  const [theme, setTheme] = useState('prata')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(value: string) {
    setName(value)
    // Auto-generate slug from name
    const generated = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
    setSlug(generated)
  }

  function handleSlugChange(value: string) {
    // Only allow lowercase letters, digits, hyphens
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const res = await fetch('/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug,
        whatsappNumber,
        maxInstallments,
        theme,
        adminEmail,
        adminPassword,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Erro ao criar loja.')
      setSaving(false)
      return
    }

    router.push('/superadmin/lojas')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full max-w-lg">

      {/* Nome da loja */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
          Nome da loja *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="border-b border-white/15 bg-transparent px-0 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
          placeholder="Ex: Pratas da Nay"
        />
      </div>

      {/* Slug */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
          Slug / URL *
        </label>
        <div className="flex items-center border-b border-white/15 py-2.5">
          <span className="text-xs text-white/30 shrink-0">vitrine.com/loja/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            required
            pattern="[a-z0-9-]+"
            className="flex-1 bg-transparent text-sm text-white focus:outline-none pl-0.5 placeholder:text-white/20"
            placeholder="pratas-da-nay"
          />
        </div>
        <p className="text-xs text-white/20">Apenas letras minúsculas, números e hífens.</p>
      </div>

      {/* WhatsApp */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
          WhatsApp
        </label>
        <input
          type="text"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, '').slice(0, 13))}
          maxLength={13}
          className="border-b border-white/15 bg-transparent px-0 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
          placeholder="5567992486473"
        />
      </div>

      {/* Parcelamento */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
          Parcelamento máximo
        </label>
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

      {/* Tema */}
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

      {/* Divisor */}
      <div className="border-t border-white/8 pt-4">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-6">
          Acesso do admin
        </p>

        {/* E-mail */}
        <div className="flex flex-col gap-1.5 mb-8">
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
            E-mail do admin *
          </label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
            className="border-b border-white/15 bg-transparent px-0 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
            placeholder="admin@loja.com"
          />
        </div>

        {/* Senha */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
            Senha do admin *
          </label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
            minLength={8}
            className="border-b border-white/15 bg-transparent px-0 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors placeholder:text-white/20"
            placeholder="Mínimo 8 caracteres"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-white text-[#0F0F0F] py-3.5 text-sm tracking-widest uppercase font-medium hover:bg-white/90 disabled:opacity-40 transition-colors cursor-pointer"
      >
        {saving ? 'Criando...' : 'Criar loja'}
      </button>
    </form>
  )
}
