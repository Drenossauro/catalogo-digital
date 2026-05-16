'use client'

import { useState } from 'react'
import { X, Trash2, MessageCircle, ShoppingBag, Minus, Plus } from 'lucide-react'
import { CartItem } from '@/types'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp'

interface Props {
  items: CartItem[]
  whatsappNumber: string
  maxInstallments: number
  onClose: () => void
  onRemove: (productId: string) => void
  onChangeQty: (productId: string, delta: number) => void
}

export default function CartDrawer({ items, whatsappNumber, maxInstallments, onClose, onRemove, onChangeQty }: Props) {
  const [installments, setInstallments] = useState(1)

  const total = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)

  function handleSendWhatsApp() {
    const message = buildWhatsAppMessage(items, installments, total / installments)
    window.open(buildWhatsAppUrl(message, whatsappNumber), '_blank')
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#FAF8F5] z-50 flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/8">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span className="font-serif text-lg">Seleção</span>
          </div>
          <button onClick={onClose} className="text-[#1a1a1a]/40 hover:text-[#1a1a1a] transition-colors cursor-pointer p-1">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#1a1a1a]/30">
            <ShoppingBag size={40} strokeWidth={1} />
            <p className="text-sm">Nenhum item adicionado</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-black/5">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-3 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1a1a1a] leading-snug line-clamp-2">{product.name}</p>
                    <p className="text-xs text-[#1a1a1a]/50 mt-0.5">
                      R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => onChangeQty(product.id, -1)} className="w-7 h-7 border border-black/15 rounded-full flex items-center justify-center hover:bg-black/5 cursor-pointer transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-sm">{quantity}</span>
                    <button onClick={() => onChangeQty(product.id, 1)} className="w-7 h-7 border border-black/15 rounded-full flex items-center justify-center hover:bg-black/5 cursor-pointer transition-colors">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => onRemove(product.id)} className="ml-1 text-[#1a1a1a]/20 hover:text-red-400 transition-colors cursor-pointer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="px-5 py-4 border-t border-black/8 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#1a1a1a]/60">Total</span>
                <span className="font-semibold">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>

              {maxInstallments > 1 && (
                <div>
                  <p className="text-xs text-[#1a1a1a]/50 mb-2">Parcelamento</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => setInstallments(n)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer whitespace-nowrap ${
                          installments === n
                            ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                            : 'border-black/15 text-[#1a1a1a]/60 hover:border-black/30'
                        }`}
                      >
                        {n === 1 ? 'À vista' : `${n}x R$ ${(total / n).toFixed(2).replace('.', ',')}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleSendWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb856] active:scale-95 text-white font-medium py-3 rounded-xl transition-all cursor-pointer text-sm"
              >
                <MessageCircle size={18} />
                Enviar pedido no WhatsApp
              </button>
              <p className="text-xs text-center text-[#1a1a1a]/30">
                Você será redirecionado ao WhatsApp com a lista montada
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}
