'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Settings } from 'lucide-react'
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
  const categoriesWithProducts = categories.filter((cat) =>
    products.some((p) => p.categoryId === cat.id)
  )

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
        {/* Header principal */}
        <header className="sticky top-0 z-30 backdrop-blur-md" style={{ background: theme.navBg }}>
          <div className="w-full px-5 h-14 flex items-center justify-between border-b" style={{ borderColor: theme.border }}>
            {logoUrl ? (
              <div className="relative h-8 w-32">
                <Image src={logoUrl} alt={storeName} fill className="object-contain object-left" />
              </div>
            ) : (
              <span className="font-serif text-lg tracking-wide" style={{ color: theme.text }}>{storeName}</span>
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
                  style={{ background: theme.accent, color: '#fff' }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Pills de categoria */}
          {categoriesWithProducts.length > 0 && (
            <div
              className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-2.5 border-b"
              style={{ borderColor: theme.border }}
            >
              {categoriesWithProducts.map((cat) => {
                const catHref = storeSlug
                  ? `/loja/${storeSlug}/categoria/${cat.slug}`
                  : `/categoria/${cat.slug}`
                return (
                  <Link
                    key={cat.id}
                    href={catHref}
                    className="shrink-0 px-3.5 py-1 rounded-full text-[11px] font-medium tracking-widest uppercase whitespace-nowrap transition-all"
                    style={{
                      border: `1px solid ${theme.border}`,
                      color: theme.textMuted,
                    }}
                  >
                    {cat.name}
                  </Link>
                )
              })}
            </div>
          )}
        </header>

        <main className="pb-12">
          {/* Estado vazio */}
          {products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                style={{ background: theme.surface }}
              >
                <ShoppingBag size={22} strokeWidth={1.2} style={{ color: theme.textFaint }} />
              </div>
              <p className="font-serif text-xl mb-1.5" style={{ color: theme.text }}>Em breve</p>
              <p className="text-sm" style={{ color: theme.textMuted }}>
                Esta loja está preparando o catálogo.
              </p>
            </div>
          )}

          {/* Seções por categoria */}
          {categoriesWithProducts.map((cat) => {
            const catProducts = products.filter((p) => p.categoryId === cat.id)
            const catHref = storeSlug
              ? `/loja/${storeSlug}/categoria/${cat.slug}`
              : `/categoria/${cat.slug}`

            return (
              <section key={cat.id} className="mt-10">
                {/* Cabeçalho da categoria */}
                <div className="flex items-baseline justify-between px-5 mb-4">
                  <Link
                    href={catHref}
                    className="font-serif text-2xl leading-none tracking-wide transition-opacity hover:opacity-60"
                    style={{ color: theme.text }}
                  >
                    {cat.name}
                  </Link>
                  <Link
                    href={catHref}
                    className="text-[11px] tracking-widest uppercase transition-opacity hover:opacity-70"
                    style={{ color: theme.textMuted }}
                  >
                    Ver tudo
                  </Link>
                </div>

                {/* Scroll horizontal de produtos */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-1">
                  {catProducts.map((product) => (
                    <div key={product.id} className="shrink-0 w-40">
                      <ProductCard product={product} onAdd={addToCart} size="sm" />
                    </div>
                  ))}
                  {catProducts.length >= 3 && (
                    <Link
                      href={catHref}
                      className="shrink-0 w-32 flex flex-col items-center justify-center gap-2 rounded-xl transition-colors text-center"
                      style={{ background: theme.surface, color: theme.textFaint }}
                    >
                      <span className="text-xs tracking-widest uppercase leading-relaxed">
                        Ver<br />todos
                      </span>
                    </Link>
                  )}
                </div>
              </section>
            )
          })}

          {/* Produtos sem categoria */}
          {uncategorized.length > 0 && (
            <section className="mt-10 px-5">
              <h2 className="font-serif text-2xl tracking-wide mb-4" style={{ color: theme.text }}>
                Outros
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6">
                {uncategorized.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Rodapé */}
        <footer className="py-12 flex flex-col items-center gap-4 border-t" style={{ borderColor: theme.border }}>
          <a
            href={`https://wa.me/5567999541009?text=${encodeURIComponent('Oi! Gostaria de criar meu catálogo digital')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
            style={{ color: theme.textMuted }}
          >
            Crie seu catálogo digital
          </a>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase transition-opacity hover:opacity-60"
            style={{ color: theme.textFaint }}
          >
            <Settings size={10} strokeWidth={1.5} />
            Admin
          </Link>
        </footer>

        {/* Botão flutuante do carrinho */}
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
      </div>
    </ThemeProvider>
  )
}
