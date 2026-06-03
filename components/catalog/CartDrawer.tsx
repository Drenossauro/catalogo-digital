'use client'

import { X, Trash2, ShoppingBag, Minus, Plus, ArrowRight } from 'lucide-react'
import { CartItem } from '@/types'
import { useTheme } from './ThemeProvider'
import Link from 'next/link'

interface Props {
  items: CartItem[]
  storeSlug?: string | null
  maxInstallments: number
  onClose: () => void
  onRemove: (productId: string, variantLabel?: string) => void
  onChangeQty: (productId: string, delta: number, variantLabel?: string) => void
}

export default function CartDrawer({ items, storeSlug, maxInstallments, onClose, onRemove, onChangeQty }: Props) {
  const theme = useTheme()

  const total = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col"
        style={{ background: theme.bg, color: theme.text, fontFamily: theme.fontSans }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span className="font-serif text-lg">Seleção</span>
          </div>
          <button onClick={onClose} className="transition-colors cursor-pointer p-1" style={{ color: theme.textMuted }}>
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: theme.textFaint }}>
            <ShoppingBag size={40} strokeWidth={1} />
            <p className="text-sm">Nenhum item adicionado</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y" style={{ borderColor: theme.border }}>
              {items.map(({ product, quantity, variantLabel }) => {
                const k = `${product.id}::${variantLabel ?? ''}`
                return (
                  <li key={k} className="flex items-center gap-3 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug line-clamp-2" style={{ color: theme.text }}>
                        {product.name}
                      </p>
                      {variantLabel && (
                        <p className="text-xs mt-0.5" style={{ color: theme.textFaint }}>{variantLabel}</p>
                      )}
                      <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                        R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onChangeQty(product.id, -1, variantLabel)}
                        className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                        style={{ border: `1px solid ${theme.border}` }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-sm">{quantity}</span>
                      <button
                        onClick={() => onChangeQty(product.id, 1, variantLabel)}
                        className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                        style={{ border: `1px solid ${theme.border}` }}
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => onRemove(product.id, variantLabel)}
                        className="ml-1 hover:text-red-400 transition-colors cursor-pointer"
                        style={{ color: theme.textFaint }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="px-5 py-4 border-t space-y-4" style={{ borderColor: theme.border }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: theme.textMuted }}>Total</span>
                <span className="font-semibold">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>

              {storeSlug ? (
                <Link
                  href={`/loja/${storeSlug}/pedido`}
                  className="w-full flex items-center justify-center gap-2 text-white font-medium py-3 rounded-xl transition-all text-sm"
                  style={{ background: theme.text }}
                  onClick={onClose}
                >
                  <span>Fazer pedido</span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <p className="text-xs text-center" style={{ color: theme.textFaint }}>
                  Configure o WhatsApp da loja para habilitar pedidos.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
