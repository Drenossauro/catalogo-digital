'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ChevronRight, Settings } from 'lucide-react'
import { Product, Category, CartItem } from '@/types'
import { type ThemeConfig } from '@/lib/themes'
import { ThemeProvider } from './ThemeProvider'
import ProductCard from './ProductCard'
import CartDrawer from './CartDrawer'

interface Props {
  products: Product[]
  categories: Category[]
  whatsappNumber: string
  storeName: string
  maxInstallments: number
  theme: ThemeConfig
  logoUrl?: string | null
}

export default function CatalogClient({ products, categories, whatsappNumber, storeName, maxInstallments, theme, logoUrl }: Props) {
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
  const uncategorized = products.filter((p) => !p.categoryId)

  return (
    <ThemeProvider theme={theme}>
      <div
        className="w-full min-h-screen"
        style={{
          '--font-serif': theme.fontSerif,
          '--font-sans': theme.fontSans,
          background: theme.bg,
          color: theme.text,
        } as React.CSSProperties}
      >
        {/* header */}
        <header className="sticky top-0 z-30 backdrop-blur-md border-b" style={{ background: theme.navBg, borderColor: theme.border }}>
          <div className="w-full px-4 h-14 flex items-center justify-between">
            {logoUrl ? (
              <div className="relative h-8 w-28">
                <Image src={logoUrl} alt={storeName} fill className="object-contain object-left" />
              </div>
            ) : (
              <h1 className="font-serif text-xl tracking-wide" style={{ color: theme.text }}>✦ {storeName}</h1>
            )}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 cursor-pointer"
              aria-label="Abrir carrinho"
              style={{ color: theme.text }}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: theme.accent, color: theme.bg }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="pb-8">
          {categories.map((cat) => {
            const catProducts = products.filter((p) => p.categoryId === cat.id)
            if (catProducts.length === 0) return null
            return (
              <section key={cat.id} className="mt-8">
                <div className="flex items-center justify-between px-4 mb-3">
                  <h2 className="font-serif text-xl" style={{ color: theme.text }}>{cat.name}</h2>
                  <Link
                    href={`/categoria/${cat.slug}`}
                    className="flex items-center gap-0.5 text-xs transition-colors"
                    style={{ color: theme.textMuted }}
                  >
                    Ver tudo <ChevronRight size={13} />
                  </Link>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1 group">
                  {catProducts.map((product) => (
                    <div key={product.id} className="shrink-0 w-36">
                      <ProductCard product={product} onAdd={addToCart} size="sm" />
                    </div>
                  ))}
                  {catProducts.length >= 3 && (
                    <Link
                      href={`/categoria/${cat.slug}`}
                      className="shrink-0 w-28 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed transition-colors"
                      style={{ borderColor: theme.textFaint, color: theme.textFaint }}
                    >
                      <ChevronRight size={18} />
                      <span className="text-xs text-center leading-tight">Ver<br />tudo</span>
                    </Link>
                  )}
                </div>
              </section>
            )
          })}

          {uncategorized.length > 0 && (
            <section className="mt-8 px-4">
              <h2 className="font-serif text-xl mb-3" style={{ color: theme.text }}>Outros</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {uncategorized.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* rodapé */}
        <footer className="py-10 flex flex-col items-center gap-4">
          <a
            href={`https://wa.me/5567999541009?text=${encodeURIComponent('Oi! Gostaria de criar meu catálogo digital')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors border-b pb-0.5"
            style={{ color: theme.textMuted, borderColor: theme.textFaint }}
          >
            Crie seu catálogo digital ✦
          </a>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 transition-colors text-xs"
            style={{ color: theme.textFaint }}
          >
            <Settings size={11} strokeWidth={1.5} />
            Admin
          </Link>
        </footer>

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
      </div>
    </ThemeProvider>
  )
}
