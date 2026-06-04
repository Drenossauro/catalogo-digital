'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingBag, Plus, Minus, Check, ShoppingCart } from 'lucide-react'
import { Product, ProductVariantOption } from '@/types'
import { type ThemeConfig } from '@/lib/themes'
import { ThemeProvider } from './ThemeProvider'
import CartDrawer from './CartDrawer'
import { useCart } from '@/hooks/useCart'

interface Props {
  product: Product
  storeSlug: string
  maxInstallments: number
  theme: ThemeConfig
}

export default function ProductDetailClient({ product, storeSlug, maxInstallments, theme }: Props) {
  const { cart, addToCart, removeFromCart, changeQty, totalItems } = useCart(storeSlug)
  const [cartOpen, setCartOpen] = useState(false)
  const [selected, setSelected] = useState<Record<string, ProductVariantOption>>({})
  const [added, setAdded] = useState(false)

  const hasVariants = product.variants && product.variants.length > 0

  function computePrice() {
    const extra = Object.values(selected).reduce((sum, o) => sum + (o.price_modifier ?? 0), 0)
    return product.price + extra
  }

  function buildVariantLabel() {
    if (!product.variants?.length) return undefined
    const parts = product.variants
      .map((v) => selected[v.id] ? `${v.label}: ${selected[v.id].value}` : null)
      .filter(Boolean)
    return parts.length > 0 ? parts.join(' / ') : undefined
  }

  function allRequiredSelected() {
    if (!hasVariants) return true
    return !product.variants!.some((v) => v.required && !selected[v.id])
  }

  function handleAdd() {
    if (!allRequiredSelected()) return
    addToCart(product, buildVariantLabel())
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const displayPrice = computePrice()

  const installmentValue = maxInstallments > 1
    ? (displayPrice / maxInstallments).toFixed(2).replace('.', ',')
    : null

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          '--font-serif': theme.fontSerif,
          '--font-sans': theme.fontSans,
        } as React.CSSProperties}
      >
        {/* Imagem principal */}
        <div className="relative w-full aspect-square sm:aspect-[4/3] overflow-hidden" style={{ background: theme.surface }}>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: theme.textFaint }}>
              <span className="font-serif text-6xl">✦</span>
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div className="px-5 pt-6 pb-32">
          {/* Nome e preço */}
          <div className="mb-5">
            <h1
              className="font-serif text-3xl leading-tight tracking-wide mb-2"
              style={{ color: theme.text }}
            >
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold" style={{ color: theme.accent }}>
                R$ {displayPrice.toFixed(2).replace('.', ',')}
              </span>
              {installmentValue && maxInstallments > 1 && (
                <span className="text-sm" style={{ color: theme.textMuted }}>
                  ou {maxInstallments}× de R$ {installmentValue}
                </span>
              )}
            </div>
          </div>

          {/* Divisor */}
          <div className="h-px mb-5" style={{ background: theme.border }} />

          {/* Variantes */}
          {hasVariants && (
            <div className="mb-6 space-y-5">
              {product.variants!.map((variant) => (
                <div key={variant.id}>
                  <p
                    className="text-[11px] uppercase tracking-widest font-medium mb-3"
                    style={{ color: theme.textMuted }}
                  >
                    {variant.label}
                    {variant.required && <span style={{ color: theme.accent }}> *</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((opt) => {
                      const isSelected = selected[variant.id]?.value === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setSelected((prev) => ({ ...prev, [variant.id]: opt }))}
                          className="px-4 py-2 text-sm rounded-full cursor-pointer transition-all"
                          style={
                            isSelected
                              ? { background: theme.text, color: theme.bg, border: `1.5px solid ${theme.text}` }
                              : { background: 'transparent', color: theme.text, border: `1.5px solid ${theme.border}` }
                          }
                        >
                          {opt.value}
                          {opt.price_modifier > 0 && (
                            <span className="ml-1 text-xs opacity-70">
                              +R${opt.price_modifier.toFixed(0)}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Descrição */}
          {product.description && (
            <div>
              <p
                className="text-[11px] uppercase tracking-widest font-medium mb-3"
                style={{ color: theme.textMuted }}
              >
                Descrição
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: theme.textMuted }}
              >
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* CTA fixo no rodapé */}
        <div
          className="fixed bottom-0 left-0 right-0 z-20 px-5 py-4 border-t"
          style={{ background: theme.bg, borderColor: theme.border }}
        >
          <div className="flex gap-3 items-center max-w-lg mx-auto">
            {/* Botão abrir carrinho */}
            {totalItems > 0 && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative shrink-0 w-12 h-12 rounded-full flex items-center justify-center border cursor-pointer transition-opacity hover:opacity-70"
                style={{ borderColor: theme.border, color: theme.text }}
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                <span
                  className="absolute -top-1 -right-1 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: theme.accent, color: '#fff' }}
                >
                  {totalItems}
                </span>
              </button>
            )}

            {/* Botão adicionar */}
            <button
              onClick={handleAdd}
              disabled={!allRequiredSelected()}
              className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full text-sm font-medium tracking-wide cursor-pointer transition-all disabled:opacity-40 active:scale-[0.98]"
              style={
                added
                  ? { background: theme.accent, color: '#fff' }
                  : { background: theme.text, color: theme.bg }
              }
            >
              {added ? (
                <>
                  <Check size={16} strokeWidth={2} />
                  Adicionado!
                </>
              ) : (
                <>
                  <ShoppingCart size={16} strokeWidth={1.5} />
                  {hasVariants && !allRequiredSelected()
                    ? 'Selecione as opções'
                    : 'Adicionar ao carrinho'}
                </>
              )}
            </button>
          </div>
        </div>

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
