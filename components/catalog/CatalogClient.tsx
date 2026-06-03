'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ChevronRight, Settings } from 'lucide-react'
import { Product, Category } from '@/types'
import { type ThemeConfig } from '@/lib/themes'
import { ThemeProvider } from './ThemeProvider'
import ProductCard from './ProductCard'
import CartDrawer from './CartDrawer'
import { useCart } from '@/hooks/useCart'

interface Props {
  products: Product[]
  categories: Category[]
  whatsappNumber: string
  storeName: string
  maxInstallments: number
  theme: ThemeConfig
  logoUrl?: string | null
  storeSlug?: string | null
}

export default function CatalogClient({ products, categories, whatsappNumber, storeName, maxInstallments, theme, logoUrl, storeSlug }: Props) {
  const { cart, addToCart, removeFromCart, changeQty, totalItems } = useCart(storeSlug)
  const [cartOpen, setCartOpen] = useState(false)

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
          {products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: theme.surface }}>
                <ShoppingBag size={22} strokeWidth={1.5} style={{ color: theme.textMuted }} />
              </div>
              <p className="text-base font-medium mb-1" style={{ color: theme.text }}>Em breve por aqui</p>
              <p className="text-sm" style={{ color: theme.textMuted }}>Esta loja ainda está preparando o catálogo.</p>
            </div>
          )}
          {categories.map((cat) => {
            const catProducts = products.filter((p) => p.categoryId === cat.id)
            if (catProducts.length === 0) return null
            return (
              <section key={cat.id} className="mt-8">
                {(() => {
                  const catHref = storeSlug
                    ? `/loja/${storeSlug}/categoria/${cat.slug}`
                    : `/categoria/${cat.slug}`
                  return (
                    <>
                      <div className="flex items-center justify-between px-4 mb-3">
                        <Link href={catHref} className="font-serif text-xl hover:opacity-70 transition-opacity" style={{ color: theme.text }}>
                          {cat.name}
                        </Link>
                        <Link
                          href={catHref}
                          className="flex items-center gap-0.5 text-xs transition-colors"
                          style={{ color: theme.textMuted }}
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
                            href={catHref}
                            className="shrink-0 w-28 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed transition-colors"
                            style={{ borderColor: theme.textFaint, color: theme.textFaint }}
                          >
                            <ChevronRight size={18} />
                            <span className="text-xs text-center leading-tight">Ver<br />tudo</span>
                          </Link>
                        )}
                      </div>
                    </>
                  )
                })()}
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
            storeSlug={storeSlug}
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
