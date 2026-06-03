'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  params: Promise<{ token: string }>
}

export default function ConvitePage({ params }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [token, setToken] = useState('')

  useEffect(() => {
    params.then(({ token: t }) => {
      setToken(t)
      // Verificar o convite
      fetch(`/api/convite/${t}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.valid) {
            setMessage(`Você foi convidado para gerenciar "${data.storeName}".`)
            setStatus('ok')
          } else {
            setMessage(data.error ?? 'Convite inválido ou expirado.')
            setStatus('error')
          }
        })
        .catch(() => { setMessage('Erro ao verificar convite.'); setStatus('error') })
    })
  }, [params])

  async function handleAccept() {
    const res = await fetch(`/api/convite/${token}`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setMessage(data.error ?? 'Erro ao aceitar convite.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1a1a1a] mb-6">
          <span className="font-serif text-xl text-[#FAF8F5] leading-none">✦</span>
        </div>
        <h1 className="font-serif text-2xl text-[#1a1a1a] mb-4">Convite para gerente</h1>

        {status === 'loading' && (
          <p className="text-sm text-[#1a1a1a]/50">Verificando convite...</p>
        )}

        {status === 'ok' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#1a1a1a]/70">{message}</p>
            <button
              onClick={handleAccept}
              className="bg-[#1a1a1a] text-white py-3.5 text-sm tracking-widest uppercase font-medium hover:bg-black transition-colors cursor-pointer"
            >
              Aceitar convite
            </button>
            <p className="text-xs text-[#1a1a1a]/40">
              Você precisará estar logado ou criar uma conta para aceitar.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-red-500">{message}</p>
            <Link href="/admin/login" className="text-sm underline underline-offset-2 text-[#1a1a1a]">
              Ir para o login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
