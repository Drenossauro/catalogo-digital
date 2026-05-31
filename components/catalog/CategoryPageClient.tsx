'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { Product } from '@/types'
import { type ThemeConfig } from '@/lib/themes'
import { ThemeProvider } from './ThemeProvider'
import ProductCard from './ProductCard'
import CartDrawer from './CartDrawer'
import { useCart } from '@/hooks/useCart'

interface Props {
  products: Product[]
  whatsappNumber: string
  maxInstallments: number
  theme: ThemeConfig
  storeSlug?: string | null
}

export default function CategoryPageClient({ products, whatsappNumber, maxInstallments, theme, storeSlug }: Props) {
  const { cart, addToCart, removeFromCart, changeQty, totalItems } = useCart(storeSlug)
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <ThemeProvider theme={theme}>
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
          className="fixed bottom-6 right-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg cursor-pointer active:scale-95 transition-transform"
          style={{ background: theme.text, color: theme.bg }}
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
    </ThemeProvider>
  )
}
