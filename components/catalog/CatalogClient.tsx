'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { Product, Category, CartItem } from '@/types'
import ProductCard from './ProductCard'
import CartDrawer from './CartDrawer'

interface Props {
  products: Product[]
  categories: Category[]
  whatsappNumber: string
  storeName: string
  maxInstallments: number
}

export default function CatalogClient({ products, categories, whatsappNumber, storeName, maxInstallments }: Props) {
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

  // produtos sem categoria
  const uncategorized = products.filter((p) => !p.categoryId)

  return (
    <div className="w-full">
      {/* header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-serif text-xl tracking-wide text-[#1a1a1a]">✦ {storeName}</h1>
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 cursor-pointer"
            aria-label="Abrir carrinho"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#B8973A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="pb-16">
        {/* seção por categoria */}
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.categoryId === cat.id)
          if (catProducts.length === 0) return null
          return (
            <section key={cat.id} className="mt-8">
              <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="font-serif text-xl text-[#1a1a1a]">{cat.name}</h2>
                <Link
                  href={`/categoria/${cat.slug}`}
                  className="flex items-center gap-0.5 text-xs text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors"
                >
                  Ver tudo <ChevronRight size={13} />
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
                {catProducts.map((product) => (
                  <div key={product.id} className="shrink-0 w-36">
                    <ProductCard product={product} onAdd={addToCart} size="sm" />
                  </div>
                ))}
                {catProducts.length >= 3 && (
                  <Link
                    href={`/categoria/${cat.slug}`}
                    className="shrink-0 w-28 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#1a1a1a]/20 text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 hover:border-[#1a1a1a]/40 transition-colors"
                  >
                    <ChevronRight size={18} />
                    <span className="text-xs text-center leading-tight">Ver<br />tudo</span>
                  </Link>
                )}
              </div>
            </section>
          )
        })}

        {/* produtos sem categoria */}
        {uncategorized.length > 0 && (
          <section className="mt-8 px-4">
            <h2 className="font-serif text-xl text-[#1a1a1a] mb-3">Outros</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {uncategorized.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
            </div>
          </section>
        )}
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
    </div>
  )
}
