'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { Product, CartItem } from '@/types'
import ProductCard from './ProductCard'
import CartDrawer from './CartDrawer'

interface Props {
  products: Product[]
  whatsappNumber: string
  maxInstallments: number
}

export default function CategoryPageClient({ products, whatsappNumber, maxInstallments }: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId))
  }

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev.map((i) => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i)
          .filter((i) => i.quantity > 0)
    )
  }

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={addToCart} />
          ))}
        </div>
      </main>

      {totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-4 z-40 flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-3 rounded-full shadow-lg cursor-pointer active:scale-95 transition-transform"
        >
          <ShoppingBag size={16} strokeWidth={1.5} />
          <span className="text-sm font-medium">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
        </button>
      )}

      {cartOpen && (
        <CartDrawer
          items={cart}
          whatsappNumber={whatsappNumber}
          maxInstallments={maxInstallments}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
          onChangeQty={changeQty}
        />
      )}
    </>
  )
}
