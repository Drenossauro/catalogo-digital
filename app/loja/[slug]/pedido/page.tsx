'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MessageCircle, CheckCircle } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

interface Props {
  params: Promise<{ slug: string }>
}

// Precisa ser um client component por causa do useCart / params
export default function PedidoPage({ params }: Props) {
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const { cart, totalItems } = useCart(slug || null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [installments, setInstallments] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState('')

  useEffect(() => {
    params.then(({ slug: s }) => setSlug(s))
  }, [params])

  const total = cart.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)

  if (!slug) return null

  if (confirmed) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
          <CheckCircle size={36} className="text-green-500" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-2xl text-[#1a1a1a] mb-2">Pedido enviado!</h1>
        <p className="text-sm text-[#1a1a1a]/50 mb-8 max-w-xs">
          Seu pedido foi registrado. O WhatsApp foi aberto para você confirmar com a loja.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 text-sm font-medium"
          >
            <MessageCircle size={16} />
            Abrir WhatsApp
          </a>
          <Link
            href={`/loja/${slug}`}
            className="py-3 border border-black/15 text-sm text-[#1a1a1a] text-center hover:bg-black/5 transition-colors"
          >
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    )
  }

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-4">
        <p className="text-sm text-[#1a1a1a]/50 mb-4">Seu carrinho está vazio.</p>
        <Link href={`/loja/${slug}`} className="text-sm underline underline-offset-2 text-[#1a1a1a]">
          Voltar ao catálogo
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const items = cart.map(({ product, quantity, variantLabel }) => ({
      productId: product.id,
      quantity,
      variantLabel: variantLabel ?? undefined,
    }))

    const res = await fetch(`/api/lojas/${slug}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: name,
        customerPhone: phone,
        customerAddress: address ? { street: address } : undefined,
        notes: notes || undefined,
        installments,
        items,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Erro ao registrar pedido.')
      setSubmitting(false)
      return
    }

    // Mostra tela de confirmação e abre WhatsApp
    setWhatsappUrl(data.whatsappUrl)
    setConfirmed(true)
    window.open(data.whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link
          href={`/loja/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-[#1a1a1a]/40 hover:text-[#1a1a1a] mb-6 transition-colors"
        >
          <ChevronLeft size={15} /> Voltar ao catálogo
        </Link>

        <h1 className="font-serif text-2xl text-[#1a1a1a] mb-6">Finalizar pedido</h1>

        {/* Resumo */}
        <div className="border border-black/10 mb-8">
          <p className="px-4 py-3 text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider border-b border-black/8">
            Resumo ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
          </p>
          <ul className="divide-y divide-black/5">
            {cart.map(({ product, quantity, variantLabel }) => (
              <li key={`${product.id}:${variantLabel ?? ''}`} className="flex justify-between px-4 py-3 text-sm">
                <span className="text-[#1a1a1a]/70">
                  {quantity}x {product.name}
                  {variantLabel && <span className="text-[#1a1a1a]/40"> · {variantLabel}</span>}
                </span>
                <span className="text-[#1a1a1a] font-medium">
                  R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between px-4 py-3 border-t border-black/8 font-semibold text-sm">
            <span>Total</span>
            <span>R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">Seu nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="João Silva"
              className="border-b border-black/15 bg-transparent px-0 py-2.5 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">WhatsApp / Telefone *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="(11) 99999-9999"
              className="border-b border-black/15 bg-transparent px-0 py-2.5 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">
              Endereço <span className="font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, número, bairro, cidade"
              className="border-b border-black/15 bg-transparent px-0 py-2.5 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#1a1a1a]/50 uppercase tracking-wider">
              Observações <span className="font-normal">(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Informações adicionais, dúvidas..."
              className="border-b border-black/15 bg-transparent px-0 py-2.5 text-sm focus:outline-none focus:border-[#1a1a1a] transition-colors resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb856] text-white py-3.5 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <MessageCircle size={18} />
            {submitting ? 'Registrando...' : 'Enviar pedido no WhatsApp'}
          </button>
          <p className="text-xs text-center text-[#1a1a1a]/40">
            Seu pedido será registrado e você será redirecionado ao WhatsApp
          </p>
        </form>
      </div>
    </div>
  )
}
