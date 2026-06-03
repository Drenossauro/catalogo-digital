'use client'

import { useState } from 'react'
import { UserPlus, Mail } from 'lucide-react'

interface Member {
  id: string
  role: string
  acceptedAt: Date | null
  createdAt: Date | null
  email: string
  name: string
}

const ROLE_LABEL: Record<string, string> = {
  lojista: 'Lojista',
  gerente: 'Gerente',
}

export default function MembrosClient({ members }: { members: Member[] }) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setMsg(null)
    setError(null)

    const res = await fetch('/api/admin/membros/convite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()

    if (res.ok) {
      setMsg(`Convite enviado para ${email}!`)
      setEmail('')
    } else {
      setError(data.error ?? 'Erro ao enviar convite.')
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Lista de membros */}
      <div>
        <p className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider mb-4">
          Membros atuais ({members.length})
        </p>
        <div className="border border-black/10 divide-y divide-black/5">
          {members.map((m) => (
            <div key={m.id} className="px-4 py-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1a1a1a] truncate">{m.name || m.email}</p>
                <p className="text-xs text-[#1a1a1a]/40 truncate">{m.email}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  m.role === 'lojista'
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-black/8 text-[#1a1a1a]/60'
                }`}>
                  {ROLE_LABEL[m.role] ?? m.role}
                </span>
                {!m.acceptedAt && (
                  <p className="text-[10px] text-[#1a1a1a]/30 mt-0.5">Pendente</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Convite */}
      <div>
        <p className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider mb-4">
          Convidar gerente
        </p>
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#1a1a1a]/50">E-mail do convidado</label>
            <div className="flex items-center border-b border-black/15 focus-within:border-[#1a1a1a] transition-colors">
              <Mail size={14} className="text-[#1a1a1a]/30 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="gerente@email.com"
                className="flex-1 ml-2 bg-transparent py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
          {msg && <p className="text-xs text-green-600">{msg}</p>}

          <button
            type="submit"
            disabled={sending}
            className="flex items-center justify-center gap-2 bg-[#1a1a1a] text-white py-3 text-sm tracking-widest uppercase font-medium hover:bg-black disabled:opacity-40 transition-colors cursor-pointer"
          >
            <UserPlus size={15} />
            {sending ? 'Enviando...' : 'Enviar convite'}
          </button>

          <p className="text-xs text-[#1a1a1a]/40">
            O convidado receberá um e-mail com o link para aceitar. O convite expira em 7 dias.
            Gerentes podem gerenciar produtos, categorias e pedidos, mas não alteram configurações nem assinatura.
          </p>
        </form>
      </div>
    </div>
  )
}
