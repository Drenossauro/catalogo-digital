'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
        <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">
          Nome da loja *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="border-b border-black/15 bg-transparent px-0 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
          placeholder="Ex: Pratas da Nay"
        />
      </div>

      {/* Slug */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">
          Slug / URL *
        </label>
        <div className="flex items-center border-b border-black/15 py-3">
          <span className="text-xs text-[#1a1a1a]/40 shrink-0">catalogo.com/loja/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            required
            pattern="[a-z0-9-]+"
            className="flex-1 bg-transparent text-sm focus:outline-none pl-0.5"
            placeholder="pratas-da-nay"
          />
        </div>
        <p className="text-xs text-[#1a1a1a]/30">Apenas letras minúsculas, números e hífens.</p>
      </div>

      {/* WhatsApp */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">
          WhatsApp
        </label>
        <input
          type="text"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
          className="border-b border-black/15 bg-transparent px-0 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
          placeholder="5567992486473"
        />
      </div>

      {/* Parcelamento */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">
          Parcelamento máximo
        </label>
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
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">
          Tema
        </label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="border-b border-black/15 bg-transparent px-0 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors appearance-none cursor-pointer"
        >
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Divisor */}
      <div className="border-t border-black/8 pt-4">
        <p className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider mb-6">
          Acesso do admin
        </p>

        {/* E-mail */}
        <div className="flex flex-col gap-1.5 mb-8">
          <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">
            E-mail do admin *
          </label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            required
            className="border-b border-black/15 bg-transparent px-0 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
            placeholder="admin@loja.com"
          />
        </div>

        {/* Senha */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">
            Senha do admin *
          </label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
            minLength={8}
            className="border-b border-black/15 bg-transparent px-0 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
            placeholder="Mínimo 8 caracteres"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-[#1a1a1a] text-white py-3.5 text-sm tracking-widest uppercase font-medium hover:bg-black disabled:opacity-40 transition-colors cursor-pointer"
      >
        {saving ? 'Criando...' : 'Criar loja'}
      </button>
    </form>
  )
}
