'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('E-mail ou senha inválidos.')
      setLoading(false)
      return
    }

    // Redirecionar para callbackUrl ou dashboard padrão
    const callbackUrl = searchParams.get('callbackUrl') ?? '/admin/dashboard'
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1a1a1a] mb-5">
            <span className="font-serif text-xl text-[#FAF8F5] leading-none">✦</span>
          </div>
          <h1 className="font-serif text-3xl tracking-wide text-[#1a1a1a]">Vitrine</h1>
          <p className="text-sm text-[#1a1a1a]/40 mt-2 tracking-wide">Seu catálogo digital</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-b border-black/15 bg-transparent px-0 py-2.5 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-b border-black/15 bg-transparent px-0 py-2.5 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-3 bg-[#1a1a1a] text-white py-3.5 text-sm tracking-widest uppercase font-medium hover:bg-black disabled:opacity-40 transition-colors cursor-pointer"
          >
            {loading ? '...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-[#1a1a1a]/40 mt-8">
          Ainda não tem conta?{' '}
          <Link href="/cadastro" className="underline underline-offset-2 hover:text-[#1a1a1a]">
            Criar grátis
          </Link>
        </p>

        <p className="text-center text-xs text-[#1a1a1a]/20 mt-6">Vitrine · Acesso restrito</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
