'use client'

import { useState, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type SlugState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function CadastroPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [slug, setSlug] = useState('')
  const [slugState, setSlugState] = useState<SlugState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-preenche slug a partir do nome
  useEffect(() => {
    if (name) {
      const auto = toSlug(name)
      setSlug(auto)
    }
  }, [name])

  // Valida slug com debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!slug) { setSlugState('idle'); return }
    if (!/^[a-z0-9-]{3,50}$/.test(slug)) { setSlugState('invalid'); return }

    setSlugState('checking')
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/slug-check?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()
      setSlugState(data.available ? 'available' : 'taken')
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (slugState !== 'available' && slugState !== 'idle') return
    setError(null)
    setLoading(true)

    const res = await fetch('/api/auth/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, slug }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Erro ao criar conta.')
      setLoading(false)
      return
    }

    // Auto-login após cadastro
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Conta criada, mas erro ao entrar. Tente fazer login.')
      setLoading(false)
      return
    }

    router.push('/planos')
  }

  const slugHint = {
    idle: null,
    checking: <span className="text-[#1a1a1a]/30">Verificando...</span>,
    available: <span className="text-green-600">✓ Disponível</span>,
    taken: <span className="text-red-500">Já está em uso</span>,
    invalid: <span className="text-red-500">Use 3–50 caracteres: letras, números, hífens</span>,
  }[slugState]

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1a1a1a] mb-5">
            <span className="font-serif text-xl text-[#FAF8F5] leading-none">✦</span>
          </div>
          <h1 className="font-serif text-3xl tracking-wide text-[#1a1a1a]">Criar conta</h1>
          <p className="text-sm text-[#1a1a1a]/40 mt-2">Comece gratuitamente, sem cartão</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">
              Seu nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="João Silva"
              className="border-b border-black/15 bg-transparent px-0 py-2.5 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
            />
          </div>

          {/* E-mail */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              className="border-b border-black/15 bg-transparent px-0 py-2.5 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
            />
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="mínimo 8 caracteres"
              className="border-b border-black/15 bg-transparent px-0 py-2.5 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
            />
          </div>

          {/* Slug da loja */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">
              Endereço da loja
            </label>
            <div className="flex items-baseline gap-1 border-b border-black/15 py-2.5 focus-within:border-[#1a1a1a] transition-colors">
              <span className="text-xs text-[#1a1a1a]/30 shrink-0">vitrine.app/loja/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(toSlug(e.target.value))}
                required
                placeholder="minha-loja"
                className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
              />
            </div>
            <p className="text-[11px] min-h-[16px]">{slugHint}</p>
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || slugState === 'taken' || slugState === 'invalid' || slugState === 'checking'}
            className="mt-2 bg-[#1a1a1a] text-white py-3.5 text-sm tracking-widest uppercase font-medium hover:bg-black disabled:opacity-40 transition-colors cursor-pointer"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-xs text-[#1a1a1a]/40 mt-8">
          Já tem conta?{' '}
          <Link href="/admin/login" className="underline underline-offset-2 hover:text-[#1a1a1a]">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
