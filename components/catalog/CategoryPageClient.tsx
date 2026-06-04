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
      <main
        className="w-full px-5 py-8"
        style={{ background: theme.bg, minHeight: '100vh' }}
      >
        {products.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-32 text-center"
            style={{ color: theme.textFaint }}
          >
            <ShoppingBag size={36} strokeWidth={1} className="mb-4" />
            <p className="text-sm">Nenhum produto nesta categoria ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        )}
      </main>

      {totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-5 z-40 flex items-center gap-2.5 px-5 py-3.5 rounded-full shadow-xl cursor-pointer active:scale-95 transition-transform"
          style={{ background: theme.text, color: theme.bg }}
        >
          <ShoppingBag size={16} strokeWidth={1.5} />
          <span className="text-sm font-medium tracking-wide">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </span>
        </button>
      )}

      {cartOpen && (
        <CartDrawer
          items={cart}
          storeSlug={storeSlug}
          maxInstallments={maxInstallments}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
          onChangeQty={changeQty}
        />
      )}
    </ThemeProvider>
  )
}
