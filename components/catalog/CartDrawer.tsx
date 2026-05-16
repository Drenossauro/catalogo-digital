'use client'

import { X, Trash2, MessageCircle, ShoppingBag } from 'lucide-react'
import { CartItem } from '@/types'
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp'

interface Props {
  items: CartItem[]
  onClose: () => void
  onRemove: (productId: string) => void
  onChangeQty: (productId: string, delta: number) => void
}

export default function CartDrawer({ items, onClose, onRemove, onChangeQty }: Props) {
  const total = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)

  function handleSendWhatsApp() {
    const message = buildWhatsAppMessage(items)
    const url = buildWhatsAppUrl(message)
    window.open(url, '_blank')
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <span className="font-semibold text-gray-900">Minha seleção</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
            <X size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <ShoppingBag size={48} strokeWidth={1} />
            <p className="text-sm">Nenhum item adicionado</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onChangeQty(product.id, -1)}
                      className="w-6 h-6 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-100 cursor-pointer text-sm font-medium"
                    >
                      −
                    </button>
                    <span className="w-4 text-center text-sm font-medium">{quantity}</span>
                    <button
                      onClick={() => onChangeQty(product.id, 1)}
                      className="w-6 h-6 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-100 cursor-pointer text-sm font-medium"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemove(product.id)}
                      className="ml-1 text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="p-4 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-sm font-semibold text-gray-900">
                <span>Total</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <button
                onClick={handleSendWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer"
              >
                <MessageCircle size={20} />
                Enviar pedido no WhatsApp
              </button>
              <p className="text-xs text-center text-gray-400">
                Você será redirecionado ao WhatsApp com a lista montada
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}
